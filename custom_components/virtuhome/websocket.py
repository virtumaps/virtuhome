"""WebSocket API used by the VirtuHome card, panel and editor."""

from __future__ import annotations

import base64
import binascii
import time
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import area_registry as ar, device_registry as dr, floor_registry as fr
from homeassistant.loader import async_get_integration

from . import card_resource
from .backgrounds import CHUNK_BYTES, MAX_BYTES, BackgroundError
from .const import DOMAIN
from .errors import LIMITS, private_strings
from .schema import ID, PLAN
from .licensing import LicenceError
from .report import CHECK_IDS
from .storage import PlanStore


def async_register(hass: HomeAssistant) -> None:
    for command in (
        ws_info, ws_get, ws_save, ws_subscribe, ws_history_list, ws_history_restore,
        ws_licence_get, ws_licence_activate, ws_licence_refresh, ws_licence_remove, ws_catalog,
        ws_background_upload, ws_checks, ws_checks_fix_card, ws_errors_report,
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


# ---------------------------------------------------------------------------- check my setup


async def _checks_state(hass: HomeAssistant, store: PlanStore) -> dict[str, Any]:
    version = str((await async_get_integration(hass, DOMAIN)).version)
    manager = store.extension_manager
    return {
        "version": version,
        "dashboard": await card_resource.async_state(hass, version),
        "licence": manager.summary() if manager else None,
    }


@websocket_api.websocket_command(
    {
        vol.Required("type"): "virtuhome/checks",
        # what Check my setup found: a count per check, nothing that names the home
        vol.Optional("report"): vol.Schema({vol.In(CHECK_IDS): vol.All(int, vol.Range(min=0, max=100000))}),
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_checks(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """The version, how dashboards get the card and the licence; keeps the frontend's counts for diagnostics."""
    if (store := _store(hass, connection, msg)) is None:
        return
    if "report" in msg:
        store.checks = {"time": time.time(), "counts": dict(msg["report"])}
    connection.send_result(msg["id"], await _checks_state(hass, store))


@websocket_api.websocket_command({vol.Required("type"): "virtuhome/checks/fix_card"})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_checks_fix_card(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Adds the card to the dashboards' resources again, as at startup, and checks again."""
    if (store := _store(hass, connection, msg)) is None:
        return
    await card_resource.async_register(hass, str((await async_get_integration(hass, DOMAIN)).version))
    connection.send_result(msg["id"], await _checks_state(hass, store))


# ---------------------------------------------------------------------------- errors


def _names(hass: HomeAssistant, store: PlanStore) -> list[str]:
    """Everything that names the home, its people or its devices, to strip from reports."""
    names: list[Any] = [hass.config.location_name]
    for state in hass.states.async_all():
        names += [state.entity_id, state.name]
    for area in ar.async_get(hass).async_list_areas():
        names += [area.id, area.name, *area.aliases]
    for floor in fr.async_get(hass).async_list_floors():
        names += [floor.floor_id, floor.name, *floor.aliases]
    for device in dr.async_get(hass).devices.values():
        names += [device.name, device.name_by_user]
    return private_strings(names, store.plan)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "virtuhome/errors/report",
        # stripped of names by the frontend, and again here; longer text is cut
        **{vol.Optional(field, default=""): vol.All(vol.Coerce(str), vol.Length(max=limit * 4)) for field, limit in LIMITS.items()},
    }
)
@callback
def ws_errors_report(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """An error from a card or the panel (any user: wall tablets rarely sign in as admins), for diagnostics."""
    if (store := _store(hass, connection, msg)) is None:
        return
    connection.send_result(msg["id"], {"kept": store.errors.add(msg, _names(hass, store), time.time())})


# ---------------------------------------------------------------------------- floor plan images


@websocket_api.websocket_command(
    {
        vol.Required("type"): "virtuhome/background/upload",
        vol.Required("floor_id"): ID,
        # missing on the first piece: the answer gives the id for the rest
        vol.Optional("upload_id"): vol.All(str, vol.Match(r"^[0-9a-f]{16}$")),
        vol.Required("offset"): vol.All(int, vol.Range(min=0, max=MAX_BYTES)),
        # base64 of at most CHUNK_BYTES
        vol.Required("data"): vol.All(str, vol.Length(max=(CHUNK_BYTES + 2) // 3 * 4)),
        vol.Optional("done", default=False): bool,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_background_upload(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """One piece of a floor plan image. The last one (`done`) answers with the file's name for the plan."""
    if (store := _store(hass, connection, msg)) is None:
        return
    images = store.backgrounds
    try:
        data = base64.b64decode(msg["data"], validate=True)
    except (binascii.Error, ValueError):
        connection.send_error(msg["id"], "invalid_format", "The upload is not base64")
        return
    run = hass.async_add_executor_job
    try:
        upload_id = msg.get("upload_id") or await run(images.begin, msg["floor_id"])
        size = await run(images.append, upload_id, msg["offset"], data)
        if msg["done"]:
            connection.send_result(msg["id"], {"file": await run(images.finish, upload_id), "bytes": size})
        else:
            connection.send_result(msg["id"], {"upload_id": upload_id, "bytes": size})
    except BackgroundError as err:
        connection.send_error(msg["id"], "invalid_image", str(err))


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
