"""VirtuHome: your home as a live 3D model in Home Assistant."""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration

from . import websocket
from .const import (
    CONF_LICENCE_SERVER, DEFAULT_LICENCE_SERVER, DOMAIN, EXT_URL_BASE, LOADER_FILE, PANEL_ELEMENT, PANEL_ICON,
    PANEL_PATH, PANEL_TITLE, URL_BASE,
)
from .extensions import ExtensionManager
from .storage import PlanStore

_LOGGER = logging.getLogger(__name__)

FRONTEND_DIR = Path(__file__).parent / "frontend"
DATA_STATIC = f"{DOMAIN}_static_registered"


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    store = PlanStore(hass)
    await store.async_load()
    hass.data[DOMAIN] = store
    ext = ExtensionManager(hass, entry.options.get(CONF_LICENCE_SERVER) or DEFAULT_LICENCE_SERVER)
    await ext.async_load()
    store.extension_manager = ext
    entry.async_on_unload(entry.add_update_listener(_options_updated))

    integration = await async_get_integration(hass, DOMAIN)
    version = str(integration.version)

    # static files and WebSocket commands cannot be unregistered: once per Home Assistant run
    if not hass.data.get(DATA_STATIC):
        ext_dir = Path(hass.config.path(".virtuhome", "extensions"))
        await hass.async_add_executor_job(lambda: ext_dir.mkdir(parents=True, exist_ok=True))
        await hass.http.async_register_static_paths([
            StaticPathConfig(URL_BASE, str(FRONTEND_DIR), cache_headers=False),
            # extension files carry their version in the name, so caching them is safe
            StaticPathConfig(EXT_URL_BASE, str(ext_dir), cache_headers=True),
        ])
        websocket.async_register(hass)
        hass.data[DATA_STATIC] = True

    # the loader is tiny; it defines the card and panel elements and fetches the 3D engine only
    # where one of them is actually shown
    loader_url = f"{URL_BASE}/{LOADER_FILE}?v={version}"
    frontend.add_extra_js_url(hass, loader_url)
    hass.data[f"{DOMAIN}_loader_url"] = loader_url

    await panel_custom.async_register_panel(
        hass,
        webcomponent_name=PANEL_ELEMENT,
        frontend_url_path=PANEL_PATH,
        module_url=loader_url,
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        require_admin=False,
        config={"version": version},
    )
    _LOGGER.debug("VirtuHome %s set up, plan revision %s", version, store.revision)
    return True


async def _options_updated(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    store: PlanStore | None = hass.data.get(DOMAIN)
    if store and store.extension_manager:
        store.extension_manager.async_unload()
    frontend.async_remove_panel(hass, PANEL_PATH)
    if loader_url := hass.data.pop(f"{DOMAIN}_loader_url", None):
        frontend.remove_extra_js_url(hass, loader_url)
    hass.data.pop(DOMAIN, None)
    return True
