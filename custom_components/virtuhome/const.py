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

# extensions: unlocked by a licence key, downloaded from the licence server, served from here
EXT_URL_BASE = "/virtuhome_ext"
LICENCE_KEY_STORE = f"{DOMAIN}.licence"
DEFAULT_LICENCE_SERVER = "https://virtuhome-license.virtumaps.workers.dev"
CONF_LICENCE_SERVER = "licence_server"
