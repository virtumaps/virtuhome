"""Serves the 2D editor's floor plan images to signed-in users (the editor asks for a signed path)."""

from __future__ import annotations

from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .backgrounds import Backgrounds

BACKGROUND_URL = "/api/virtuhome/background"


class BackgroundView(HomeAssistantView):
    url = BACKGROUND_URL + "/{name}"
    name = "api:virtuhome:background"
    requires_auth = True

    def __init__(self, hass: HomeAssistant, backgrounds: Backgrounds) -> None:
        self.hass = hass
        self.backgrounds = backgrounds

    async def get(self, request: web.Request, name: str) -> web.StreamResponse:
        path = await self.hass.async_add_executor_job(self.backgrounds.path, name)
        if path is None:
            return web.Response(status=404)
        # the name carries the content's hash, so it never changes
        return web.FileResponse(path, headers={
            "Content-Type": "image/png" if name.endswith(".png") else "image/jpeg",
            "Cache-Control": "private, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
        })
