#!/usr/bin/env python3
"""Records the online demo tour's lines, in each of its languages that a voice is set up for:
voice/<language>/<id>.mp3 for each line and voice/<language>/voices.json (id -> seconds), and
voice/index.json, the languages that have recordings. The tour plays them; a language without them
gets the English recordings under subtitles in the language. Only new or changed lines are recorded,
and files no line needs any more are removed. <id> is the FNV-1a hash of what is said, as voiceId()
in tour.ts makes it.

Two voices:
  Kokoro      an open neural voice (Apache 2.0), on this computer: English, French, Spanish, Italian
              and Portuguese only.
  ElevenLabs  one cheerful, human Pip in all 14 languages, with her mood in each line ([excited]...),
              from its API: an account on a paid plan (which allows commercial use) and its API key.

Kokoro, one-time setup in this folder (frontend/dev/tour/voice; the model files and .venv are git-ignored):
    python3 -m venv .venv && .venv/bin/pip install kokoro-onnx soundfile
    curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
    curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
Then, after changing what Pip says (in frontend/dev/lang):
    .venv/bin/python make.py            every language Kokoro has  (needs node, and ffmpeg for the mp3s)
    .venv/bin/python make.py fr es      just these

ElevenLabs (needs only Python, node and ffmpeg):
    export ELEVENLABS_API_KEY=...       (from elevenlabs.io → Developers → API keys)
    python3 make.py --elevenlabs        all 14 languages
    python3 make.py --elevenlabs bg de  just these
  ELEVENLABS_VOICE picks the voice (a voice id from its Voice Library; Pip's below if unset),
  ELEVENLABS_MODEL the model (eleven_v3, which follows the mood tags; eleven_multilingual_v2 without them).
"""
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent

# the demo's languages
LANGUAGES = ["en", "de", "nl", "fr", "it", "es", "pt", "sv", "da", "nb", "pl", "cs", "tr", "bg"]

# Pip with Kokoro: [voice, Kokoro's language, pace]. English: Kokoro's liveliest British voice (bf_alice:
# about twice the rise and fall of bf_emma's) with some of its most natural one (af_heart), said the
# British way, a little quicker than its own pace. A voice is one ("ff_siwis") or a mix
# ("bf_alice:0.6+af_heart:0.4").
KOKORO = {
    "en": ("bf_alice:0.6+af_heart:0.4", "en-gb", 1.05),
    "fr": ("ff_siwis", "fr-fr", 1.05),
    "es": ("ef_dora", "es", 1.05),
    "it": ("if_sara", "it", 1.05),
    "pt": ("pf_dora", "pt-br", 1.05),
}

# Pip with ElevenLabs: Lily, a warm young British woman from its premade voices; any voice speaks every
# language in her own voice. Her mood in each line, as eleven_v3's audio tags (other models would say them).
ELEVEN_VOICE = os.environ.get("ELEVENLABS_VOICE", "pFZP5JQG7iQjIQuC4Bku")
ELEVEN_MODEL = os.environ.get("ELEVENLABS_MODEL", "eleven_v3")
TAGS = {"excited": "[excited]", "happy": "[cheerfully]", "wink": "[playfully]", "surprised": "[surprised]", "pout": "[teasing]", "neutral": "[warmly]"}


def voice_id(text: str) -> str:
    h = 0x811C9DC5
    for b in text.encode("utf-8"):
        h = ((h ^ b) * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"


def style(kokoro, voice: str):
    """A Kokoro voice by name, or a mix of voices by weight."""
    if "+" not in voice and ":" not in voice:
        return voice
    parts = [p.split(":") for p in voice.split("+")]
    return sum(kokoro.get_voice_style(name) * float(weight or 1) for name, weight in parts)


def seconds(mp3: Path) -> float:
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(mp3)], text=True)
    return round(float(out.strip()), 2)


