# External Corpus Folder

이 폴더에 외부 코퍼스를 앱 포맷 JSON으로 넣으면 `build_data.py`가 빌드 시 자동으로 합칩니다.

## 지원 대상

- `Tatoeba`: 한-태 문장쌍 보강
- `OPUS`: 대규모 병렬 문장 데이터 보강
- `Wiktionary + Wiktextract`: 단어, 뜻, 번역, 품사 보강

## 기본 포맷

```json
{
  "source": "Tatoeba",
  "generatedAt": "2026-04-16T10:00:00",
  "vocab": [],
  "sentences": [
    {
      "thai": "ขอบคุณครับ",
      "thaiScript": "ขอบคุณครับ",
      "korean": "감사합니다",
      "tags": ["기본회화"],
      "note": "출처 Tatoeba"
    }
  ]
}
```

## 변환 스크립트 예시

```powershell
python D:\Development\thai_phrase_web\scripts\import_parallel_corpus.py `
  --input D:\corpus\tatoeba-ko-th.tsv `
  --output D:\Development\thai_phrase_web\external_corpus\tatoeba.sample.json `
  --source Tatoeba `
  --delimiter tsv `
  --thai-col 0 `
  --korean-col 1 `
  --tags 기본회화,일상 `
  --skip-header
```

## 빌드

```powershell
python D:\Development\thai_phrase_web\scripts\build_data.py
```
