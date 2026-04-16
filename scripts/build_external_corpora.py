from __future__ import annotations

import argparse
import bz2
import io
import json
import re
import tarfile
import unicodedata
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

try:
    import pyarrow.parquet as pq
except ImportError as exc:  # pragma: no cover
    raise SystemExit("pyarrow is required. Run: python -m pip install pyarrow") from exc

try:
    from pythainlp import word_tokenize
    from pythainlp.transliterate import romanize
except ImportError as exc:  # pragma: no cover
    raise SystemExit("pythainlp is required. Run: python -m pip install pythainlp") from exc


ROOT_DIR = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT_DIR / "external_corpus" / "raw"
OUT_DIR = ROOT_DIR / "external_corpus"
APP_DATA_PATH = ROOT_DIR / "app" / "data.js"

THAI_RE = re.compile(r"[\u0E00-\u0E7F]")
HANGUL_RE = re.compile(r"[가-힣]")
LATIN_RE = re.compile(r"[A-Za-z]")
MULTISPACE_RE = re.compile(r"\s+")
NON_ENGLISH_KEY_RE = re.compile(r"[^a-z0-9' -]+")
KOREAN_SENTENCE_END_RE = re.compile(r"(요|니다|세요|까요|죠|겠어요|했어요|할게요|주세요)$")
BLOCKED_TEXT_RE = re.compile(
    r"(https?://|www\.|<[^>]+>|@[A-Za-z0-9_]+|"
    r"hello,\s*world|hello world|"
    r"\b(?:fuck|shit|bitch|asshole|motherfucker|nigger|damn|"
    r"browser|server|database|directory|download|installation|window class|gtk|kde|kernel|gnu)\b)",
    re.IGNORECASE,
)

SKIP_GLOSS_PREFIXES = (
    "alternative form of",
    "alternative spelling of",
    "archaic form of",
    "clipping of",
    "contraction of",
    "dated form of",
    "misspelling of",
    "obsolete form of",
    "obsolete spelling of",
    "plural of",
    "romanization of",
    "spelling of",
    "synonym of",
)
SKIP_ENGLISH_KEYS = {
    "",
    "a",
    "an",
    "the",
    "to be",
    "to do",
    "to go",
    "to have",
    "be",
    "do",
    "go",
    "have",
    "yes",
    "no",
    "ok",
    "okay",
    "hey",
    "hi",
    "huh",
    "hmm",
}
PREFERRED_TERMS = {
    "aircon",
    "bathroom",
    "beautiful",
    "bus",
    "cash",
    "change",
    "coin",
    "computer",
    "dormitory",
    "education",
    "factory",
    "fruit",
    "gift",
    "hot",
    "how much",
    "ice",
    "internet",
    "laundry",
    "machine",
    "meeting",
    "money",
    "overtime",
    "price",
    "room",
    "salary",
    "shower",
    "start",
    "stock",
    "ticket",
    "time",
    "toilet",
    "training",
    "water",
    "watermelon",
    "wifi",
    "work",
}
ROMAN_WORD_MAP = {
    "a": "아",
    "aa": "아",
    "ai": "아이",
    "ao": "아오",
    "arai": "아라이",
    "baht": "밧",
    "bpai": "빠이",
    "chai": "차이",
    "chan": "찬",
    "dai": "다이",
    "dee": "디",
    "du": "두",
    "hai": "하이",
    "hong": "홍",
    "ka": "카",
    "kap": "캅",
    "khap": "캅",
    "khon": "콘",
    "khrap": "캅",
    "khun": "쿤",
    "krub": "캅",
    "laeo": "래우",
    "lai": "라이",
    "mai": "마이",
    "mak": "막",
    "maa": "마",
    "ma": "마",
    "nam": "남",
    "naam": "남",
    "nid": "닛",
    "noi": "너이",
    "pai": "빠이",
    "phom": "폼",
    "pom": "폼",
    "rao": "라오",
    "rot": "롯",
    "sabai": "사바이",
    "suai": "수아이",
    "tao": "타오",
    "tham": "탐",
    "thuk": "툭",
    "wai": "와이",
    "yang": "양",
    "yuu": "유",
}


def clean_text(value: object) -> str:
    return MULTISPACE_RE.sub(" ", str(value or "")).strip()


def compact_text(value: object) -> str:
    return re.sub(r"\s+", "", clean_text(value)).casefold()


