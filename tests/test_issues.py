"""Which repair issues apply (plain pytest; issues.py has no Home Assistant imports)."""

import importlib.util
import json
from pathlib import Path

spec = importlib.util.spec_from_file_location("issues", Path(__file__).parents[1] / "custom_components/virtuhome/issues.py")
issues = importlib.util.module_from_spec(spec)
spec.loader.exec_module(issues)

NOW = 2_000_000_000
OK_CARD = {"mode": "storage", "urls": ["/virtuhome_static/virtuhome-loader.js?v=0.17.0"], "current": True, "pending": False}


def test_nothing_wrong():
    assert issues.found_issues(OK_CARD, {"links": 0, "extensions": 0}, {"status": "none", "key_hint": None}, NOW) == {}


def test_card_resource_missing_or_old_but_not_while_starting():
    assert "card_resource" in issues.found_issues({**OK_CARD, "urls": [], "current": False}, None, None, NOW)
    assert "card_resource" not in issues.found_issues({**OK_CARD, "current": False, "pending": True}, None, None, NOW)
    # YAML dashboards keep their own resources: nothing VirtuHome can say about them
    assert issues.found_issues({"mode": "yaml", "pending": False}, None, None, NOW) == {}


def test_what_check_my_setup_counted():
    found = issues.found_issues(OK_CARD, {"links": 3, "extensions": 1, "rooms": 2}, None, NOW)
    assert found == {"missing_entities": {"count": "3"}, "extension_needs_update": {"count": "1"}}


def test_licence_not_renewed_for_a_month():
    licence = {"status": "active", "key_hint": "VH-1…ABCD", "checked": NOW - 31 * 86400, "error": "could not reach the licence server"}
    assert issues.found_issues(OK_CARD, None, licence, NOW) == {"licence_not_renewed": {"days": "31", "error": "could not reach the licence server"}}
    assert issues.found_issues(OK_CARD, None, {**licence, "checked": NOW - 5 * 86400}, NOW) == {}
    # trials alone have no key to renew
    assert issues.found_issues(OK_CARD, None, {**licence, "key_hint": None, "status": "none"}, NOW) == {}


def test_every_issue_has_its_texts():
    for name in ("strings.json", "translations/en.json"):
        texts = json.loads((Path(__file__).parents[1] / "custom_components/virtuhome" / name).read_text())["issues"]
        assert set(texts) == set(issues.ISSUE_IDS), name
        assert "fix_flow" in texts["card_resource"]
