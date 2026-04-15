from __future__ import annotations

import re
from typing import Iterable

DOMAIN_TAGS = {"식당", "이동", "쇼핑", "건강", "일터"}
SKIP_EXACT = {
    "안녕하세요",
    "감사합니다",
    "죄송합니다",
    "실례합니다",
    "괜찮아요",
    "잠깐만요",
    "도와주세요",
    "오늘",
    "내일",
    "어제",
    "아침",
    "저녁",
    "오전",
    "오후",
    "가능",
    "불가능",
    "분실",
    "예약",
    "수리",
    "청소",
    "도착",
    "출발",
    "체크인",
    "체크아웃",
}
SKIP_CONTAINS = (
    "안녕",
    "감사",
    "죄송",
    "실례",
    "괜찮",
    "천천히",
    "다시",
    "잠깐",
    "영어",
    "한국",
    "태국",
    "이름",
    "소개",
    "요일",
    "시간",
    "숫자",
    "가능",
    "불가능",
    "맛있",
    "맵다",
    "아프다",
    "빠르다",
    "느리다",
    "조심",
    "응급",
)
NOUN_DA_EXCEPTIONS = {
    "바다",
    "소다",
    "사이다",
}
PROCESS_ENDINGS = (
    "분실",
    "예약",
    "수리",
    "청소",
    "도착",
    "출발",
    "결제",
    "할인",
    "환불",
    "교환",
    "보증금",
)
POLITE_ENDINGS = (
    "요",
    "세요",
    "까요",
    "입니다",
    "습니다",
    "해요",
    "합니다",
    "부탁해요",
)
VERB_ENDINGS = (
    "하다",
    "되다",
    "싶다",
    "있다",
    "없다",
    "가다",
    "오다",
    "먹다",
    "마시다",
    "보다",
    "쓰다",
    "앉다",
    "서다",
    "자다",
    "열다",
    "닫다",
    "기다리다",
    "쉬다",
    "일하다",
)
PLACE_HINTS = (
    "방",
    "객실",
    "화장실",
    "욕실",
    "샤워실",
    "병원",
    "약국",
    "공항",
    "역",
    "정류장",
    "플랫폼",
    "호텔",
    "숙소",
    "프런트",
    "로비",
    "카운터",
    "입구",
    "출구",
    "식당",
    "카페",
    "시장",
    "매장",
    "가게",
    "은행",
    "편의점",
    "주차장",
    "수영장",
    "해변",
    "바닷가",
    "사무실",
    "공장",
    "창고",
    "회의실",
    "백화점",
    "쇼핑몰",
    "약국",
    "경찰서",
    "버스터미널",
    "터미널",
    "기차역",
    "지하철역",
    "전철역",
    "선착장",
    "부두",
    "환전소",
    "세탁소",
    "헬스장",
    "공원",
    "사원",
    "절",
    "샤워실",
)

VOCAB_SUFFIX_TEMPLATES = (
    ("이 {base}", "{thai} 니", "{script}นี้"),
    ("저 {base}", "{thai} 난", "{script}นั้น"),
    ("새 {base}", "{thai} 마이", "{script}ใหม่"),
    ("다른 {base}", "{thai} 은", "{script}อื่น"),
    ("좋은 {base}", "{thai} 디", "{script}ดี"),
    ("큰 {base}", "{thai} 야이", "{script}ใหญ่"),
    ("작은 {base}", "{thai} 렉", "{script}เล็ก"),
    ("깨끗한 {base}", "{thai} 사앗", "{script}สะอาด"),
    ("조용한 {base}", "{thai} 응엡", "{script}เงียบ"),
    ("차가운 {base}", "{thai} 옌", "{script}เย็น"),
    ("뜨거운 {base}", "{thai} 런", "{script}ร้อน"),
    ("빠른 {base}", "{thai} 레오", "{script}เร็ว"),
    ("느린 {base}", "{thai} 차", "{script}ช้า"),
    ("비싼 {base}", "{thai} 팽", "{script}แพง"),
    ("싼 {base}", "{thai} 툭", "{script}ถูก"),
)

VOCAB_PREFIX_TEMPLATES = (
    ("{base} 있음", "미 {thai}", "มี{script}"),
    ("{base} 없음", "마이 미 {thai}", "ไม่มี{script}"),
    ("{base} 필요", "똥깐 {thai}", "ต้องการ{script}"),
    ("{base} 확인", "트루앗 {thai}", "ตรวจ{script}"),
    ("{base} 문제", "{thai} 미 빤하", "{script}มีปัญหา"),
)