def normalize_key(thai_script: str, korean: str) -> str:
    return f"{compact_text(thai_script)}||{compact_text(korean)}"


def clean_english_surface(value: str) -> str:
    value = clean_text(value).replace("’", "'").replace("“", '"').replace("”", '"')
    value = re.sub(r"^\([^)]*\)\s*", "", value)
    value = re.split(r"\s*[;/]\s*|\s+or\s+", value, maxsplit=1)[0]
    value = value.strip(" .,!?:\"'()[]{}")
    return clean_text(value)


def english_key(value: str) -> str:
    value = clean_english_surface(value).lower()
    value = NON_ENGLISH_KEY_RE.sub(" ", value)
    value = clean_text(value)
    return value


def has_hangul(value: str) -> bool:
    return bool(HANGUL_RE.search(value))


def has_thai(value: str) -> bool:
    return bool(THAI_RE.search(value))


def looks_bad_text(value: str) -> bool:
    return bool(BLOCKED_TEXT_RE.search(value))


def count_english_words(value: str) -> int:
    return len(re.findall(r"[a-z]+(?:'[a-z]+)?", value.lower()))


def normalize_roman_text(value: str) -> str:
    value = clean_text(value).lower().replace("-", " ")
    value = unicodedata.normalize("NFKD", value)
    value = "".join(char for char in value if not unicodedata.combining(char))
    value = re.sub(r"[^a-z\s]", " ", value)
    return clean_text(value)


def load_base_data() -> dict:
    if not APP_DATA_PATH.exists():
        return {"vocab": [], "sentences": []}
    text = APP_DATA_PATH.read_text(encoding="utf-8")
    match = re.search(r"window\.BASE_DATA = (\{.*\});\s*$", text, re.S)
    if not match:
        return {"vocab": [], "sentences": []}
    return json.loads(match.group(1))


class PronunciationResolver:
    def __init__(self, base_data: dict) -> None:
        self.phrase_map: dict[str, str] = {}
        token_votes: dict[str, Counter[str]] = defaultdict(Counter)

        for entry in [*base_data.get("vocab", []), *base_data.get("sentences", [])]:
            thai_script = clean_text(entry.get("thaiScript", ""))
            thai_pron = clean_text(entry.get("thai", ""))
            if not thai_script or not thai_pron:
                continue

            self.phrase_map.setdefault(compact_text(thai_script), thai_pron)

            script_tokens = [token for token in word_tokenize(thai_script, keep_whitespace=False) if clean_text(token)]
            pron_tokens = [token for token in thai_pron.split(" ") if token]
            if len(script_tokens) != len(pron_tokens):
                continue
            for script_token, pron_token in zip(script_tokens, pron_tokens):
                if has_thai(script_token) and pron_token:
                    token_votes[script_token][pron_token] += 1

        self.token_map = {
            script_token: votes.most_common(1)[0][0]
            for script_token, votes in token_votes.items()
            if votes
        }
        roman_votes: dict[str, Counter[str]] = defaultdict(Counter)
        for script_token, pron_token in self.token_map.items():
            roman_key = normalize_roman_text(romanize_thai_token(script_token))
            if roman_key:
                roman_votes[roman_key][pron_token] += 1
        self.roman_token_map = {
            roman_key: votes.most_common(1)[0][0]
            for roman_key, votes in roman_votes.items()
            if votes
        }

    def pronounce(self, thai_script: str, roman_hint: str = "") -> str:
        thai_script = clean_text(thai_script)
        roman_hint = clean_text(roman_hint)
        if not thai_script:
            return roman_hint

        exact = self.phrase_map.get(compact_text(thai_script))
        if exact:
            return exact

        tokens = [token for token in word_tokenize(thai_script, keep_whitespace=False) if clean_text(token)] or [thai_script]
        resolved: list[str] = []
        single_token_hint = roman_hint if len(tokens) == 1 else ""
        for token in tokens:
            mapped = self.token_map.get(token)
            if mapped:
                resolved.append(mapped)
                continue
            roman_token = normalize_roman_text(single_token_hint or romanize_thai_token(token))
            roman_mapped = self.roman_token_map.get(roman_token)
            if roman_mapped:
                resolved.append(roman_mapped)
                continue
            resolved.append(roman_to_korean(roman_token))
        return clean_text(" ".join(part for part in resolved if part))


