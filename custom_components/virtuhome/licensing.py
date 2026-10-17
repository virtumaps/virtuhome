"""Signatures of licence tokens and extension bundles (no Home Assistant imports: testable alone).

The licence server signs with an Ed25519 key; the integration only holds the public key.

Licence token: ``vhl1.<base64url payload JSON>.<base64url signature over the payload bytes>``
  payload: {"v": 1, "key": "<licence id>", "act": "<activation id>", "ext": ["wall_tablet", ...],
            "inst": "<installation hash>", "iat": <unix>, "exp": <unix>}

Extension bundle: the server publishes ``sha256`` of the file and a signature over
``virtuhome-ext:v1:<id>:<version>:<sha256 hex>``.
"""

from __future__ import annotations

import base64
import hashlib
import json
import time
from typing import Any

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

# Public half of the VirtuHome licence signing key (tools/keygen in virtuhome-pro).
PUBLIC_KEY_B64 = "vDaOEr/I1gLJ9gcXxrEoLvhjpJZeUDZpu2QDJJL+d20="

TOKEN_PREFIX = "vhl1"


class LicenceError(Exception):
    """A token or bundle that does not check out."""


def _b64url_decode(text: str) -> bytes:
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))


def _key(public_key_b64: str = PUBLIC_KEY_B64) -> Ed25519PublicKey:
    return Ed25519PublicKey.from_public_bytes(base64.b64decode(public_key_b64))


def installation_hash(instance_id: str) -> str:
    """A stable, anonymous id of this Home Assistant installation (the licence binds to it)."""
    return hashlib.sha256(f"virtuhome:{instance_id}".encode()).hexdigest()[:32]


def verify_token(token: str, instance: str, *, now: float | None = None, public_key_b64: str = PUBLIC_KEY_B64) -> dict[str, Any]:
    """Checks signature, installation and expiry; returns the payload."""
    try:
        prefix, payload_b64, sig_b64 = token.split(".")
    except ValueError as err:
        raise LicenceError("malformed token") from err
    if prefix != TOKEN_PREFIX:
        raise LicenceError("unknown token format")
    payload_bytes = _b64url_decode(payload_b64)
    try:
        _key(public_key_b64).verify(_b64url_decode(sig_b64), payload_bytes)
    except InvalidSignature as err:
        raise LicenceError("bad signature") from err
    payload = json.loads(payload_bytes)
    if payload.get("inst") != instance:
        raise LicenceError("licence belongs to another installation")
    if payload.get("exp", 0) < (now if now is not None else time.time()):
        raise LicenceError("licence expired")
    return payload


def verify_bundle(ext_id: str, version: str, data: bytes, sha256_hex: str, sig_b64: str, *, public_key_b64: str = PUBLIC_KEY_B64) -> None:
    """Raises unless ``data`` is exactly the bundle the licence server signed."""
    digest = hashlib.sha256(data).hexdigest()
    if digest != sha256_hex:
        raise LicenceError(f"{ext_id} {version}: checksum mismatch")
    message = f"virtuhome-ext:v1:{ext_id}:{version}:{sha256_hex}".encode()
    try:
        _key(public_key_b64).verify(base64.b64decode(sig_b64), message)
    except InvalidSignature as err:
        raise LicenceError(f"{ext_id} {version}: bad signature") from err
