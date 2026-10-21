"""Saves the demo plan, as Home Assistant stores it, as a release's plan fixture.

    python tools/save_plan_fixture.py [version]

Run from anywhere in the repository after `npm ci` in frontend/, with voluptuous installed. It
writes frontend/test/fixtures/plans/v<version>.json (the version in manifest.json by default) and
never overwrites one: a release's fixture is kept as it is.
"""

import importlib
import json
import subprocess
import sys
import types
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COMPONENT = ROOT / "custom_components/virtuhome"
FIXTURES = ROOT / "frontend/test/fixtures/plans"

# the demo plan through normalizePlan: what the editor sends when it saves
DEMO = """
const { build } = await import("esbuild");
const entry = 'import { DEMO_PLAN } from "./src/demo/plan"; import { normalizePlan } from "./src/model/plan";'
  + "console.log(JSON.stringify(normalizePlan(structuredClone(DEMO_PLAN))));";
const out = await build({ stdin: { contents: entry, resolveDir: ".", loader: "ts" }, bundle: true, format: "esm", platform: "node", write: false, logLevel: "error" });
await import("data:text/javascript;base64," + Buffer.from(out.outputFiles[0].text).toString("base64"));
"""


def ordered(like, value):
    """value with its keys in the order `like` has them, and the keys the schema added after them."""
    if isinstance(value, dict):
        like = like if isinstance(like, dict) else {}
        keys = [k for k in like if k in value] + sorted(k for k in value if k not in like)
        return {k: ordered(like.get(k), value[k]) for k in keys}
    if isinstance(value, list):
        like = like if isinstance(like, list) else []
        return [ordered(like[i] if i < len(like) else None, v) for i, v in enumerate(value)]
    return value


def main() -> None:
    version = sys.argv[1] if len(sys.argv) > 1 else json.loads((COMPONENT / "manifest.json").read_text())["version"]
    path = FIXTURES / f"v{version}.json"
    if path.exists():
        sys.exit(f"{path.relative_to(ROOT)} already exists")
    sent = json.loads(
        subprocess.run(["node", "--input-type=module", "-e", DEMO], cwd=ROOT / "frontend", check=True, capture_output=True, text=True).stdout
    )
    # schema.py imports .backgrounds: a package for it without __init__.py, which needs Home Assistant
    package = types.ModuleType("virtuhome")
    package.__path__ = [str(COMPONENT)]
    sys.modules["virtuhome"] = package
    schema = importlib.import_module("virtuhome.schema")
    path.write_text(json.dumps(ordered(sent, schema.PLAN(sent)), separators=(",", ":"), ensure_ascii=False) + "\n")
    print(f"Saved {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