def romanize_thai_token(text: str) -> str:
    text = clean_text(text)
    if not text:
        return ""
    try:
        romanized = clean_text(romanize(text))
    except Exception:
        romanized = ""
    return romanized or text


def roman_to_korean(value: str) -> str:
    value = normalize_roman_text(value)
    if not value:
        return ""
    if value in ROMAN_WORD_MAP:
        return ROMAN_WORD_MAP[value]
    tokens = [token for token in re.split(r"\s+", value) if token]
    resolved: list[str] = []
    for token in tokens:
        if token in ROMAN_WORD_MAP:
            resolved.append(ROMAN_WORD_MAP[token])
            continue
        resolved.append(token)
    return clean_text(" ".join(resolved))


def build_entry(
    korean: str,
    thai_script: str,
    pronunciation: str,
    *,
    note: str,
    keywords: list[str] | None = None,
    tags: list[str] | None = None,
) -> dict:
    return {
        "korean": clean_text(korean),
        "thai": clean_text(pronunciation) or clean_text(thai_script),
        "thaiScript": clean_text(thai_script),
        "note": clean_text(note),
        "keywords": [clean_text(item) for item in keywords or [] if clean_text(item)],
        "tags": [clean_text(item) for item in tags or [] if clean_text(item)],
    }


def write_payload(path: Path, source: str, vocab: list[dict], sentences: list[dict]) -> None:
    payload = {
        "source": source,
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "vocab": vocab,
        "sentences": sentences,
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def is_valid_parallel_pair(english: str, target: str, *, target_lang: str) -> bool:
    english = clean_text(english)
    target = clean_text(target)
    if not english or not target:
        return False
    if looks_bad_text(english) or looks_bad_text(target):
        return False
    if len(english) > 160 or len(target) > 120:
        return False
    if not LATIN_RE.search(english):
        return False
    if target_lang == "ko" and not has_hangul(target):
        return False
    if target_lang == "th" and not has_thai(target):
        return False
    return True


def is_clean_korean_vocab(korean: str) -> bool:
    korean = clean_text(korean)
    if not korean or not re.fullmatch(r"[가-힣0-9\s]+", korean):
        return False
    if KOREAN_SENTENCE_END_RE.search(korean):
        return False
    return True


def is_clean_korean_sentence(korean: str) -> bool:
    korean = clean_text(korean)
    if not korean or re.search(r"[A-Za-z]", korean):
        return False
    if re.search(r"^[-–•*#]", korean):
        return False
    if re.search(r"[♪♫<>_/\\]", korean):
        return False
    return True


def is_clean_thai_text(thai_script: str) -> bool:
    thai_script = clean_text(thai_script)
    return bool(thai_script) and not re.search(r"[A-Za-z<>_/\\]", thai_script)


def iter_opus_pairs(path: Path, target_lang: str):
    parquet = pq.ParquetFile(path)
    for batch in parquet.iter_batches(batch_size=2048, columns=["translation"]):
        translations = batch.column(0).to_pylist()
        for item in translations:
            english = clean_text(item.get("en", ""))
            target = clean_text(item.get(target_lang, ""))
            if is_valid_parallel_pair(english, target, target_lang=target_lang):
                yield english, target


def collect_english_counts(path: Path, target_lang: str) -> Counter[str]:
    counts: Counter[str] = Counter()
    for english, target in iter_opus_pairs(path, target_lang):
        key = english_key(english)
        if key and key not in SKIP_ENGLISH_KEYS:
            counts[key] += 1
    return counts


def collect_unique_parallel_map(path: Path, target_lang: str, counts: Counter[str]) -> dict[str, tuple[str, str]]:
    unique_map: dict[str, tuple[str, str]] = {}
    for english, target in iter_opus_pairs(path, target_lang):
        key = english_key(english)
        if not key or counts.get(key) != 1:
            continue
        unique_map.setdefault(key, (clean_english_surface(english), target))
    return unique_map


def is_vocab_candidate(english: str, korean: str, thai_script: str) -> bool:
    words = count_english_words(english)
    if words < 1 or words > 3:
        return False
    if len(korean) > 14 or len(thai_script) > 24:
        return False
    if not is_clean_korean_vocab(korean):
        return False
    if not is_clean_thai_text(thai_script):
        return False
    if re.search(r"[.?!]", english):
        return False
    return True


def score_pair(english: str, korean: str, thai_script: str, *, kind: str) -> int:
    words = count_english_words(english)
    score = 300
    score -= words * 18
    score -= min(abs(len(korean) - (7 if kind == "vocab" else 16)) * 4, 60)
    score -= min(abs(len(thai_script) - (10 if kind == "vocab" else 22)) * 3, 60)
    if kind == "sentence" and KOREAN_SENTENCE_END_RE.search(korean):
        score += 30
    if kind == "vocab" and " " not in korean:
        score += 30
    if any(term in english for term in PREFERRED_TERMS):
        score += 80
    if looks_bad_text(english) or looks_bad_text(korean) or looks_bad_text(thai_script):
        score -= 400
    return score


def build_opus_payload(
    resolver: PronunciationResolver,
    en_ko_path: Path,
    en_th_path: Path,
    *,
    limit_vocab: int,
    limit_sentences: int,
) -> tuple[list[dict], list[dict], dict[str, int], dict[str, str]]:
    ko_counts = collect_english_counts(en_ko_path, "ko")
    th_counts = collect_english_counts(en_th_path, "th")
    ko_unique = collect_unique_parallel_map(en_ko_path, "ko", ko_counts)
    th_unique = collect_unique_parallel_map(en_th_path, "th", th_counts)

    shared_keys = sorted(set(ko_unique) & set(th_unique))
    english_to_korean_lexicon: dict[str, str] = {}
    vocab_candidates: list[tuple[int, dict]] = []
    sentence_candidates: list[tuple[int, dict]] = []
    seen_pairs: set[str] = set()

    for key in shared_keys:
        english_surface, korean = ko_unique[key]
        _, thai_script = th_unique[key]
        if looks_bad_text(english_surface) or looks_bad_text(korean) or looks_bad_text(thai_script):
            continue
        if len(korean) < 2 or len(thai_script) < 2:
            continue
        if not is_clean_thai_text(thai_script):
            continue

        pair_key = normalize_key(thai_script, korean)
        if pair_key in seen_pairs:
            continue
        seen_pairs.add(pair_key)

        pronunciation = resolver.pronounce(thai_script)
        keywords = [english_surface]
        note = f"OPUS-100 English pivot: {english_surface}"

        if is_vocab_candidate(english_surface, korean, thai_script):
            vocab_candidates.append(
                (
                    score_pair(english_surface, korean, thai_script, kind="vocab"),
                    build_entry(korean, thai_script, pronunciation, note=note, keywords=keywords),
                )
            )
            english_to_korean_lexicon.setdefault(key, korean)
            continue

        words = count_english_words(english_surface)
        if words < 2 or words > 12:
            continue
        if not is_clean_korean_sentence(korean):
            continue
        sentence_candidates.append(
            (
                score_pair(english_surface, korean, thai_script, kind="sentence"),
                build_entry(korean, thai_script, pronunciation, note=note, keywords=keywords),
            )
        )

    vocab = [item for _, item in sorted(vocab_candidates, key=lambda pair: (-pair[0], pair[1]["korean"]))[:limit_vocab]]
    sentences = [
        item for _, item in sorted(sentence_candidates, key=lambda pair: (-pair[0], pair[1]["korean"]))[:limit_sentences]
    ]
    stats = {
        "sharedEnglishKeys": len(shared_keys),
        "opusVocabCandidates": len(vocab_candidates),
        "opusSentenceCandidates": len(sentence_candidates),
    }
    return vocab, sentences, stats, english_to_korean_lexicon


def iter_direct_tatoeba_pairs(kor_path: Path, tha_path: Path, links_path: Path):
    kor_map = load_sentence_map(kor_path)
    tha_map = load_sentence_map(tha_path)

    relevant = set(kor_map) | set(tha_map)
    seen: set[str] = set()

    with tarfile.open(links_path, "r:bz2") as archive:
        member = archive.getmember("links.csv")
        raw = archive.extractfile(member)
        if raw is None:
            return
        wrapper = io.TextIOWrapper(raw, encoding="utf-8", newline="")
        for line in wrapper:
            left, right = line.rstrip("\n").split("\t", 1)
            if left not in relevant and right not in relevant:
                continue

            if left in kor_map and right in tha_map:
                key = f"{left}:{right}"
                if key not in seen:
                    seen.add(key)
                    yield kor_map[left], tha_map[right]
            elif left in tha_map and right in kor_map:
                key = f"{right}:{left}"
                if key not in seen:
                    seen.add(key)
                    yield kor_map[right], tha_map[left]


def load_sentence_map(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    with bz2.open(path, "rt", encoding="utf-8") as handle:
        for line in handle:
            parts = line.rstrip("\n").split("\t", 2)
            if len(parts) == 3:
                out[parts[0]] = clean_text(parts[2])
    return out


def iter_tatoeba_english_pivot_pairs(kor_path: Path, tha_path: Path, eng_path: Path, links_path: Path):
    kor_map = load_sentence_map(kor_path)
    tha_map = load_sentence_map(tha_path)
    eng_map = load_sentence_map(eng_path)
    eng_to_kor: dict[str, set[str]] = defaultdict(set)
    eng_to_th: dict[str, set[str]] = defaultdict(set)

    with tarfile.open(links_path, "r:bz2") as archive:
        member = archive.getmember("links.csv")
        raw = archive.extractfile(member)
        if raw is None:
            return
        wrapper = io.TextIOWrapper(raw, encoding="utf-8", newline="")
        for line in wrapper:
            left, right = line.rstrip("\n").split("\t", 1)
            if left in eng_map and right in kor_map:
                eng_to_kor[left].add(right)
            elif right in eng_map and left in kor_map:
                eng_to_kor[right].add(left)
            elif left in eng_map and right in tha_map:
                eng_to_th[left].add(right)
            elif right in eng_map and left in tha_map:
                eng_to_th[right].add(left)

    shared_english_ids = sorted(set(eng_to_kor) & set(eng_to_th))
    for english_id in shared_english_ids:
        english = eng_map.get(english_id, "")
        if not english or looks_bad_text(english):
            continue
        for kor_id in sorted(eng_to_kor[english_id]):
            for th_id in sorted(eng_to_th[english_id]):
                yield english, kor_map[kor_id], tha_map[th_id]


def build_tatoeba_payload(
    resolver: PronunciationResolver,
    kor_path: Path,
    tha_path: Path,
    links_path: Path,
    *,
    limit_sentences: int,
) -> tuple[list[dict], dict[str, int]]:
    candidates: list[tuple[int, dict]] = []
    seen_pairs: set[str] = set()
    for korean, thai_script in iter_direct_tatoeba_pairs(kor_path, tha_path, links_path):
        if len(korean) < 2 or len(thai_script) < 2:
            continue
        if looks_bad_text(korean) or looks_bad_text(thai_script):
            continue
        if not is_clean_korean_sentence(korean) or not is_clean_thai_text(thai_script):
            continue
        pair_key = normalize_key(thai_script, korean)
        if pair_key in seen_pairs:
            continue
        seen_pairs.add(pair_key)
        pronunciation = resolver.pronounce(thai_script)
        entry = build_entry(
            korean,
            thai_script,
            pronunciation,
            note="Tatoeba direct Korean-Thai sentence pair",
        )
        candidates.append((score_pair("direct", korean, thai_script, kind="sentence"), entry))
    sentences = [item for _, item in sorted(candidates, key=lambda pair: (-pair[0], pair[1]["korean"]))[:limit_sentences]]
    return sentences, {"tatoebaSentenceCandidates": len(candidates)}


def build_tatoeba_english_pivot_payload(
    resolver: PronunciationResolver,
    kor_path: Path,
    tha_path: Path,
    eng_path: Path,
    links_path: Path,
    *,
    limit_vocab: int,
    limit_sentences: int,
) -> tuple[list[dict], list[dict], dict[str, int]]:
    vocab_candidates: list[tuple[int, dict]] = []
    sentence_candidates: list[tuple[int, dict]] = []
    seen_pairs: set[str] = set()
    total_pairs = 0

    for english, korean, thai_script in iter_tatoeba_english_pivot_pairs(kor_path, tha_path, eng_path, links_path):
        total_pairs += 1
        if len(korean) < 2 or len(thai_script) < 2:
            continue
        if looks_bad_text(korean) or looks_bad_text(thai_script):
            continue
        if not is_clean_thai_text(thai_script):
            continue

        pair_key = normalize_key(thai_script, korean)
        if pair_key in seen_pairs:
            continue
        seen_pairs.add(pair_key)

        pronunciation = resolver.pronounce(thai_script)
        note = f"Tatoeba English pivot: {clean_english_surface(english)}"
        entry = build_entry(
            korean,
            thai_script,
            pronunciation,
            note=note,
            keywords=[clean_english_surface(english)],
        )

        if is_vocab_candidate(english, korean, thai_script):
            vocab_candidates.append((score_pair(english, korean, thai_script, kind="vocab"), entry))
            continue
        if not is_clean_korean_sentence(korean):
            continue
        words = count_english_words(english)
        if words < 1 or words > 14:
            continue
        sentence_candidates.append((score_pair(english, korean, thai_script, kind="sentence"), entry))

    vocab = [item for _, item in sorted(vocab_candidates, key=lambda pair: (-pair[0], pair[1]["korean"]))[:limit_vocab]]
    sentences = [
        item for _, item in sorted(sentence_candidates, key=lambda pair: (-pair[0], pair[1]["korean"]))[:limit_sentences]
    ]
    return vocab, sentences, {
        "tatoebaEnglishPivotPairs": total_pairs,
        "tatoebaEnglishPivotVocabCandidates": len(vocab_candidates),
        "tatoebaEnglishPivotSentenceCandidates": len(sentence_candidates),
    }


def extract_kaikki_romanization(entry: dict) -> str:
    preferred: list[str] = []
    for form in entry.get("forms", []):
        tags = {clean_text(tag).lower() for tag in form.get("tags", [])}
        if "romanization" in tags and "obsolete" not in tags:
            preferred.append(clean_text(form.get("form", "")))
    for sound in entry.get("sounds", []):
        tags = {clean_text(tag).lower() for tag in sound.get("tags", [])}
        raw_tags = {clean_text(tag).lower() for tag in sound.get("raw_tags", [])}
        roman_value = clean_text(sound.get("roman", ""))
        if roman_value and ("romanization" in tags or "paiboon" in raw_tags):
            preferred.append(roman_value)
    return next((value for value in preferred if value), "")


def iter_kaikki_vocab(path: Path):
    allowed_pos = {"noun", "verb", "adj", "adv", "phrase", "interj", "pron"}
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            entry = json.loads(line)
            word = clean_text(entry.get("word", ""))
            pos = clean_text(entry.get("pos", "")).lower()
            if pos not in allowed_pos:
                continue
            if not has_thai(word):
                continue
            if len(word) > 24:
                continue

            roman_hint = extract_kaikki_romanization(entry)
            glosses: list[str] = []
            for sense in entry.get("senses", []):
                sense_tags = {clean_text(tag).lower() for tag in sense.get("tags", [])}
                if {"archaic", "obsolete"} & sense_tags:
                    continue
                for gloss in [*sense.get("glosses", []), *sense.get("raw_glosses", [])]:
                    gloss_key = english_key(gloss)
                    if not gloss_key or gloss_key in SKIP_ENGLISH_KEYS:
                        continue
                    if gloss_key.startswith(SKIP_GLOSS_PREFIXES):
                        continue
                    if looks_bad_text(gloss_key):
                        continue
                    if count_english_words(gloss_key) > 4:
                        continue
                    glosses.append(gloss_key)
            if glosses:
                yield word, roman_hint, pos, glosses


def build_kaikki_payload(
    resolver: PronunciationResolver,
    thai_path: Path,
    english_to_korean_lexicon: dict[str, str],
    *,
    limit_vocab: int,
) -> tuple[list[dict], dict[str, int]]:
    candidates: list[tuple[int, dict]] = []
    seen_pairs: set[str] = set()
    for thai_script, roman_hint, pos, glosses in iter_kaikki_vocab(thai_path):
        korean = ""
        matched_gloss = ""
        for gloss in glosses:
            korean = clean_text(english_to_korean_lexicon.get(gloss, ""))
            if korean:
                matched_gloss = gloss
                break
        if not korean or not has_hangul(korean):
            continue
        if not is_clean_korean_vocab(korean):
            continue
        pair_key = normalize_key(thai_script, korean)
        if pair_key in seen_pairs:
            continue
        seen_pairs.add(pair_key)
        pronunciation = resolver.pronounce(thai_script, roman_hint=roman_hint)
        entry = build_entry(
            korean,
            thai_script,
            pronunciation,
            note=f"Kaikki/Wiktionary gloss match: {matched_gloss}",
            keywords=[matched_gloss, pos],
        )
        candidates.append((score_pair(matched_gloss, korean, thai_script, kind="vocab"), entry))
    vocab = [item for _, item in sorted(candidates, key=lambda pair: (-pair[0], pair[1]["korean"]))[:limit_vocab]]
    return vocab, {"kaikkiVocabCandidates": len(candidates)}


def ensure_required_files(paths: list[Path]) -> None:
    missing = [str(path) for path in paths if not path.exists()]
    if missing:
        raise SystemExit("Missing raw corpus files:\n- " + "\n- ".join(missing))


def main() -> None:
    parser = argparse.ArgumentParser(description="Build curated external Korean-Thai corpora for the pocketbook app.")
    parser.add_argument("--limit-tatoeba-vocab", type=int, default=160)
    parser.add_argument("--limit-tatoeba-pivot-sentences", type=int, default=500)
    parser.add_argument("--limit-opus-vocab", type=int, default=700)
    parser.add_argument("--limit-opus-sentences", type=int, default=1800)
    parser.add_argument("--limit-tatoeba-direct-sentences", type=int, default=200)
    parser.add_argument("--limit-kaikki-vocab", type=int, default=900)
    parser.add_argument("--include-experimental", action="store_true")
    args = parser.parse_args()

    en_ko_path = RAW_DIR / "opus100_en_ko_train_0.parquet"
    en_th_path = RAW_DIR / "opus100_en_th_train_0.parquet"
    kor_path = RAW_DIR / "kor_sentences.tsv.bz2"
    tha_path = RAW_DIR / "tha_sentences.tsv.bz2"
    eng_path = RAW_DIR / "eng_sentences.tsv.bz2"
    links_path = RAW_DIR / "links.tar.bz2"
    thai_kaikki_path = RAW_DIR / "kaikki_thai.jsonl"

    ensure_required_files([kor_path, tha_path, eng_path, links_path])
    resolver = PronunciationResolver(load_base_data())

    tatoeba_vocab, tatoeba_pivot_sentences, tatoeba_pivot_stats = build_tatoeba_english_pivot_payload(
        resolver,
        kor_path,
        tha_path,
        eng_path,
        links_path,
        limit_vocab=args.limit_tatoeba_vocab,
        limit_sentences=args.limit_tatoeba_pivot_sentences,
    )
    tatoeba_direct_sentences, tatoeba_direct_stats = build_tatoeba_payload(
        resolver,
        kor_path,
        tha_path,
        links_path,
        limit_sentences=args.limit_tatoeba_direct_sentences,
    )

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    write_payload(OUT_DIR / "tatoeba.pivot.ko-th.json", "Tatoeba English pivot Korean-Thai", tatoeba_vocab, tatoeba_pivot_sentences)
    write_payload(OUT_DIR / "tatoeba.direct.ko-th.json", "Tatoeba direct Korean-Thai", [], tatoeba_direct_sentences)

    summary = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "tatoebaPivot": {
            "vocab": len(tatoeba_vocab),
            "sentences": len(tatoeba_pivot_sentences),
            **tatoeba_pivot_stats,
        },
        "tatoebaDirect": {
            "sentences": len(tatoeba_direct_sentences),
            **tatoeba_direct_stats,
        },
    }

    if args.include_experimental:
        ensure_required_files([en_ko_path, en_th_path, thai_kaikki_path])
        opus_vocab, opus_sentences, opus_stats, english_to_korean_lexicon = build_opus_payload(
            resolver,
            en_ko_path,
            en_th_path,
            limit_vocab=args.limit_opus_vocab,
            limit_sentences=args.limit_opus_sentences,
        )
        kaikki_vocab, kaikki_stats = build_kaikki_payload(
            resolver,
            thai_kaikki_path,
            english_to_korean_lexicon,
            limit_vocab=args.limit_kaikki_vocab,
        )
        write_payload(OUT_DIR / "opus100.pivot.ko-th.json", "OPUS-100 English pivot", opus_vocab, opus_sentences)
        write_payload(OUT_DIR / "kaikki.gloss.ko-th.json", "Kaikki Thai gloss match", kaikki_vocab, [])
        summary["opusExperimental"] = {
            "vocab": len(opus_vocab),
            "sentences": len(opus_sentences),
            **opus_stats,
        }
        summary["kaikkiExperimental"] = {
            "vocab": len(kaikki_vocab),
            **kaikki_stats,
            "englishLexicon": len(english_to_korean_lexicon),
        }

    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
