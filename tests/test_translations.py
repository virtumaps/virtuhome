"""The integration's texts in other languages: the same keys and placeholders as English (strings.json)."""

import json
import re
from pathlib import Path

import pytest

FOLDER = Path(__file__).parents[1] / "custom_components/virtuhome/translations"
ENGLISH = json.loads((FOLDER.parent / "strings.json").read_text())


def flat(d, prefix=""):
    out = {}
    for k, v in d.items():
        out.update(flat(v, f"{prefix}{k}.") if isinstance(v, dict) else {f"{prefix}{k}": v})
    return out


@pytest.mark.parametrize("path", sorted(FOLDER.glob("*.json")), ids=lambda p: p.name)
def test_same_keys_and_placeholders(path):
    english, other = flat(ENGLISH), flat(json.loads(path.read_text()))
    assert set(other) == set(english), path.name
    for key, text in other.items():
        assert sorted(re.findall(r"\{(\w+)\}", text)) == sorted(re.findall(r"\{(\w+)\}", english[key])), f"{path.name}: {key}"
