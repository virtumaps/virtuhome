"""Paid extensions: activate a licence key, download the extensions it unlocks, keep them updated.

Nothing here talks to the internet unless a licence key was entered. Once activated, extensions are
stored locally and keep working offline; a daily check fetches updates and renews the licence.
"""

from __future__ import annotations

import logging
import time
from datetime import timedelta
from pathlib import Path
from typing import Any

import aiohttp

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import instance_id
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.storage import Store

from .const import DOMAIN, EXT_URL_BASE, LICENCE_KEY_STORE, STORAGE_VERSION
from .licensing import LicenceError, installation_hash, verify_bundle, verify_token

_LOGGER = logging.getLogger(__name__)
TIMEOUT = aiohttp.ClientTimeout(total=30)


class ExtensionManager:
    def __init__(self, hass: HomeAssistant, server: str) -> None:
        self.hass = hass
        self.server = server.rstrip("/")
        self.folder = Path(hass.config.path(".virtuhome", "extensions"))
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, LICENCE_KEY_STORE)
        self.data: dict[str, Any] = {}
        self.instance = ""
        self.status = "none"  # none | active | expired | invalid
        self.error: str | None = None
        self._unsub_timer = None

    async def async_load(self) -> None:
        self.instance = installation_hash(await instance_id.async_get(self.hass))
        self.data = await self._store.async_load() or {}
        self._check()
        if self.data.get("key"):
            self._unsub_timer = async_track_time_interval(self.hass, self._daily, timedelta(hours=24))

    @callback
    def async_unload(self) -> None:
        if self._unsub_timer:
            self._unsub_timer()
            self._unsub_timer = None

    def _check(self) -> dict[str, Any] | None:
        token = self.data.get("token")
        if not token:
            self.status = "none"
            return None
        try:
            payload = verify_token(token, self.instance)
        except LicenceError as err:
            self.status = "expired" if "expired" in str(err) else "invalid"
            self.error = str(err)
            return None
        self.status = "active"
        return payload

    # ------------------------------------------------------------------ what the frontend loads

    def extensions(self) -> list[dict[str, str]]:
        """Extensions to load now: unlocked by a valid licence and present on disk."""
        payload = self._check()
        if not payload:
            return []
        unlocked = set(payload.get("ext", []))
        out = []
        for ext in self.data.get("extensions", []):
            if ext["id"] in unlocked and (self.folder / ext["file"]).is_file():
                out.append({"id": ext["id"], "name": ext["name"], "version": ext["version"], "url": f"{EXT_URL_BASE}/{ext['file']}"})
        return out

    def summary(self) -> dict[str, Any]:
        key = self.data.get("key") or ""
        return {
            "status": self.status,
            "error": self.error,
            "key_hint": f"{key[:4]}…{key[-4:]}" if len(key) > 8 else None,
            "extensions": [{k: e[k] for k in ("id", "name", "version")} for e in self.data.get("extensions", [])],
            "checked": self.data.get("checked"),
            "server": self.server,
        }

    # ------------------------------------------------------------------ licence server

    async def _post(self, path: str, body: dict[str, Any]) -> dict[str, Any]:
        session = async_get_clientsession(self.hass)
        async with session.post(f"{self.server}{path}", json=body, timeout=TIMEOUT) as resp:
            data = await resp.json(content_type=None)
            if resp.status >= 400:
                raise LicenceError(data.get("message") or data.get("error") or f"licence server answered {resp.status}")
            return data

    async def async_catalog(self) -> list[dict[str, Any]]:
        """What can be bought (names, prices, checkout links)."""
        session = async_get_clientsession(self.hass)
        async with session.get(f"{self.server}/v1/catalog", timeout=TIMEOUT) as resp:
            resp.raise_for_status()
            return (await resp.json(content_type=None)).get("extensions", [])

    async def async_activate(self, key: str) -> dict[str, Any]:
        key = key.strip()
        data = await self._post("/v1/activate", {
            "key": key, "instance": self.instance, "label": self.hass.config.location_name or "Home Assistant",
        })
        await self._accept(key, data)
        if not self._unsub_timer:
            self._unsub_timer = async_track_time_interval(self.hass, self._daily, timedelta(hours=24))
        return self.summary()

    async def async_refresh(self) -> dict[str, Any]:
        key = self.data.get("key")
        if not key:
            return self.summary()
        try:
            data = await self._post("/v1/refresh", {"key": key, "activation": self.data.get("activation"), "instance": self.instance})
        except (aiohttp.ClientError, TimeoutError) as err:
            # offline: keep what is installed, the token carries its own expiry
            self.error = f"could not reach the licence server: {err}"
            return self.summary()
        except LicenceError as err:
            if "revoked" in str(err) or "not found" in str(err).lower():
                await self._wipe()
            self.error = str(err)
            return self.summary()
        await self._accept(key, data)
        return self.summary()

    async def async_remove(self) -> dict[str, Any]:
        key = self.data.get("key")
        if key:
            try:
                await self._post("/v1/deactivate", {"key": key, "activation": self.data.get("activation"), "instance": self.instance})
            except (aiohttp.ClientError, TimeoutError, LicenceError) as err:
                _LOGGER.warning("Could not free the activation on the licence server: %s", err)
        await self._wipe()
        return self.summary()

    async def _accept(self, key: str, data: dict[str, Any]) -> None:
        """Checks the new token, downloads and verifies the unlocked extensions, then stores it all."""
        token = data["token"]
        payload = verify_token(token, self.instance)
        unlocked = set(payload.get("ext", []))
        catalog = [e for e in data.get("extensions", []) if e["id"] in unlocked]
        await self.hass.async_add_executor_job(lambda: self.folder.mkdir(parents=True, exist_ok=True))
        session = async_get_clientsession(self.hass)
        installed = []
        for ext in catalog:
            file = f"{ext['id']}-{ext['version']}.js"
            path = self.folder / file
            if not await self.hass.async_add_executor_job(path.is_file):
                async with session.get(
                    f"{self.server}/v1/extensions/{ext['id']}/{ext['version']}",
                    headers={"Authorization": f"Bearer {token}"}, timeout=TIMEOUT,
                ) as resp:
                    resp.raise_for_status()
                    body = await resp.read()
                verify_bundle(ext["id"], ext["version"], body, ext["sha256"], ext["sig"])
                await self.hass.async_add_executor_job(path.write_bytes, body)
            installed.append({"id": ext["id"], "name": ext.get("name", ext["id"]), "version": ext["version"], "file": file})
        await self.hass.async_add_executor_job(self._prune, {e["file"] for e in installed})
        self.data = {"key": key, "activation": data.get("activation"), "token": token, "extensions": installed, "checked": time.time()}
        self.error = None
        await self._store.async_save(self.data)
        self._check()

    def _prune(self, keep: set[str]) -> None:
        if not self.folder.is_dir():
            return
        for f in self.folder.glob("*.js"):
            if f.name not in keep:
                f.unlink(missing_ok=True)

    async def _wipe(self) -> None:
        self.data = {}
        await self.hass.async_add_executor_job(self._prune, set())
        await self._store.async_remove()
        self._check()

    async def _daily(self, _now: Any = None) -> None:
        await self.async_refresh()
