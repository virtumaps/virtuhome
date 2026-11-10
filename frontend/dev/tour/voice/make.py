#!/usr/bin/env python3
"""Records the online demo tour's lines in a natural voice, on this computer, with Kokoro (an open
neural voice, Apache 2.0), in each language Kokoro has a voice for: voice/<language>/<id>.mp3 for each
line and voice/<language>/voices.json (id -> seconds), which the tour plays instead of the browser's
own voice. Only new or changed lines are recorded, and files no line needs any more are removed. <id>
is the FNV-1a hash of what is said, as voiceId() in tour.ts makes it.

One-time setup, in this folder (frontend/dev/tour/voice; the model files and .venv are git-ignored):
    python3 -m venv .venv && .venv/bin/pip install kokoro-onnx soundfile
    curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
    curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
Then, after changing what Pip says (in frontend/dev/lang):
    .venv/bin/python make.py            every language with a voice  (needs node, and ffmpeg for the mp3s)
    .venv/bin/python make.py fr es      just these
"""
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
# Pip in each language: [voice, Kokoro's language, pace]. English: Kokoro's liveliest British voice
# (bf_alice: about twice the rise and fall of bf_emma's) with some of its most natural one (af_heart),
# said the British way, a little quicker than its own pace. A voice is one ("ff_siwis") or a mix
# ("bf_alice:0.6+af_heart:0.4"). The demo's other languages have no Kokoro voice: the browser speaks them.
VOICES = {
    "en": ("bf_alice:0.6+af_heart:0.4", "en-gb", 1.05),
    "fr": ("ff_siwis", "fr-fr", 1.05),
    "es": ("ef_dora", "es", 1.05),
    "it": ("if_sara", "it", 1.05),
    "pt": ("pf_dora", "pt-br", 1.05),
}


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


def record(kokoro_box: list, code: str) -> None:
    import numpy as np
    import soundfile as sf
    from kokoro_onnx import Kokoro

    voice, lang, speed = VOICES[code]
    folder = HERE / code
    folder.mkdir(exist_ok=True)
    lines = json.loads(subprocess.check_output(["node", str(HERE.parent / "lines.mjs"), code], text=True))
    index_file = folder / "voices.json"
    index = json.loads(index_file.read_text()) if index_file.exists() else {}
    # a different voice or pace records every line again
    made_with = folder / "made-with.txt"
    settings = f"{voice} {lang} {speed}\n"
    if not made_with.exists() or made_with.read_text() != settings:
        index = {}
    wanted = {voice_id(t): t for t in lines}
    for vid, text in wanted.items():
        if vid in index and (folder / f"{vid}.mp3").exists():
            continue
        if not kokoro_box:
            kokoro_box.append(Kokoro(str(HERE / "kokoro-v1.0.onnx"), str(HERE / "voices-v1.0.bin")))
        kokoro = kokoro_box[0]
        samples, rate = kokoro.create(text, voice=style(kokoro, voice), speed=speed, lang=lang)
        # trim the silence either side, keeping a breath
        loud = np.nonzero(np.abs(samples) > 0.01)[0]
        if len(loud):
            samples = samples[max(0, loud[0] - rate // 20): loud[-1] + rate // 10]
        wav = folder / f"{vid}.wav"
        sf.write(wav, samples, rate)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-ac", "1", "-b:a", "64k", str(folder / f"{vid}.mp3")], check=True)
        wav.unlink()
        index[vid] = round(len(samples) / rate, 2)
        print(f"{code} {vid}  {index[vid]:5.2f}s  {text}")
    index = {vid: secs for vid, secs in index.items() if vid in wanted}
    # every recording no line needs any more goes, whichever voice made it
    for mp3 in folder.glob("*.mp3"):
        if mp3.stem not in wanted:
            mp3.unlink()
            print(f"{code} removed {mp3.stem}")
    index_file.write_text(json.dumps(dict(sorted(index.items())), indent=1) + "\n")
    made_with.write_text(settings)
    print(f"{code}: {len(index)} lines recorded")


def main() -> None:
    codes = sys.argv[1:] or list(VOICES)
    unknown = [c for c in codes if c not in VOICES]
    if unknown:
        sys.exit(f"no Kokoro voice for {', '.join(unknown)} (the browser speaks those)")
    kokoro: list = []
    for code in codes:
        record(kokoro, code)


if __name__ == "__main__":
    sys.exit(main())
