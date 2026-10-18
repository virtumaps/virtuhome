"""Floor plan image uploads and their cleanup (plain pytest; backgrounds.py has no Home Assistant imports)."""

import importlib.util
import os
from pathlib import Path

import pytest

spec = importlib.util.spec_from_file_location("backgrounds", Path(__file__).parents[1] / "custom_components/virtuhome/backgrounds.py")
bg = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bg)

PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
JPG = b"\xff\xd8\xff\xe0" + b"\x01" * 100


def upload(store, floor, data, piece=40):
    up = store.begin(floor)
    for at in range(0, len(data), piece):
        store.append(up, at, data[at:at + piece])
    return store.finish(up)


def test_upload_in_pieces(tmp_path):
    store = bg.Backgrounds(tmp_path / "bg")
    name = upload(store, "floor_0", PNG)
    assert bg.FILE_RE.match(name) and name.startswith("floor_0-") and name.endswith(".png")
    assert (tmp_path / "bg" / name).read_bytes() == PNG
    assert store.path(name) == tmp_path / "bg" / name
    # the same image again gets the same name; another image another one
    assert upload(store, "floor_0", PNG) == name
    other = upload(store, "floor_0", JPG)
    assert other.endswith(".jpg") and other != name
    assert not list((tmp_path / "bg").glob("*.part"))


def test_rejected_uploads(tmp_path):
    store = bg.Backgrounds(tmp_path)
    up = store.begin("f")
    with pytest.raises(bg.BackgroundError, match="JPEG and PNG"):
        store.append(up, 0, b"GIF89a" + b"\x00" * 10)
    up = store.begin("f")
    store.append(up, 0, PNG[:20])
    with pytest.raises(bg.BackgroundError, match="out of step"):
        store.append(up, 10, PNG[20:])
    with pytest.raises(bg.BackgroundError, match="expired"):
        store.append("0123456789abcdef", 0, PNG)
    up = store.begin("f")
    store.append(up, 0, PNG[:8])
    with pytest.raises(bg.BackgroundError, match="8 MB"):
        for i in range(9):
            store.append(up, 8 + i * bg.CHUNK_BYTES, b"\x00" * bg.CHUNK_BYTES)
    assert not [p for p in tmp_path.iterdir() if p.name.endswith(".part") and up in p.name]


@pytest.mark.parametrize("name", ["../secrets.yaml", "a/b-0123456789ab.png", "f-0123456789ab.svg", "f.png", "f-0123456789AB.png"])
def test_path_refuses_other_names(tmp_path, name):
    assert bg.Backgrounds(tmp_path).path(name) is None


def test_cleanup(tmp_path):
    store = bg.Backgrounds(tmp_path)
    used = upload(store, "f0", PNG)
    removed = upload(store, "f1", PNG)
    fresh = upload(store, "f2", JPG)
    old = upload(store, "f3", JPG)
    os.utime(tmp_path / old, (1, 1))
    unfinished = store.begin("f4")
    stray = tmp_path / "1111222233334444.part"
    stray.write_bytes(b"")
    (tmp_path / "notes.txt").write_text("not ours")
    now = (tmp_path / used).stat().st_mtime + 60
    out = store.cleanup(keep={used}, dropped={removed}, now=now)
    # the image the saved plan stopped using goes at once; an unused upload after an hour
    assert set(out) == {removed, old, stray.name}
    assert {p.name for p in tmp_path.iterdir()} == {used, fresh, f"{unfinished}.part", "notes.txt"}
    # an unfinished upload goes after the grace time too
    store.cleanup(keep={used}, dropped=set(), now=now + bg.GRACE_SECONDS + 10)
    assert {p.name for p in tmp_path.iterdir()} == {used, "notes.txt"}
    with pytest.raises(bg.BackgroundError):
        store.append(unfinished, 0, PNG)


def test_referenced():
    plan = {"floors": [{"background": {"file": "a-0123456789ab.png"}}, {"background": None}, {}]}
    assert bg.referenced(plan) == {"a-0123456789ab.png"}
    assert bg.referenced(None) == set()