def kokoro_take(box: list, code: str, text: str, mood: str, out: Path) -> None:
    import numpy as np
    import soundfile as sf
    from kokoro_onnx import Kokoro

    if not box:
        box.append(Kokoro(str(HERE / "kokoro-v1.0.onnx"), str(HERE / "voices-v1.0.bin")))
    voice, lang, speed = KOKORO[code]
    samples, rate = box[0].create(text, voice=style(box[0], voice), speed=speed, lang=lang)
    # trim the silence either side, keeping a breath
    loud = np.nonzero(np.abs(samples) > 0.01)[0]
    if len(loud):
        samples = samples[max(0, loud[0] - rate // 20): loud[-1] + rate // 10]
    wav = out.with_suffix(".wav")
    sf.write(wav, samples, rate)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-ac", "1", "-b:a", "64k", str(out)], check=True)
    wav.unlink()


def eleven_take(_box: list, code: str, text: str, mood: str, out: Path) -> None:
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        sys.exit("set ELEVENLABS_API_KEY first (elevenlabs.io → Developers → API keys)")
    said = f"{TAGS.get(mood, TAGS['neutral'])} {text}" if ELEVEN_MODEL == "eleven_v3" else text
    # v3 takes a stability of 0 (creative), 0.5 (natural) or 1 (robust); the others a range, and style
    settings = {"stability": 0.5} if ELEVEN_MODEL == "eleven_v3" else {"stability": 0.35, "similarity_boost": 0.8, "style": 0.55, "use_speaker_boost": True}
    body = json.dumps({"text": said, "model_id": ELEVEN_MODEL, "voice_settings": settings}).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVEN_VOICE}?output_format=mp3_44100_128",
        data=body, headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg"},
    )
    try:
        audio = urllib.request.urlopen(req, timeout=120).read()
    except urllib.error.HTTPError as err:
        sys.exit(f"ElevenLabs said {err.code}: {err.read().decode(errors='replace')[:400]}")
    raw = out.with_suffix(".raw.mp3")
    raw.write_bytes(audio)
    # the silence either side trimmed, mono at the tour's size
    trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.1,areverse"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af", trim, "-ac", "1", "-b:a", "64k", str(out)], check=True)
    raw.unlink()


def record(engine: str, box: list, code: str) -> None:
    folder = HERE / code
    folder.mkdir(exist_ok=True)
    lines = json.loads(subprocess.check_output(["node", str(HERE.parent / "lines.mjs"), code, "--moods"], text=True))
    index_file = folder / "voices.json"
    index = json.loads(index_file.read_text()) if index_file.exists() else {}
    # a different voice, model or pace records every line again
    made_with = folder / "made-with.txt"
    settings = f"elevenlabs {ELEVEN_VOICE} {ELEVEN_MODEL}\n" if engine == "elevenlabs" else "{} {} {}\n".format(*KOKORO[code])
    if not made_with.exists() or made_with.read_text() != settings:
        index = {}
    wanted = {voice_id(t): (t, mood) for t, mood in lines}
    take = eleven_take if engine == "elevenlabs" else kokoro_take
    for vid, (text, mood) in wanted.items():
        if vid in index and (folder / f"{vid}.mp3").exists():
            continue
        out = folder / f"{vid}.mp3"
        take(box, code, text, mood, out)
        index[vid] = seconds(out)
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
    args = sys.argv[1:]
    engine = "elevenlabs" if "--elevenlabs" in args else "kokoro"
    codes = [a for a in args if not a.startswith("--")] or (LANGUAGES if engine == "elevenlabs" else list(KOKORO))
    known = LANGUAGES if engine == "elevenlabs" else KOKORO
    unknown = [c for c in codes if c not in known]
    if unknown:
        sys.exit(f"no {engine} voice for {', '.join(unknown)}")
    if engine == "elevenlabs" and not os.environ.get("ELEVENLABS_API_KEY"):
        sys.exit("set ELEVENLABS_API_KEY first (elevenlabs.io → Developers → API keys)")
    box: list = []
    for code in codes:
        record(engine, box, code)
    # the languages that have recordings, for the tour to ask only for those
    have = [c for c in LANGUAGES if (HERE / c / "voices.json").exists() and json.loads((HERE / c / "voices.json").read_text())]
    (HERE / "index.json").write_text(json.dumps(have) + "\n")
    print("recorded:", " ".join(have))


if __name__ == "__main__":
    sys.exit(main())