SHOPPING_ITEM_SENTENCE_TEMPLATES = (
    ("이 {base} 주세요", "커 {thai} 니 너이 캅", "ขอ{script}นี้หน่อยครับ"),
    ("{base} 있어요?", "미 {thai} 마이 캅", "มี{script}ไหมครับ"),
    ("{base} 더 주세요", "커 {thai} 퍼엠 너이 캅", "ขอ{script}เพิ่มหน่อยครับ"),
    ("다른 {base} 있어요?", "미 {thai} 은 마이 캅", "มี{script}อื่นไหมครับ"),
    ("새 {base} 주세요", "커 {thai} 마이 너이 캅", "ขอ{script}ใหม่หน่อยครับ"),
    ("{base} 하나만 주세요", "커 {thai} 능 안 너이 캅", "ขอ{script}หนึ่งอันหน่อยครับ"),
    ("{base} 필요해요", "폼 똥깐 {thai} 캅", "ผมต้องการ{script}ครับ"),
    ("{base} 급하게 필요해요", "폼 똥깐 {thai} 두언 캅", "ผมต้องการ{script}ด่วนครับ"),
    ("{base} 보여주세요", "커 두 {thai} 너이 캅", "ขอดู{script}หน่อยครับ"),
    ("{base} 어디서 사요?", "{thai} 쓰으 티 나이 캅", "{script}ซื้อที่ไหนครับ"),
    ("{base} 바꿔주세요", "츄어이 쁠리안 {thai} 하이 너이 캅", "ช่วยเปลี่ยน{script}ให้หน่อยครับ"),
    ("{base} 다시 주세요", "커 {thai} 이끈 크랑 너이 캅", "ขอ{script}อีกครั้งหน่อยครับ"),
    ("{base} 얼마예요?", "{thai} 타오라이 캅", "{script}เท่าไรครับ"),
)

SUPPLY_ITEM_SENTENCE_TEMPLATES = (
    ("이 {base} 주세요", "커 {thai} 니 너이 캅", "ขอ{script}นี้หน่อยครับ"),
    ("{base} 있어요?", "미 {thai} 마이 캅", "มี{script}ไหมครับ"),
    ("{base} 더 주세요", "커 {thai} 퍼엠 너이 캅", "ขอ{script}เพิ่มหน่อยครับ"),
    ("다른 {base} 있어요?", "미 {thai} 은 마이 캅", "มี{script}อื่นไหมครับ"),
    ("새 {base} 주세요", "커 {thai} 마이 너이 캅", "ขอ{script}ใหม่หน่อยครับ"),
    ("{base} 하나만 주세요", "커 {thai} 능 안 너이 캅", "ขอ{script}หนึ่งอันหน่อยครับ"),
    ("{base} 필요해요", "폼 똥깐 {thai} 캅", "ผมต้องการ{script}ครับ"),
    ("{base} 급하게 필요해요", "폼 똥깐 {thai} 두언 캅", "ผมต้องการ{script}ด่วนครับ"),
    ("{base} 보여주세요", "커 두 {thai} 너이 캅", "ขอดู{script}หน่อยครับ"),
    ("{base} 확인해주세요", "츄어이 트루앗 {thai} 너이 캅", "ช่วยตรวจ{script}หน่อยครับ"),
    ("{base} 바꿔주세요", "츄어이 쁠리안 {thai} 하이 너이 캅", "ช่วยเปลี่ยน{script}ให้หน่อยครับ"),
    ("{base} 다시 주세요", "커 {thai} 이끈 크랑 너이 캅", "ขอ{script}อีกครั้งหน่อยครับ"),
    ("{base} 준비해주세요", "츄어이 뜨리얌 {thai} 너이 캅", "ช่วยเตรียม{script}หน่อยครับ"),
    ("{base} 가져다 주세요", "츄어이 아오 {thai} 마 하이 너이 캅", "ช่วยเอา{script}มาให้หน่อยครับ"),
)

