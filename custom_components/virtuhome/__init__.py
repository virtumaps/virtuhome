"""VirtuHome: your home as a live 3D model in Home Assistant."""

from __future__ import annotations

import logging
from datetime import timedelta
from pathlib import Path
from typing import Any

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import CoreState, Event, HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.typing import ConfigType
from homeassistant.loader import async_get_integration

from . import card_resource, websocket
from .backgrounds import Backgrounds
from .const import (
    CONF_LICENCE_SERVER, DOMAIN, EXT_URL_BASE, LOADER_FILE, PANEL_ELEMENT, PANEL_ICON,
    PANEL_PATH, PANEL_TITLE, URL_BASE,
)
from .extensions import ExtensionManager
from .repair_issues import async_update_issues
from .storage import PlanStore
from .views import BackgroundView

_LOGGER = logging.getLogger(__name__)

FRONTEND_DIR = Path(__file__).parent / "frontend"
DATA_BACKGROUNDS = f"{DOMAIN}_backgrounds"

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Static files, views and WebSocket commands: once per Home Assistant run (they can't be
    unregistered), and before the config entry so the card's resource is served as early as can be;
    dashboards opened while Home Assistant starts may still ask before this."""
    ext_dir = Path(hass.config.path(".virtuhome", "extensions"))
    await hass.async_add_executor_job(lambda: ext_dir.mkdir(parents=True, exist_ok=True))
    await hass.http.async_register_static_paths([
        StaticPathConfig(URL_BASE, str(FRONTEND_DIR), cache_headers=False),
        # extension files carry their version in the name, so caching them is safe
        StaticPathConfig(EXT_URL_BASE, str(ext_dir), cache_headers=True),
    ])
    # floor plan images to trace over; kept across reloads, like the view that serves them
    hass.data[DATA_BACKGROUNDS] = Backgrounds(Path(hass.config.path(".virtuhome", "backgrounds")))
    hass.http.register_view(BackgroundView(hass, hass.data[DATA_BACKGROUNDS]))
    websocket.async_register(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    store = PlanStore(hass)
    await store.async_load()
    store.backgrounds = hass.data[DATA_BACKGROUNDS]
    hass.data[DOMAIN] = store
    ext = ExtensionManager(hass, entry.options.get(CONF_LICENCE_SERVER))
    await ext.async_load()
    store.extension_manager = ext
    entry.async_on_unload(entry.add_update_listener(_options_updated))

    integration = await async_get_integration(hass, DOMAIN)
    version = str(integration.version)

    # the loader is tiny; it defines the card and panel elements and fetches the 3D engine only
    # where one of them is actually shown. Dashboards get it as a Lovelace resource, the panel directly.
    loader_url = f"{URL_BASE}/{LOADER_FILE}?v={version}"

    async def _register_card(_event: Event | None = None) -> None:
        try:
            await card_resource.async_register(hass, version)
        except Exception:  # noqa: BLE001 - the card can still be added as a resource by hand
            _LOGGER.exception("Could not add the VirtuHome card to the dashboard resources")
        await _update_issues()

    async def _update_issues(_now: Any = None) -> None:
        try:
            await async_update_issues(hass, hass.data.get(DOMAIN))
        except Exception:  # noqa: BLE001 - Repairs are a convenience; VirtuHome works without them
            _LOGGER.exception("Could not update VirtuHome's repair issues")

    # a licence that stops renewing shows up in Repairs within a day
    entry.async_on_unload(async_track_time_interval(hass, _update_issues, timedelta(hours=24)))

    if hass.state is CoreState.running:
        await _register_card()
    else:
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _register_card)

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
    hass.data.pop(DOMAIN, None)
    return True


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """The integration is removed: take the card out of the dashboard resources."""
    await card_resource.async_unregister(hass)
