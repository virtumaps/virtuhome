"""Config flow: VirtuHome has nothing to configure, so setting it up is one click."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import callback

from .const import CONF_LICENCE_SERVER, DEFAULT_LICENCE_SERVER, DOMAIN


class VirtuHomeConfigFlow(ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        if user_input is not None:
            return self.async_create_entry(title="VirtuHome", data={})
        return self.async_show_form(step_id="user")

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return VirtuHomeOptionsFlow()


class VirtuHomeOptionsFlow(OptionsFlow):
    """Advanced: which licence server extensions come from (for testing a local one)."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(data=user_input)
        current = self.config_entry.options.get(CONF_LICENCE_SERVER, DEFAULT_LICENCE_SERVER)
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema({vol.Required(CONF_LICENCE_SERVER, default=current): str}),
        )