FOOD_ITEM_SENTENCE_TEMPLATES = (
    ("이 {base} 주세요", "커 {thai} 니 너이 캅", "ขอ{script}นี้หน่อยครับ"),
    ("{base} 있어요?", "미 {thai} 마이 캅", "มี{script}ไหมครับ"),
    ("{base} 더 주세요", "커 {thai} 퍼엠 너이 캅", "ขอ{script}เพิ่มหน่อยครับ"),
    ("다른 {base} 있어요?", "미 {thai} 은 마이 캅", "มี{script}อื่นไหมครับ"),
    ("{base} 하나만 주세요", "커 {thai} 능 안 너이 캅", "ขอ{script}หนึ่งอันหน่อยครับ"),
    ("{base} 보여주세요", "커 두 {thai} 너이 캅", "ขอดู{script}หน่อยครับ"),
    ("{base} 얼마예요?", "{thai} 타오라이 캅", "{script}เท่าไรครับ"),
)

TOOL_ITEM_SENTENCE_TEMPLATES = (
    ("{base} 있어요?", "미 {thai} 마이 캅", "มี{script}ไหมครับ"),
    ("{base} 더 주세요", "커 {thai} 퍼엠 너이 캅", "ขอ{script}เพิ่มหน่อยครับ"),
    ("{base} 필요해요", "폼 똥깐 {thai} 캅", "ผมต้องการ{script}ครับ"),
    ("{base} 급하게 필요해요", "폼 똥깐 {thai} 두언 캅", "ผมต้องการ{script}ด่วนครับ"),
    ("{base} 보여주세요", "커 두 {thai} 너이 캅", "ขอดู{script}หน่อยครับ"),
    ("{base} 잠시 빌릴 수 있어요?", "커 여음 {thai} 다이 마이 캅", "ขอยืม{script}ได้ไหมครับ"),
    ("{base} 확인해주세요", "츄어이 트루앗 {thai} 너이 캅", "ช่วยตรวจ{script}หน่อยครับ"),
    ("{base} 바꿔주세요", "츄어이 쁠리안 {thai} 하이 너이 캅", "ช่วยเปลี่ยน{script}ให้หน่อยครับ"),
    ("{base} 다시 주세요", "커 {thai} 이끈 크랑 너이 캅", "ขอ{script}อีกครั้งหน่อยครับ"),
    ("{base} 준비해주세요", "츄어이 뜨리얌 {thai} 너이 캅", "ช่วยเตรียม{script}หน่อยครับ"),
    ("{base} 안 보여요", "{thai} 마이 헨 캅", "{script}ไม่เห็นครับ"),
    ("{base} 잃어버렸어요", "폼 탐 {thai} 하이 캅", "ผมทำ{script}หายครับ"),
    ("{base} 가져다 주세요", "츄어이 아오 {thai} 마 하이 너이 캅", "ช่วยเอา{script}มาให้หน่อยครับ"),
)

PLACE_SENTENCE_TEMPLATES = (
    ("{base} 어디예요?", "{thai} 유 티 나이 캅", "{script}อยู่ที่ไหนครับ"),
    ("{base} 있어요?", "미 {thai} 마이 캅", "มี{script}ไหมครับ"),
    ("{base} 가고 싶어요", "폼 야크 빠이 {thai} 캅", "ผมอยากไป{script}ครับ"),
    ("지금 {base} 가요", "톤니 폼 짜 빠이 {thai} 캅", "ตอนนี้ผมจะไป{script}ครับ"),
    ("{base} 찾고 있어요", "폼 깜랑 하 {thai} 유 캅", "ผมกำลังหา{script}อยู่ครับ"),
    ("{base} 가까워요?", "{thai} 끌라이 마이 캅", "{script}ใกล้ไหมครับ"),
    ("{base} 멀어요?", "{thai} 끌라이 마이 캅", "{script}ไกลไหมครับ"),
    ("{base} 어떻게 가요?", "빠이 {thai} 양아이 캅", "ไป{script}ยังไงครับ"),
    ("여기서 {base} 가까워요?", "{thai} 짜 티 니 끌라이 마이 캅", "{script}จากที่นี่ใกล้ไหมครับ"),
    ("{base} 열려 있어요?", "{thai} 쁘읻 유 마이 캅", "{script}เปิดอยู่ไหมครับ"),
    ("오늘 {base} 열어요?", "완 니 {thai} 쁘읻 마이 캅", "วันนี้{script}เปิดไหมครับ"),
    ("{base} 안에 들어가도 돼요?", "카오 빠이 {thai} 다이 마이 캅", "เข้าไป{script}ได้ไหมครับ"),
    ("{base} 지금 가도 돼요?", "톤니 빠이 {thai} 다이 마이 캅", "ตอนนี้ไป{script}ได้ไหมครับ"),
    ("지금 바로 {base} 갈 수 있어요?", "톤니 빠이 {thai} 다이 러이 마이 캅", "ตอนนี้ไป{script}ได้เลยไหมครับ"),
    ("{base} 여기가 맞아요?", "{thai} 티니 차이 마이 캅", "{script}ที่นี่ใช่ไหมครับ"),
    ("{base} 몇 층이에요?", "{thai} 유 찬 아라이 캅", "{script}อยู่ชั้นอะไรครับ"),
    ("{base} 언제 열어요?", "{thai} 쁘읻 끼 몽 캅", "{script}เปิดกี่โมงครับ"),
)

