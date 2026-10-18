"""Floor plan images the 2D editor traces over (no Home Assistant imports: testable alone).

They live in <config>/.virtuhome/backgrounds, never under www/: views.py serves them to signed-in
users only. Uploads come over the WebSocket in pieces, because Home Assistant closes a connection
on a message over 4 MB. A file is named after its floor and its content, so a browser can cache it
for good and a new image gets a new name.

A file goes when a saved plan stops using it (the background was removed or replaced). Files that
no saved plan has used yet (an upload whose plan isn't saved) are kept for an hour, then cleared.
"""

from __future__ import annotations

import hashlib
import re
import secrets
import time
from pathlib import Path
from typing import Any

MAX_BYTES = 8 * 1024 * 1024
# raw bytes per WebSocket message: about 1.4 MB as base64
CHUNK_BYTES = 1024 * 1024
# how long an image no saved plan uses, or an unfinished upload, is kept
GRACE_SECONDS = 3600

FILE_PATTERN = r"^[A-Za-z0-9_\-.]{1,64}-[0-9a-f]{12}\.(png|jpg)$"
FILE_RE = re.compile(FILE_PATTERN)
_PART_SUFFIX = ".part"


class BackgroundError(Exception):
    """An upload that can't be accepted; the message is shown to the user."""


def image_kind(head: bytes) -> str | None:
    """'png' or 'jpg' from a file's first bytes, else None."""
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if head.startswith(b"\xff\xd8\xff"):
        return "jpg"
    return None


def referenced(plan: dict[str, Any] | None) -> set[str]:
    """The image files a plan uses."""
    out = set()
    for floor in (plan or {}).get("floors") or []:
        bg = floor.get("background")
        if isinstance(bg, dict) and isinstance(bg.get("file"), str):
            out.add(bg["file"])
    return out


class Backgrounds:
    """The image folder: uploads in pieces, finished files, and the cleanup. Every method does file
    work, so Home Assistant calls them in its executor."""

    def __init__(self, folder: Path) -> None:
        self.folder = folder
        # upload id -> the floor it is for and the part file being written
        self._uploads: dict[str, dict[str, Any]] = {}

    def begin(self, floor_id: str) -> str:
        self.folder.mkdir(parents=True, exist_ok=True)
        upload_id = secrets.token_hex(8)
        part = self.folder / f"{upload_id}{_PART_SUFFIX}"
        part.write_bytes(b"")
        self._uploads[upload_id] = {"floor": floor_id, "part": part}
        return upload_id

    def append(self, upload_id: str, offset: int, data: bytes) -> int:
        """Adds a piece at `offset` (the bytes received so far); returns the new total."""
        up = self._uploads.get(upload_id)
        if up is None:
            raise BackgroundError("This upload has expired. Choose the image again.")
        part: Path = up["part"]
        size = part.stat().st_size
        if offset != size:
            raise BackgroundError(f"Upload out of step (at {size} bytes, got a piece for {offset}).")
        if len(data) > CHUNK_BYTES:
            raise BackgroundError("Upload piece too large.")
        if size + len(data) > MAX_BYTES:
            self.abort(upload_id)
            raise BackgroundError("The image is larger than 8 MB.")
        if size == 0 and data and image_kind(data[:8]) is None:
            self.abort(upload_id)
            raise BackgroundError("Only JPEG and PNG images can be used.")
        with part.open("ab") as fh:
            fh.write(data)
        return size + len(data)

    def finish(self, upload_id: str) -> str:
        """Checks the whole file and gives it its name; returns the name."""
        up = self._uploads.pop(upload_id, None)
        if up is None:
            raise BackgroundError("This upload has expired. Choose the image again.")
        part: Path = up["part"]
        data = part.read_bytes()
        kind = image_kind(data[:8])
        if kind is None:
            part.unlink(missing_ok=True)
            raise BackgroundError("Only JPEG and PNG images can be used.")
        name = f"{up['floor']}-{hashlib.sha256(data).hexdigest()[:12]}.{kind}"
        part.replace(self.folder / name)
        return name

    def abort(self, upload_id: str) -> None:
        up = self._uploads.pop(upload_id, None)
        if up is not None:
            up["part"].unlink(missing_ok=True)

    def path(self, name: str) -> Path | None:
        """The file for a name from a URL, or None (unknown, or not a name we make)."""
        if not FILE_RE.match(name):
            return None
        path = self.folder / name
        return path if path.is_file() else None

    def cleanup(self, keep: set[str], dropped: set[str], now: float | None = None) -> list[str]:
        """Removes the images in `dropped` (a saved plan stopped using them) and, after the grace
        time, images no plan uses and unfinished uploads. Returns the names removed."""
        if not self.folder.is_dir():
            return []
        now = time.time() if now is None else now
        live_parts = {up["part"].name for up in self._uploads.values()}
        removed = []
        for f in self.folder.iterdir():
            if not f.is_file() or f.name in keep:
                continue
            if f.name.endswith(_PART_SUFFIX):
                stale = f.name not in live_parts or now - f.stat().st_mtime > GRACE_SECONDS
            elif FILE_RE.match(f.name):
                stale = f.name in dropped or now - f.stat().st_mtime > GRACE_SECONDS
            else:
                continue
            if stale:
                f.unlink(missing_ok=True)
                removed.append(f.name)
        for upload_id, up in list(self._uploads.items()):
            if up["part"].name in removed:
                del self._uploads[upload_id]
        return removed
