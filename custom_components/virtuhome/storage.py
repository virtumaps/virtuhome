"""The plan and its restore points, kept in Home Assistant's .storage."""

from __future__ import annotations

import time
from collections.abc import Callable
from typing import Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.storage import Store

from .backgrounds import referenced
from .const import HISTORY_KEY, HISTORY_LIMIT, STORAGE_KEY, STORAGE_VERSION
from .schema import empty_plan


class PlanStore:
    """Holds the current plan in memory, saves it, and tells subscribers about changes."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._history: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, HISTORY_KEY)
        self.plan: dict[str, Any] = empty_plan()
        self.revision = 0
        self.snapshots: list[dict[str, Any]] = []
        self._listeners: list[Callable[[], None]] = []
        # set up by __init__: licence and downloaded extensions, and the floor plan images
        self.extension_manager = None
        self.backgrounds = None

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if data:
            self.plan = data.get("plan") or empty_plan()
            self.revision = int(data.get("revision", 0))
        history = await self._history.async_load()
        if history:
            self.snapshots = history.get("snapshots", [])

    async def async_save(self, plan: dict[str, Any], *, label: str | None = None) -> int:
        """Replace the plan; the previous one becomes a restore point when it had floors."""
        if self.plan.get("floors"):
            self.snapshots.insert(
                0, {"id": f"r{self.revision}-{int(time.time())}", "time": time.time(),
                    "label": label, "revision": self.revision, "plan": self.plan}
            )
            del self.snapshots[HISTORY_LIMIT:]
            await self._history.async_save({"snapshots": self.snapshots})
        before = self.plan
        self.plan = plan
        self.revision += 1
        await self._store.async_save({"plan": self.plan, "revision": self.revision})
        if self.backgrounds is not None:
            keep = referenced(plan)
            await self.hass.async_add_executor_job(self.backgrounds.cleanup, keep, referenced(before) - keep)
        for listener in list(self._listeners):
            listener()
        return self.revision

    @callback
    def async_listen(self, listener: Callable[[], None]) -> Callable[[], None]:
        self._listeners.append(listener)

        @callback
        def remove() -> None:
            if listener in self._listeners:
                self._listeners.remove(listener)

        return remove
