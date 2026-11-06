"""VirtuHome: your home as a live 3D model in Home Assistant."""

from __future__ import annotations

import logging
from datetime import timedelta
from pathlib import Path
from typing import Any

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import SOURCE_INTEGRATION_DISCOVERY, ConfigEntry
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import CoreState, Event, HomeAssistant
from homeassistant.helpers import config_validation as cv, discovery_flow
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.typing import ConfigType
from homeassistant.loader import IntegrationNotFound, async_get_integration

from . import card_resource, websocket
from .backgrounds import Backgrounds
from .const import DOMAIN, LOADER_FILE, PANEL_ELEMENT, PANEL_ICON, PANEL_PATH, PANEL_TITLE, PRO_DOMAIN, URL_BASE
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
    await hass.http.async_register_static_paths([StaticPathConfig(URL_BASE, str(FRONTEND_DIR), cache_headers=False)])
    # floor plan images to trace over; kept across reloads, like the view that serves them
    hass.data[DATA_BACKGROUNDS] = Backgrounds(Path(hass.config.path(".virtuhome", "backgrounds")))
    hass.http.register_view(BackgroundView(hass, hass.data[DATA_BACKGROUNDS]))
    websocket.async_register(hass)
    await _set_up_pro(hass)
    return True


async def _set_up_pro(hass: HomeAssistant) -> None:
    """VirtuHome Pro, the integration that brings extensions, asks for nothing when it's set up: once
    HACS has put it in and Home Assistant restarted, it is set up through a discovery (it creates its
    entry at once). VirtuHome only offers it; its code runs only when the user installed it."""
    try:
        await async_get_integration(hass, PRO_DOMAIN)
    except IntegrationNotFound:
        return
    if not hass.config_entries.async_entries(PRO_DOMAIN):
        discovery_flow.async_create_flow(hass, PRO_DOMAIN, {"source": SOURCE_INTEGRATION_DISCOVERY}, {})


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    store = PlanStore(hass)
    await store.async_load()
    store.backgrounds = hass.data[DATA_BACKGROUNDS]
    hass.data[DOMAIN] = store

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

    # the card's resource is checked again each day
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


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    frontend.async_remove_panel(hass, PANEL_PATH)
    hass.data.pop(DOMAIN, None)
    return True


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """The integration is removed: take the card out of the dashboard resources."""
    await card_resource.async_unregister(hass)
