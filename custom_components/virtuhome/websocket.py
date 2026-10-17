"""WebSocket API used by the VirtuHome card, panel and editor."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.loader import async_get_integration

from .const import DOMAIN
from .schema import PLAN
from .licensing import LicenceError
from .storage import PlanStore


def async_register(hass: HomeAssistant) -> None:
    for command in (
        ws_info, ws_get, ws_save, ws_subscribe, ws_history_list, ws_history_restore,
        ws_licence_get, ws_licence_activate, ws_licence_refresh, ws_licence_remove, ws_catalog,
    ):
        websocket_api.async_register_command(hass, command)


def _store(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> PlanStore | None:
    store: PlanStore | None = hass.data.get(DOMAIN)
    if store is None:
        connection.send_error(msg["id"], "not_loaded", "VirtuHome is not set up")
    return store


@websocket_api.websocket_command({vol.Required("type"): "virtuhome/info"})
@websocket_api.async_response
async def ws_info(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Version, plan revision and the extensions (Pro add-ons) that registered themselves."""
    if (store := _store(hass, connection, msg)) is None:
        return
    integration = await async_get_integration(hass, DOMAIN)
    manager = store.extension_manager
    connection.send_result(
        msg["id"],
        {"version": str(integration.version), "revision": store.revision, "extensions": manager.extensions() if manager else []},
    )


@websocket_api.websocket_command({vol.Required("type"): "virtuhome/plan/get"})
@callback
def ws_get(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    if (store := _store(hass, connection, msg)) is None:
        return
    connection.send_result(msg["id"], {"plan": store.plan, "revision": store.revision})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "virtuhome/plan/save",
        vol.Required("plan"): dict,
        # the revision the editor started from: a newer one on the server means someone else saved
        vol.Optional("base_revision"): int,
        vol.Optional("label"): vol.All(str, vol.Length(max=80)),
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_save(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    if (store := _store(hass, connection, msg)) is None:
        return
    base = msg.get("base_revision")
    if base is not None and base != store.revision:
        connection.send_error(
            msg["id"], "conflict", f"The plan changed meanwhile (revision {store.revision}, yours {base})"
        )
        return
    try:
        plan = PLAN(msg["plan"])
    except vol.Invalid as err:
        connection.send_error(msg["id"], "invalid_plan", str(err))
        return
    revision = await store.async_save(plan, label=msg.get("label"))
    connection.send_result(msg["id"], {"revision": revision})


@websocket_api.websocket_command({vol.Required("type"): "virtuhome/plan/subscribe"})
@callback
def ws_subscribe(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Sends the plan now and again after every save, so open cards follow the editor."""
    if (store := _store(hass, connection, msg)) is None:
        return

    @callback
    def send() -> None:
        connection.send_message(
            websocket_api.event_message(msg["id"], {"plan": store.plan, "revision": store.revision})
        )

    connection.subscriptions[msg["id"]] = store.async_listen(send)
    connection.send_result(msg["id"])
    send()


@websocket_api.websocket_command({vol.Required("type"): "virtuhome/history/list"})
@websocket_api.require_admin
@callback
def ws_history_list(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    if (store := _store(hass, connection, msg)) is None:
        return
    connection.send_result(
        msg["id"],
        [
            {"id": s["id"], "time": s["time"], "label": s.get("label"), "revision": s["revision"],
             "floors": len(s["plan"].get("floors", []))}
            for s in store.snapshots
        ],
    )


@websocket_api.websocket_command(
    {vol.Required("type"): "virtuhome/history/restore", vol.Required("snapshot_id"): str}
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_history_restore(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    if (store := _store(hass, connection, msg)) is None:
        return
    snapshot = next((s for s in store.snapshots if s["id"] == msg["snapshot_id"]), None)
    if snapshot is None:
        connection.send_error(msg["id"], "not_found", "No such restore point")
        return
    revision = await store.async_save(snapshot["plan"], label=f"Restored {snapshot['id']}")
    connection.send_result(msg["id"], {"revision": revision})


# ---------------------------------------------------------------------------- licence and extensions


def _manager(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict):
    store = _store(hass, connection, msg)
    if store is None:
        return None
    if store.extension_manager is None:
        connection.send_error(msg["id"], "not_loaded", "Extensions are not available")
        return None
    return store.extension_manager


async def _run(connection: websocket_api.ActiveConnection, msg: dict, coro) -> None:
    try:
        connection.send_result(msg["id"], await coro)
    except LicenceError as err:
        connection.send_error(msg["id"], "licence", str(err))
    except Exception as err:  # noqa: BLE001 - network trouble ends up in the UI as a message
        connection.send_error(msg["id"], "unreachable", f"The licence server could not be reached: {err}")


@websocket_api.websocket_command({vol.Required("type"): "virtuhome/licence/get"})
@websocket_api.require_admin
@callback
def ws_licence_get(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    if (m := _manager(hass, connection, msg)) is None:
        return
    connection.send_result(msg["id"], m.summary())


@websocket_api.websocket_command(
    {vol.Required("type"): "virtuhome/licence/activate", vol.Required("key"): vol.All(str, vol.Length(min=8, max=120))}
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_licence_activate(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    if (m := _manager(hass, connection, msg)) is None:
        return
    await _run(connection, msg, m.async_activate(msg["key"]))


@websocket_api.websocket_command({vol.Required("type"): "virtuhome/licence/refresh"})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_licence_refresh(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    if (m := _manager(hass, connection, msg)) is None:
        return
    await _run(connection, msg, m.async_refresh())


@websocket_api.websocket_command({vol.Required("type"): "virtuhome/licence/remove"})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_licence_remove(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    if (m := _manager(hass, connection, msg)) is None:
        return
    await _run(connection, msg, m.async_remove())


@websocket_api.websocket_command({vol.Required("type"): "virtuhome/catalog"})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_catalog(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """What extensions exist; only lists buy links once the shop is open on the server."""
    if (m := _manager(hass, connection, msg)) is None:
        return
    await _run(connection, msg, m.async_catalog())