FOOD_HINTS = (
    "과일",
    "수박",
    "주스",
    "음료",
    "생수",
    "물",
    "커피",
    "차",
    "밥",
    "볶음밥",
    "국수",
    "음식",
    "망고",
    "바나나",
    "오렌지",
    "맥주",
    "와인",
    "고기",
    "새우",
    "생선",
    "닭",
    "돼지",
    "소고기",
    "고수",
)

SUPPLY_HINTS = (
    "수건",
    "휴지",
    "화장지",
    "티슈",
    "냅킨",
    "충전기",
    "차저",
    "어댑터",
    "키카드",
    "담요",
    "베개",
    "드라이기",
    "비누",
    "샴푸",
    "칫솔",
    "치약",
    "옷걸이",
    "생수",
    "물",
)

TOOL_HINTS = (
    "드라이버",
    "커터",
    "칼",
    "가위",
    "망치",
    "펜치",
    "렌치",
    "스패너",
    "드릴",
    "비트",
    "엔드밀",
    "공구",
    "테이프",
    "줄자",
    "사다리",
)

SKIP_ITEM_SENTENCE_HINTS = (
    "빨래",
    "세탁",
    "세탁기",
    "세탁실",
    "세탁소",
    "컴퓨터",
    "노트북",
    "인터넷",
    "와이파이",
    "에어컨",
    "온수",
    "도어락",
    "동전",
    "잔돈",
    "거스름돈",
    "지폐",
    "현금",
    "주식",
    "주가",
    "투자",
    "가격",
    "할인",
    "담배",
    "흡연",
    "금연",
    "흡연실",
    "금연실",
)


def clean_text(value: object) -> str:
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value).strip())


def compact_text(value: object) -> str:
    return re.sub(r"[^0-9a-zA-Z가-힣\u0E00-\u0E7F]+", "", clean_text(value)).lower()


