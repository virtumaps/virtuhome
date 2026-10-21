"""Registers the dashboard card as a Lovelace resource.

Dashboards wait for their resources before drawing cards, and other plugins (some load a polyfill
that swaps the custom element registry) are loaded the same way, so the card is defined where
dashboards look for it. Only in storage mode: YAML resources belong to the user (README explains).

While Home Assistant starts, dashboards can be served before this integration registered its static
path, so the resource is a tiny loader in /config/www (served as /local from the start) that keeps
retrying until the card's script is there. Without a www folder at startup /local is not served yet;
then the script itself is the resource until the next restart.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant

from .const import LOADER_FILE, URL_BASE

_LOGGER = logging.getLogger(__name__)

WWW_DIR = "virtuhome"
WWW_FILE = "card-loader.js"
WWW_URL = f"/local/{WWW_DIR}/{WWW_FILE}"
# set once the card's resource was put right in this Home Assistant run (after it has started)
DATA_REGISTERED = "virtuhome_card_registered"

_RETRY_LOADER = """// VirtuHome: loads the dashboard card (written by the integration, changes are overwritten).
// Dashboards opened while Home Assistant is still starting get nothing at first, so this retries.
const url = "{url}";
const tryLoad = async (n) => {{
  try {{
    await import(n ? `${{url}}&retry=${{n}}` : url);
  }} catch (err) {{
    // not served yet
  }}
}};
await tryLoad(0);
(async () => {{
  for (let n = 1; n <= 120 && !customElements.get("virtuhome-card"); n++) {{
    await new Promise((done) => setTimeout(done, 5000));
    await tryLoad(n);
  }}
}})();
"""


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
    return url.startswith((f"{URL_BASE}/{LOADER_FILE}", WWW_URL))


def _write_loader(www: Path, card_url: str) -> None:
    folder = www / WWW_DIR
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / WWW_FILE
    text = _RETRY_LOADER.format(url=card_url.replace('"', ""))
    if not path.exists() or path.read_text(encoding="utf-8") != text:
        path.write_text(text, encoding="utf-8")


async def async_register(hass: HomeAssistant, version: str) -> None:
    """Adds (or updates) the card's resource."""
    try:
        await _async_register(hass, version)
    finally:
        hass.data[DATA_REGISTERED] = True


async def _async_register(hass: HomeAssistant, version: str) -> None:
    resources = _resources(hass)
    if resources is None:
        _LOGGER.info("Lovelace resources are in YAML mode: add %s/%s as a module resource", URL_BASE, LOADER_FILE)
        return
    if not resources.loaded:
        await resources.async_load()
        resources.loaded = True
    card_url = f"{URL_BASE}/{LOADER_FILE}?v={version}"
    www = Path(hass.config.path("www"))
    # /local is only served when the www folder existed at startup
    www_served = await hass.async_add_executor_job(www.is_dir)
    url = card_url
    if www_served:
        await hass.async_add_executor_job(_write_loader, www, card_url)
        url = f"{WWW_URL}?v={version}"
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
    loader = Path(hass.config.path("www", WWW_DIR, WWW_FILE))
    www_loader = await hass.async_add_executor_job(loader.is_file)
    pending = not hass.data.get(DATA_REGISTERED)
    if resources is None:
        mode = "not loaded" if hass.data.get("lovelace") is None else "yaml"
        return {"mode": mode, "www_loader": www_loader, "pending": pending}
    if not resources.loaded:
        await resources.async_load()
        resources.loaded = True
    urls = [i.get("url", "") for i in resources.async_items() if _ours(i.get("url", ""))]
    return {
        "mode": "storage",
        "urls": urls,
        "current": len(urls) == 1 and urls[0].endswith(f"?v={version}"),
        "www_loader": www_loader,
        "pending": pending,
    }


async def async_unregister(hass: HomeAssistant) -> None:
    """Removes the resource and the loader (when the integration is removed)."""
    resources = _resources(hass)
    if resources is not None:
        if not resources.loaded:
            await resources.async_load()
            resources.loaded = True
        for item in [i for i in resources.async_items() if _ours(i.get("url", ""))]:
            await resources.async_delete_item(item["id"])
    loader = Path(hass.config.path("www", WWW_DIR, WWW_FILE))

    def _remove() -> None:
        loader.unlink(missing_ok=True)
        try:
            loader.parent.rmdir()
        except OSError:
            pass

    await hass.async_add_executor_job(_remove)
