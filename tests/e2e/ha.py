"""Starts a scratch Home Assistant with VirtuHome set up, for the end-to-end tests.

    python tests/e2e/ha.py <new config dir> [--port 8131]

Run it with the Python that Home Assistant is installed in (tests/e2e/run.mjs starts it on its
own). It makes the config dir with custom_components/virtuhome linked to this checkout, starts
Home Assistant on 127.0.0.1, finishes onboarding and adds VirtuHome through its config flow, all
through the API, and writes <config dir>/e2e.json with the URL, the tokens and the config entry.
Home Assistant keeps running until this is stopped (Ctrl-C or SIGTERM).
"""

from __future__ import annotations

import argparse
import asyncio
import json
import signal
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
# a throwaway owner of a throwaway instance that only listens on 127.0.0.1
USER = {"name": "E2E", "username": "e2e", "password": "e2e-password", "language": "en"}

CONFIGURATION = """\
homeassistant:
  name: VirtuHome e2e
  latitude: 51.5
  longitude: -0.12
  elevation: 10
  unit_system: metric
  time_zone: Europe/London
  country: GB
http:
  server_host: 127.0.0.1
  server_port: {port}
frontend:
config:
diagnostics:
logger:
  default: warning
  logs:
    custom_components.virtuhome: debug
"""


def call(url: str, path: str, data: dict | None = None, token: str | None = None, form: bool = False):
    """A request to Home Assistant; JSON in and out."""
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    body = None
    if data is not None:
        body = urllib.parse.urlencode(data).encode() if form else json.dumps(data).encode()
        headers["Content-Type"] = "application/x-www-form-urlencoded" if form else "application/json"
    req = urllib.request.Request(url + path, data=body, headers=headers, method="POST" if data is not None else "GET")
    with urllib.request.urlopen(req, timeout=30) as res:
        return json.loads(res.read() or "null")


def wait_until_up(url: str, proc: subprocess.Popen, timeout: float = 600) -> None:
    """Until the API answers. The first start installs the frontend's packages, which takes a while."""
    end = time.monotonic() + timeout
    while time.monotonic() < end:
        if proc.poll() is not None:
            sys.exit(f"Home Assistant stopped (exit code {proc.returncode})")
        try:
            call(url, "/api/onboarding")
            return
        except (urllib.error.URLError, ConnectionError, TimeoutError):
            time.sleep(1)
    sys.exit("Home Assistant did not start in time")


def onboard(url: str) -> dict:
    """Creates the owner and finishes onboarding; returns the owner's tokens."""
    client_id = f"{url}/"
    code = call(url, "/api/onboarding/users", {**USER, "client_id": client_id})["auth_code"]
    tokens = call(url, "/auth/token", {"grant_type": "authorization_code", "code": code, "client_id": client_id}, form=True)
    token = tokens["access_token"]
    call(url, "/api/onboarding/analytics", {}, token)
    call(url, "/api/onboarding/integration", {"client_id": client_id, "redirect_uri": f"{url}/?auth_callback=1"}, token)
    if not all(step["done"] for step in call(url, "/api/onboarding")):
        sys.exit("Onboarding did not finish")
    return {**tokens, "client_id": client_id}


async def _keep_http_settings(url: str, token: str) -> None:
    """Newer versions take the http: settings in configuration.yaml as a trial that reverts (to
    port 8123) after five minutes unless confirmed: confirms them. Older ones lack the command."""
    import aiohttp  # noqa: PLC0415 - Home Assistant's own dependency

    async with aiohttp.ClientSession() as session, session.ws_connect(f"{url}/api/websocket") as ws:
        await ws.receive_json()
        await ws.send_json({"type": "auth", "access_token": token})
        if (await ws.receive_json())["type"] != "auth_ok":
            sys.exit("The WebSocket API refused the token")
        await ws.send_json({"id": 1, "type": "http/config/promote"})
        res = await ws.receive_json()
        if not res["success"] and res["error"]["code"] not in ("unknown_command", "not_allowed"):
            sys.exit(f"Could not keep the HTTP settings: {res['error']}")


def add_virtuhome(url: str, token: str) -> str:
    """Adds VirtuHome through its config flow (one step, nothing to fill in); returns the entry id."""
    flow = call(url, "/api/config/config_entries/flow", {"handler": "virtuhome", "show_advanced_options": False}, token)
    if flow.get("type") == "form":
        flow = call(url, f"/api/config/config_entries/flow/{flow['flow_id']}", {}, token)
    if flow.get("type") != "create_entry":
        sys.exit(f"The config flow did not add VirtuHome: {flow}")
    entry_id = flow["result"]["entry_id"]
    for _ in range(60):
        entries = call(url, "/api/config/config_entries/entry", token=token)
        state = next((e["state"] for e in entries if e["entry_id"] == entry_id), None)
        if state == "loaded":
            return entry_id
        time.sleep(0.5)
    sys.exit(f"VirtuHome did not load (state {state})")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("config", type=Path, help="a config dir to create (must not exist or be empty)")
    parser.add_argument("--port", type=int, default=8131)
    args = parser.parse_args()
    config: Path = args.config.resolve()
    if config.exists() and any(config.iterdir()):
        sys.exit(f"{config} is not empty: give a new folder")
    (config / "custom_components").mkdir(parents=True)
    (config / "custom_components/virtuhome").symlink_to(ROOT / "custom_components/virtuhome")
    (config / "configuration.yaml").write_text(CONFIGURATION.format(port=args.port))
    # Onboarding's location step adds starter integrations (weather, radio, shopping list, text to
    # speech) that need the internet and packages a pip install lacks; its settings are in
    # configuration.yaml, so it is marked done here and the other steps go through the API
    (config / ".storage").mkdir()
    (config / ".storage/onboarding").write_text(json.dumps({"version": 4, "minor_version": 1, "key": "onboarding", "data": {"done": ["core_config"]}}))
    url = f"http://127.0.0.1:{args.port}"

    started = time.monotonic()
    with open(config / "hass.out", "wb") as out:
        proc = subprocess.Popen([sys.executable, "-m", "homeassistant", "-c", str(config)], stdout=out, stderr=subprocess.STDOUT)
    stopping = False

    def stop(*_: object) -> None:
        # only asks Home Assistant to stop: waiting for it here would block the wait() it interrupted
        nonlocal stopping
        stopping = True
        if proc.poll() is None:
            proc.terminate()

    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)
    try:
        wait_until_up(url, proc)
        tokens = onboard(url)
        asyncio.run(_keep_http_settings(url, tokens["access_token"]))
        entry_id = add_virtuhome(url, tokens["access_token"])
        version = call(url, "/api/config", token=tokens["access_token"])["version"]
    except BaseException as err:
        stop()
        proc.wait()
        if isinstance(err, urllib.error.HTTPError):
            sys.exit(f"{err.url}: {err.code} {err.read().decode(errors='replace')}")
        raise
    (config / "e2e.json").write_text(json.dumps({"url": url, "entry_id": entry_id, "version": version, **tokens}, indent=2))
    print(f"Home Assistant {version} is up at {url} with VirtuHome ({time.monotonic() - started:.0f} s)", flush=True)
    proc.wait()
    if not stopping:
        sys.exit(f"Home Assistant stopped (exit code {proc.returncode})")

if __name__ == "__main__":
    main()
