"""Constants for VirtuHome."""

DOMAIN = "virtuhome"

# frontend files are served from here; the version query busts browser caches after an update
URL_BASE = "/virtuhome_static"
LOADER_FILE = "virtuhome-loader.js"
PANEL_PATH = "virtuhome"
PANEL_ELEMENT = "virtuhome-panel"
PANEL_ICON = "mdi:home-variant-outline"
PANEL_TITLE = "VirtuHome"

STORAGE_KEY = f"{DOMAIN}.plan"
STORAGE_VERSION = 1
HISTORY_KEY = f"{DOMAIN}.history"
HISTORY_LIMIT = 20

EVENT_PLAN_UPDATED = f"{DOMAIN}_plan_updated"

# VirtuHome Pro: the integration that brings extensions (installed on its own, from its own repository)
PRO_DOMAIN = "virtuhome_pro"
# what VirtuHome up to 0.17 kept for a licence key, which VirtuHome Pro now reads
OLD_LICENCE_STORE = f"{DOMAIN}.licence"
