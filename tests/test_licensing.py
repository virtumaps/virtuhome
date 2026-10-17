"""Licence token and bundle checks (plain pytest; licensing.py has no Home Assistant imports)."""

import base64
import hashlib
import importlib.util
import json
from pathlib import Path

import pytest
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat

spec = importlib.util.spec_from_file_location("licensing", Path(__file__).parents[1] / "custom_components/virtuhome/licensing.py")
lic = importlib.util.module_from_spec(spec)
spec.loader.exec_module(lic)

KEY = Ed25519PrivateKey.generate()
PUB = base64.b64encode(KEY.public_key().public_bytes(Encoding.Raw, PublicFormat.Raw)).decode()


def b64url(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()


def token(payload: dict) -> str:
    data = json.dumps(payload).encode()
    return f"vhl1.{b64url(data)}.{b64url(KEY.sign(data))}"


INST = lic.installation_hash("home-1")


def test_valid_token():
    t = token({"v": 1, "ext": ["wall_tablet"], "inst": INST, "iat": 0, "exp": 2_000_000_000})
    assert lic.verify_token(t, INST, now=1_900_000_000, public_key_b64=PUB)["ext"] == ["wall_tablet"]


@pytest.mark.parametrize("case", ["other_install", "expired", "tampered", "foreign_key"])
def test_rejected_tokens(case):
    payload = {"v": 1, "ext": ["wall_tablet"], "inst": INST, "iat": 0, "exp": 2_000_000_000}
    t = token(payload)
    inst = INST
    now = 1_900_000_000
    pub = PUB
    if case == "other_install":
        inst = lic.installation_hash("home-2")
    elif case == "expired":
        now = 2_100_000_000
    elif case == "tampered":
        prefix, body, sig = t.split(".")
        body = b64url(json.dumps({**payload, "ext": ["energy"]}).encode())
        t = f"{prefix}.{body}.{sig}"
    else:
        other = Ed25519PrivateKey.generate().public_key().public_bytes(Encoding.Raw, PublicFormat.Raw)
        pub = base64.b64encode(other).decode()
    with pytest.raises(lic.LicenceError):
        lic.verify_token(t, inst, now=now, public_key_b64=pub)


def test_bundle_signature():
    data = b"export default {}"
    sha = hashlib.sha256(data).hexdigest()
    sig = base64.b64encode(KEY.sign(f"virtuhome-ext:v1:wall_tablet:1.0.0:{sha}".encode())).decode()
    lic.verify_bundle("wall_tablet", "1.0.0", data, sha, sig, public_key_b64=PUB)
    with pytest.raises(lic.LicenceError):
        lic.verify_bundle("wall_tablet", "1.0.0", data + b" ", sha, sig, public_key_b64=PUB)
    with pytest.raises(lic.LicenceError):
        lic.verify_bundle("wall_tablet", "1.0.1", data, sha, sig, public_key_b64=PUB)
