# External Corpus Folder

This folder stores curated JSON files that are loaded by `scripts/build_data.py`.

## Default Safe Layer

By default, `scripts/build_external_corpora.py` writes only high-confidence Tatoeba files:

- `tatoeba.pivot.ko-th.json`
- `tatoeba.direct.ko-th.json`

These are preferred because the Korean and Thai sentences are connected through the same Tatoeba translation graph.

## Experimental Layer

The script also contains builders for:

- OPUS-100 English pivot
- Kaikki Thai gloss matching

These are not loaded by default because their automatic pivot matching still needs tighter quality gates.

To generate the experimental files as well:

```powershell
python D:\Development\thai_phrase_web\scripts\build_external_corpora.py --include-experimental
```

## JSON Shape

```json
{
  "source": "Tatoeba English pivot Korean-Thai",
  "generatedAt": "2026-04-16T17:20:00",
  "vocab": [],
  "sentences": [
    {
      "thai": "swatdi 캅",
      "thaiScript": "สวัสดีครับ",
      "korean": "안녕하세요.",
      "tags": [],
      "note": "Tatoeba English pivot: Hello.",
      "keywords": ["Hello"]
    }
  ]
}
```

## Build Order

```powershell
python D:\Development\thai_phrase_web\scripts\build_external_corpora.py
python D:\Development\thai_phrase_web\scripts\build_data.py
```

## Raw Files

Large raw corpus files should stay in `external_corpus/raw/`. They are ignored by Git.
