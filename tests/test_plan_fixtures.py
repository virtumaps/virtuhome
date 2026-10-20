"""Saved plans from every release, and the hand-made ones, still pass the integration's plan schema.

frontend/test/fixtures.test.ts loads and builds the same plans. schema.py has no Home Assistant
imports, only voluptuous (which Home Assistant brings; here `pip install voluptuous`).
"""

import importlib
import json
import sys
import types
from pathlib import Path

import pytest

pytest.importorskip("voluptuous")

ROOT = Path(__file__).parents[1]
FIXTURES = sorted((ROOT / "frontend/test/fixtures/plans").glob("*.json"))

# schema.py imports .backgrounds: give it a package without running __init__.py (which needs Home Assistant)
package = types.ModuleType("virtuhome")
package.__path__ = [str(ROOT / "custom_components/virtuhome")]
sys.modules.setdefault("virtuhome", package)
schema = importlib.import_module("virtuhome.schema")


def test_every_release_has_one():
    version = json.loads((ROOT / "custom_components/virtuhome/manifest.json").read_text())["version"]
    assert f"v{version}.json" in {p.name for p in FIXTURES}


@pytest.mark.parametrize("path", FIXTURES, ids=lambda p: p.name)
def test_passes_the_schema(path):
    plan = json.loads(path.read_text())
    stored = schema.PLAN(plan)
    assert len(stored["floors"]) == len(plan["floors"])
    # saving what was stored stores the same again
    assert schema.PLAN(stored) == stored