def unique(items: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        text = clean_text(item)
        if not text:
            continue
        marker = compact_text(text)
        if marker in seen:
            continue
        seen.add(marker)
        result.append(text)
    return result


def split_korean_variants(value: str) -> list[str]:
    cleaned = re.sub(r"\([^)]*\)", "", clean_text(value))
    return unique(re.split(r"[/|,·]| 또는 | 혹은 ", cleaned))


def looks_polite_phrase(text: str) -> bool:
    value = clean_text(text)
    if not value:
        return True
    if any(mark in value for mark in "?!.,"):
        return True
    if len(value.split()) >= 4:
        return True
    return any(value.endswith(ending) for ending in POLITE_ENDINGS)


def looks_verbish(text: str) -> bool:
    value = clean_text(text)
    if any(value.endswith(ending) for ending in VERB_ENDINGS):
        return True
    if re.fullmatch(r"[가-힣 ]+", value) and value.endswith("다") and value not in NOUN_DA_EXCEPTIONS:
        return True
    return False


def looks_process_like(text: str) -> bool:
    value = clean_text(text)
    if not value:
        return True
    return any(value.endswith(ending) for ending in PROCESS_ENDINGS)


def has_domain_value(tags: list[str], text: str) -> bool:
    if any(tag in DOMAIN_TAGS for tag in tags):
        return True
    return any(hint in text for hint in PLACE_HINTS)


def is_seed_candidate(variant: str, tags: list[str]) -> bool:
    value = clean_text(variant)
    if not value:
        return False
    if value in SKIP_EXACT:
        return False
    if len(value) > 18:
        return False
    if looks_polite_phrase(value) or looks_verbish(value) or looks_process_like(value):
        return False
    if any(piece in value for piece in SKIP_CONTAINS):
        return False
    if not has_domain_value(tags, value):
        return False
    return True


def is_place_like(seed: dict) -> bool:
    text = clean_text(seed["korean"])
    if any(hint in text for hint in PLACE_HINTS):
        return True
    tags = set(seed.get("tags") or [])
    return "이동" in tags and (
        text.endswith(("실", "장", "역", "항", "소"))
        or any(token in text for token in ("로비", "카운터"))
    )


def matches_hint(text: str, hints: tuple[str, ...]) -> bool:
    return any(hint in text for hint in hints)


def get_item_sentence_templates(seed: dict) -> tuple[tuple[str, str, str], ...]:
    text = clean_text(seed["korean"])
    tags = set(seed.get("tags") or [])
    if matches_hint(text, SKIP_ITEM_SENTENCE_HINTS):
        return ()
    if matches_hint(text, SUPPLY_HINTS):
        return SUPPLY_ITEM_SENTENCE_TEMPLATES
    if "식당" in tags or matches_hint(text, FOOD_HINTS):
        return FOOD_ITEM_SENTENCE_TEMPLATES
    if "일터" in tags or matches_hint(text, TOOL_HINTS):
        return TOOL_ITEM_SENTENCE_TEMPLATES
    return SHOPPING_ITEM_SENTENCE_TEMPLATES


def add_generated_entry(
    bucket: list[dict],
    seen: set[tuple[str, str]],
    *,
    korean: str,
    thai: str,
    thai_script: str,
    tags: list[str],
    keywords: Iterable[str] | None = None,
) -> None:
    compact_korean = compact_text(korean)
    compact_script = compact_text(thai_script)
    if not compact_korean or not compact_script:
        return
    key = (compact_korean, compact_script)
    if key in seen:
        return
    seen.add(key)
    item = {
        "thai": clean_text(thai),
        "thaiScript": clean_text(thai_script),
        "korean": clean_text(korean),
        "tags": list(tags),
    }
    keyword_list = unique(keywords or [])
    if keyword_list:
        item["keywords"] = keyword_list
    bucket.append(item)


def build_seed_terms(seed_entries: list[dict]) -> list[dict]:
    seeds: list[dict] = []
    seen: set[tuple[str, str]] = set()

    for entry in seed_entries:
        thai = clean_text(entry.get("thai", ""))
        thai_script = clean_text(entry.get("thaiScript", ""))
        tags = list(entry.get("tags") or [])
        if not thai or not thai_script:
            continue

        for variant in split_korean_variants(entry.get("korean", "")):
            if not is_seed_candidate(variant, tags):
                continue
            key = (compact_text(variant), compact_text(thai_script))
            if key in seen:
                continue
            seen.add(key)
            seeds.append(
                {
                    "korean": clean_text(variant),
                    "thai": thai,
                    "thaiScript": thai_script,
                    "tags": tags,
                    "keywords": unique([variant, *(entry.get("keywords") or [])[:4]]),
                }
            )
    return seeds


def generate_bulk_entries(seed_entries: list[dict]) -> tuple[list[dict], list[dict]]:
    seeds = build_seed_terms(seed_entries)
    vocab_entries: list[dict] = []
    sentence_entries: list[dict] = []
    seen_vocab: set[tuple[str, str]] = set()
    seen_sentence: set[tuple[str, str]] = set()

    for seed in seeds:
        base = seed["korean"]
        thai = seed["thai"]
        thai_script = seed["thaiScript"]
        tags = seed["tags"]
        seed_keywords = seed["keywords"]

        for korean_template, thai_template, script_template in VOCAB_SUFFIX_TEMPLATES:
            add_generated_entry(
                vocab_entries,
                seen_vocab,
                korean=korean_template.format(base=base),
                thai=thai_template.format(thai=thai),
                thai_script=script_template.format(script=thai_script),
                tags=tags,
                keywords=[base, *seed_keywords],
            )

        for korean_template, thai_template, script_template in VOCAB_PREFIX_TEMPLATES:
            add_generated_entry(
                vocab_entries,
                seen_vocab,
                korean=korean_template.format(base=base),
                thai=thai_template.format(thai=thai),
                thai_script=script_template.format(script=thai_script),
                tags=tags,
                keywords=[base, *seed_keywords],
            )

        sentence_templates = PLACE_SENTENCE_TEMPLATES if is_place_like(seed) else get_item_sentence_templates(seed)
        for korean_template, thai_template, script_template in sentence_templates:
            add_generated_entry(
                sentence_entries,
                seen_sentence,
                korean=korean_template.format(base=base),
                thai=thai_template.format(thai=thai),
                thai_script=script_template.format(script=thai_script),
                tags=tags,
                keywords=[base, *seed_keywords],
            )

    return vocab_entries, sentence_entries
