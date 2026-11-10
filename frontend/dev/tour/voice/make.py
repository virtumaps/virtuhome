#!/usr/bin/env python3
"""Records the online demo tour's lines in a natural voice, on this computer, with Kokoro (an open
neural voice, Apache 2.0): voice/<id>.mp3 for each line and voice/voices.json (id -> seconds), which
the tour plays instead of the browser's own voice. Only new or changed lines are recorded, and the
files of lines that are gone are removed. <id> is the FNV-1a hash of what is said, as voiceId() in
tour.ts makes it.

One-time setup, in this folder (frontend/dev/tour/voice; the model files and .venv are git-ignored):
    python3 -m venv .venv && .venv/bin/pip install kokoro-onnx soundfile
    curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
    curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
Then, after changing what Pip says:
    .venv/bin/python make.py            (needs node, and ffmpeg for the mp3s)
"""
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
# Pip: Kokoro's liveliest British voice (bf_alice: about twice the rise and fall of bf_emma's) with some
# of its most natural one (af_heart), said the British way, a little quicker than its own pace.
# One voice ("bf_emma") or a mix ("bf_alice:0.6+af_heart:0.4").
VOICE = "bf_alice:0.6+af_heart:0.4"
LANG = "en-gb"
SPEED = 1.05


def style(kokoro, voice: str):
    """A voice by name, or a mix of voices by weight."""
    if "+" not in voice and ":" not in voice:
        return voice
    parts = [p.split(":") for p in voice.split("+")]
    return sum(kokoro.get_voice_style(name) * float(weight or 1) for name, weight in parts)


def voice_id(text: str) -> str:
    h = 0x811C9DC5
    for b in text.encode("utf-8"):
        h = ((h ^ b) * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"


def main() -> None:
    import numpy as np
    import soundfile as sf
    from kokoro_onnx import Kokoro

    lines = json.loads(subprocess.check_output(["node", str(HERE.parent / "lines.mjs")], text=True))
    index_file = HERE / "voices.json"
    index = json.loads(index_file.read_text()) if index_file.exists() else {}
    # a different voice or speed records every line again
    made_with = HERE / "made-with.txt"
    settings = f"{VOICE} {LANG} {SPEED}\n"
    if not made_with.exists() or made_with.read_text() != settings:
        index = {}
    wanted = {voice_id(t): t for t in lines}
    kokoro = None
    for vid, text in wanted.items():
        if vid in index and (HERE / f"{vid}.mp3").exists():
            continue
        kokoro = kokoro or Kokoro(str(HERE / "kokoro-v1.0.onnx"), str(HERE / "voices-v1.0.bin"))
        samples, rate = kokoro.create(text, voice=style(kokoro, VOICE), speed=SPEED, lang=LANG)
        # trim the silence either side, keeping a breath
        loud = np.nonzero(np.abs(samples) > 0.01)[0]
        if len(loud):
            samples = samples[max(0, loud[0] - rate // 20): loud[-1] + rate // 10]
        wav = HERE / f"{vid}.wav"
        sf.write(wav, samples, rate)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-ac", "1", "-b:a", "64k", str(HERE / f"{vid}.mp3")], check=True)
        wav.unlink()
        index[vid] = round(len(samples) / rate, 2)
        print(f"{vid}  {index[vid]:5.2f}s  {text}")
    for vid in list(index):
        if vid not in wanted:
            del index[vid]
            (HERE / f"{vid}.mp3").unlink(missing_ok=True)
            print(f"removed {vid}")
    index_file.write_text(json.dumps(dict(sorted(index.items())), indent=1) + "\n")
    made_with.write_text(settings)
    print(f"{len(index)} lines recorded")


if __name__ == "__main__":
    sys.exit(main())
