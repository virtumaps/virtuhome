"""Fix flows for VirtuHome's issues in Settings → System → Repairs (issues.py says which there are)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.repairs import ConfirmRepairFlow, RepairsFlow
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult
from homeassistant.loader import async_get_integration

from . import card_resource
from .const import DOMAIN
from .repair_issues import async_update_issues


class CardResourceFlow(ConfirmRepairFlow):
    """Adds the card to the dashboards' resources again, as at startup."""

    async def async_step_confirm(self, user_input: dict[str, str] | None = None) -> FlowResult:
        if user_input is not None:
            version = str((await async_get_integration(self.hass, DOMAIN)).version)
            await card_resource.async_register(self.hass, version)
            await async_update_issues(self.hass, self.hass.data.get(DOMAIN))
            return self.async_create_entry(data={})
        return self.async_show_form(step_id="confirm")


async def async_create_fix_flow(hass: HomeAssistant, issue_id: str, data: dict[str, Any] | None) -> RepairsFlow:
    if issue_id == "card_resource":
        return CardResourceFlow()
    return ConfirmRepairFlow()
