"""Registers the dashboard card as a Lovelace resource.

Dashboards wait for their resources before drawing cards, and other plugins (some load a polyfill
that swaps the custom element registry) are loaded the same way, so the card is defined where
dashboards look for it. Only in storage mode: YAML resources belong to the user (README explains).

The resource is the loader the integration serves itself (registered in async_setup, as early as
Home Assistant lets an integration). Up to 0.17 it was a retrying loader written to
/config/www/virtuhome; that file goes, and its resource is pointed at the served loader.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant

from .const import LOADER_FILE, URL_BASE

_LOGGER = logging.getLogger(__name__)

# what versions up to 0.17 wrote and registered (gone since)
OLD_WWW_DIR = "virtuhome"
OLD_WWW_FILE = "card-loader.js"
OLD_WWW_URL = f"/local/{OLD_WWW_DIR}/{OLD_WWW_FILE}"
# set once the card's resource was put right in this Home Assistant run (after it has started)
DATA_REGISTERED = "virtuhome_card_registered"


def _resources(hass: HomeAssistant) -> Any | None:
    """Lovelace's resource collection when it can be changed (storage mode)."""
    data = hass.data.get("lovelace")
    if data is None:
        return None
    resources = data.get("resources") if isinstance(data, dict) else getattr(data, "resources", None)
    if resources is None or not hasattr(resources, "async_create_item"):
        return None
    return resources


def _ours(url: str) -> bool:
    return url.startswith((f"{URL_BASE}/{LOADER_FILE}", OLD_WWW_URL))


def _remove_old_loader(config_dir: Path) -> None:
    loader = config_dir / "www" / OLD_WWW_DIR / OLD_WWW_FILE
    loader.unlink(missing_ok=True)
    try:
        loader.parent.rmdir()
    except OSError:
        # not there, or the user keeps their own files in it
        pass


async def async_register(hass: HomeAssistant, version: str) -> None:
    """Adds (or updates) the card's resource."""
    try:
        await _async_register(hass, version)
    finally:
        hass.data[DATA_REGISTERED] = True


async def _async_register(hass: HomeAssistant, version: str) -> None:
    await hass.async_add_executor_job(_remove_old_loader, Path(hass.config.path()))
    resources = _resources(hass)
    if resources is None:
        _LOGGER.info("Lovelace resources are in YAML mode: add %s/%s as a module resource", URL_BASE, LOADER_FILE)
        return
    if not resources.loaded:
        await resources.async_load()
        resources.loaded = True
    url = f"{URL_BASE}/{LOADER_FILE}?v={version}"
    items = [i for i in resources.async_items() if _ours(i.get("url", ""))]
    if items and items[0]["url"] == url and len(items) == 1:
        return
    for extra in items[1:]:
        await resources.async_delete_item(extra["id"])
    if items:
        await resources.async_update_item(items[0]["id"], {"res_type": "module", "url": url})
    else:
        await resources.async_create_item({"res_type": "module", "url": url})


async def async_state(hass: HomeAssistant, version: str) -> dict[str, Any]:
    """How the card reaches dashboards, for diagnostics: the resource URLs and whether they're current.

    pending: Home Assistant is still starting and the resource wasn't put right yet, so after an
    update it can still name the old version; that is not known yet rather than wrong.
    """
    resources = _resources(hass)
    pending = not hass.data.get(DATA_REGISTERED)
    if resources is None:
        mode = "not loaded" if hass.data.get("lovelace") is None else "yaml"
        return {"mode": mode, "pending": pending}
    if not resources.loaded:
        await resources.async_load()
        resources.loaded = True
    urls = [i.get("url", "") for i in resources.async_items() if _ours(i.get("url", ""))]
    return {
        "mode": "storage",
        "urls": urls,
        "current": len(urls) == 1 and urls[0].endswith(f"?v={version}"),
        "pending": pending,
    }


async def async_unregister(hass: HomeAssistant) -> None:
    """Removes the resource (when the integration is removed), and an old loader left in www."""
    resources = _resources(hass)
    if resources is not None:
        if not resources.loaded:
            await resources.async_load()
            resources.loaded = True
        for item in [i for i in resources.async_items() if _ours(i.get("url", ""))]:
            await resources.async_delete_item(item["id"])
    await hass.async_add_executor_job(_remove_old_loader, Path(hass.config.path()))
