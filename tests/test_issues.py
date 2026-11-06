"""Which repair issues apply (plain pytest; issues.py has no Home Assistant imports)."""

import importlib.util
import json
from pathlib import Path

spec = importlib.util.spec_from_file_location("issues", Path(__file__).parents[1] / "custom_components/virtuhome/issues.py")
issues = importlib.util.module_from_spec(spec)
spec.loader.exec_module(issues)

OK_CARD = {"mode": "storage", "urls": ["/virtuhome_static/virtuhome-loader.js?v=0.17.0"], "current": True, "pending": False}


def test_nothing_wrong():
    assert issues.found_issues(OK_CARD, {"links": 0, "extensions": 0}) == {}


def test_card_resource_missing_or_old_but_not_while_starting():
    assert "card_resource" in issues.found_issues({**OK_CARD, "urls": [], "current": False}, None)
    assert "card_resource" not in issues.found_issues({**OK_CARD, "current": False, "pending": True}, None)
    # YAML dashboards keep their own resources: nothing VirtuHome can say about them
    assert issues.found_issues({"mode": "yaml", "pending": False}, None) == {}


def test_what_check_my_setup_counted():
    found = issues.found_issues(OK_CARD, {"links": 3, "extensions": 1, "rooms": 2})
    assert found == {"missing_entities": {"count": "3"}, "extension_needs_update": {"count": "1"}}


def test_a_licence_from_before_pro_without_pro():
    assert issues.found_issues(OK_CARD, None, pro_needed=True) == {"pro_needed": {}}
    assert issues.found_issues(OK_CARD, None, pro_needed=False) == {}


def test_every_issue_has_its_texts():
    for name in ("strings.json", "translations/en.json", "translations/de.json", "translations/nl.json"):
        texts = json.loads((Path(__file__).parents[1] / "custom_components/virtuhome" / name).read_text())["issues"]
        assert set(texts) == set(issues.ISSUE_IDS), name
        assert "fix_flow" in texts["card_resource"]
