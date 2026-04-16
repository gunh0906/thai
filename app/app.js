const STORAGE_KEY = "thai-pocketbook-custom-v1";
const EXPORT_VERSION = 1;
const AI_STORAGE_KEY = "thai-pocketbook-ai-v1";
const APP_VERSION = "20260416y";
const AI_ASSIST_MIN_QUERY_LENGTH = 2;
const AI_RESULT_LIMITS = {
  vocab: 3,
  sentences: 4,
};
const DEFAULT_AI_SETTINGS = {
  enabled: false,
  mode: "manual",
  endpoint: "",
  accessToken: "",
};

const baseData = window.BASE_DATA || {
  appTitle: "태국어 포켓북",
  note: "",
  scenarios: [],
  vocab: [],
  sentences: [],
  stats: {},
};

const THAI_SCRIPT_OVERRIDE_PAIRS = [
  ["저는", "ผม"],
  ["입니다.", "เป็น"],
  ["입니다", "เป็น"],
  ["사람", "คน"],
  ["한국", "เกาหลี"],
  ["태국", "ไทย"],
  ["주세요", "ขอ"],
  ["어떻게", "อย่างไร"],
  ["어때요", "เป็นอย่างไร"],
  ["뭐예요?", "อะไร"],
  ["맞다", "ใช่"],
  ["뭐라고?", "ว่าอะไรนะ"],
  ["아니다", "ไม่"],
  ["이것", "อันนี้"],
  ["아니에요", "ไม่ใช่"],
  ["중요하다", "สำคัญ"],
  ["중요하지 않아", "ไม่สำคัญ"],
  ["가능한", "เป็นไปได้"],
  ["몰라요", "ไม่รู้"],
  ["불가능", "เป็นไปไม่ได้"],
  ["고장", "เสีย"],
  ["죄송합니다.", "ขอโทษ"],
  ["배고프다", "หิว"],
  ["침착해", "ใจเย็นๆ"],
  ["급하다.", "รีบ"],
  ["못해요", "ทำไม่ได้"],
  ["화장실", "ห้องน้ำ"],
  ["따뜻하다", "อุ่น"],
  ["어렵다", "ยาก"],
  ["춥다", "หนาว"],
  ["좋아", "ดี"],
  ["안좋아", "ไม่ดี"],
  ["싫어", "ไม่ชอบ"],
  ["왜?", "ทำไม"],
  ["덥다", "ร้อน"],
  ["좋아한다", "ชอบ"],
  ["누구", "ใคร"],
  ["언제", "เมื่อไร"],
  ["늦다", "ช้า"],
  ["늦어요", "สาย"],
  ["어느", "ไหน"],
  ["시간", "เวลา"],
  ["밥", "ข้าว"],
  ["사다", "ซื้อ"],
];

const SUPPLEMENTAL_DATA = {
  vocab: [
    {
      id: "supp-vocab-noise",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "씨앙 롭꾼",
      thaiScript: "เสียงรบกวน",
      korean: "소음",
      note: "시끄러운 소리 / 소음",
      tags: ["기본회화", "이동"],
      keywords: ["시끄럽다", "시끄러워요", "소리", "소음", "조용하다"],
    },
    {
      id: "supp-vocab-machine-noise",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "씨앙 크르엉",
      thaiScript: "เสียงเครื่อง",
      korean: "기계 소음",
      note: "기계에서 나는 큰 소리",
      tags: ["일터"],
      keywords: ["기계", "장비", "설비", "소음", "시끄럽다"],
    },
    {
      id: "supp-vocab-internet",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "인터넷",
      thaiScript: "อินเทอร์เน็ต",
      korean: "인터넷",
      note: "인터넷 / 온라인 연결",
      tags: ["기본회화", "이동"],
      keywords: ["와이파이", "wifi", "인터넷", "연결"],
    },
    {
      id: "supp-vocab-education",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "깐 업롬",
      thaiScript: "การอบรม",
      korean: "교육",
      note: "교육 / 트레이닝 / 오리엔테이션",
      tags: ["기본회화", "일터"],
      keywords: ["교육", "훈련", "트레이닝", "오리엔테이션", "수업", "안전교육", "입사교육", "교육 시작"],
    },
    {
      id: "supp-vocab-training",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "깐 푹 업롬",
      thaiScript: "การฝึกอบรม",
      korean: "훈련",
      note: "훈련 / 실습 교육",
      tags: ["일터"],
      keywords: ["훈련", "실습", "교육", "트레이닝", "훈련 시작"],
    },
    {
      id: "supp-vocab-orientation",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "빠티닛텟",
      thaiScript: "ปฐมนิเทศ",
      korean: "오리엔테이션",
      note: "입사 안내 / 오리엔테이션",
      tags: ["일터"],
      keywords: ["오리엔테이션", "교육", "입사교육", "안내", "오리엔테이션 시작"],
    },
    {
      id: "supp-vocab-duty",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "응안",
      thaiScript: "งาน",
      korean: "업무",
      note: "업무 / 일",
      tags: ["일터"],
      keywords: ["업무", "일", "작업", "근무", "업무 시작"],
    },
    {
      id: "supp-vocab-task",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "간 탐 응안",
      thaiScript: "การทำงาน",
      korean: "작업",
      note: "작업 / 실제 일하는 과정",
      tags: ["일터"],
      keywords: ["작업", "업무", "일", "작업 시작", "작업 지시"],
    },
    {
      id: "supp-vocab-meeting",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "쁘라춤",
      thaiScript: "ประชุม",
      korean: "회의",
      note: "회의 / 미팅",
      tags: ["일터"],
      keywords: ["회의", "미팅", "회의 시작", "회의 시간"],
    },
    {
      id: "supp-vocab-education-start",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "뢰엄 깐 업롬",
      thaiScript: "เริ่มการอบรม",
      korean: "교육 시작",
      note: "교육을 시작함",
      tags: ["일터"],
      keywords: ["교육 시작", "훈련 시작", "오리엔테이션 시작"],
    },
    {
      id: "supp-vocab-work-start",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "뢰엄 응안",
      thaiScript: "เริ่มงาน",
      korean: "업무 시작",
      note: "일을 시작함",
      tags: ["일터"],
      keywords: ["업무 시작", "일 시작", "작업 시작", "근무 시작"],
    },
    {
      id: "supp-vocab-wrong",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "핏",
      thaiScript: "ผิด",
      korean: "잘못",
      note: "틀림 / 잘못",
      tags: ["기본회화"],
      keywords: ["잘못", "잘못됐다", "잘못됐어요", "틀리다", "틀렸어", "틀렸어요"],
    },
    {
      id: "supp-vocab-wrong-answer",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "마이 툭",
      thaiScript: "ไม่ถูก",
      korean: "틀리다",
      note: "맞지 않다 / 틀리다",
      tags: ["기본회화"],
      keywords: ["틀리다", "틀렸어", "틀렸어요", "정답이 아니다", "잘못"],
    },
  ],
  sentences: [
    {
      id: "supp-sentence-room-noisy",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "홍 니 씨앙 당",
      thaiScript: "ห้องนี้เสียงดัง",
      korean: "방이 시끄러워요",
      note: "방 안 소음이 클 때",
      tags: ["기본회화", "이동"],
      keywords: ["시끄럽다", "소음", "조용한 방", "방 문제"],
    },
    {
      id: "supp-sentence-machine-noisy",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "크르엉 당 막",
      thaiScript: "เครื่องดังมาก",
      korean: "기계가 너무 시끄러워요",
      note: "기계 소리가 너무 클 때",
      tags: ["일터"],
      keywords: ["기계", "장비", "설비", "시끄럽다", "소음"],
    },
    {
      id: "supp-sentence-machine-noise-heavy",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "씨앙 크르엉 당 막",
      thaiScript: "เสียงเครื่องดังมาก",
      korean: "기계 소음이 심해요",
      note: "기계 소음이 심해서 확인이 필요할 때",
      tags: ["일터"],
      keywords: ["기계", "소음", "시끄럽다", "확인", "수리"],
    },
    {
      id: "supp-sentence-wifi-down",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "와이파이 차이 마이 다이",
      thaiScript: "ไวไฟใช้ไม่ได้",
      korean: "와이파이가 안 돼요",
      note: "와이파이 연결이 안 될 때",
      tags: ["기본회화", "이동"],
      keywords: ["와이파이", "wifi", "인터넷", "안 돼요", "연결"],
    },
    {
      id: "supp-sentence-internet-down",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "인터넷 차이 마이 다이",
      thaiScript: "อินเทอร์เน็ตใช้ไม่ได้",
      korean: "인터넷이 안 돼요",
      note: "인터넷이 안 될 때",
      tags: ["기본회화", "이동"],
      keywords: ["인터넷", "와이파이", "안 돼요", "연결 문제"],
    },
    {
      id: "supp-sentence-internet-slow",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "인터넷 차 막",
      thaiScript: "อินเทอร์เน็ตช้ามาก",
      korean: "인터넷이 너무 느려요",
      note: "인터넷 속도가 너무 느릴 때",
      tags: ["기본회화", "이동"],
      keywords: ["인터넷", "와이파이", "느리다", "속도"],
    },
    {
      id: "supp-sentence-education-start",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "뢰엄 깐 업롬 깐 캅",
      thaiScript: "เริ่มการอบรมกันครับ",
      korean: "교육 시작합시다",
      note: "교육이나 트레이닝을 시작할 때",
      tags: ["일터"],
      keywords: ["교육 시작", "훈련 시작", "오리엔테이션 시작", "교육"],
    },
    {
      id: "supp-sentence-education-when-start",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "깐 업롬 뢰엄 므아라이 캅",
      thaiScript: "การอบรมเริ่มเมื่อไรครับ",
      korean: "교육 언제 시작해요?",
      note: "교육 시작 시간을 물을 때",
      tags: ["일터", "숫자·시간"],
      keywords: ["교육", "훈련", "오리엔테이션", "언제 시작", "교육 시간"],
    },
    {
      id: "supp-sentence-work-start",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "뢰엄 응안 깐 캅",
      thaiScript: "เริ่มงานกันครับ",
      korean: "업무 시작합시다",
      note: "업무를 시작할 때",
      tags: ["일터"],
      keywords: ["업무 시작", "일 시작", "근무 시작"],
    },
    {
      id: "supp-sentence-task-start",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "뢰엄 응안 로이 캅",
      thaiScript: "เริ่มงานเลยครับ",
      korean: "작업 시작할게요",
      note: "작업을 바로 시작한다고 말할 때",
      tags: ["일터"],
      keywords: ["작업 시작", "업무 시작", "바로 시작"],
    },
    {
      id: "supp-sentence-meeting-start",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "뢰엄 쁘라춤 깐 캅",
      thaiScript: "เริ่มประชุมกันครับ",
      korean: "회의 시작합시다",
      note: "회의를 시작할 때",
      tags: ["일터"],
      keywords: ["회의 시작", "미팅 시작", "회의"],
    },
    {
      id: "supp-sentence-this-wrong",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "안 니 핏 캅",
      thaiScript: "อันนี้ผิดครับ",
      korean: "이건 잘못됐어요",
      note: "내 앞의 것이나 현재 방법이 틀렸다고 말할 때",
      tags: ["기본회화"],
      keywords: ["이건 잘못되었어", "이건 잘못됐어", "이건 틀렸어", "이건 틀렸어요", "잘못", "틀리다"],
    },
    {
      id: "supp-sentence-that-wrong",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "안 난 핏 캅",
      thaiScript: "อันนั้นผิดครับ",
      korean: "그건 잘못됐어요",
      note: "상대가 가리킨 것이나 저쪽 방법이 틀렸다고 말할 때",
      tags: ["기본회화"],
      keywords: ["그건 잘못되었어", "그건 잘못됐어", "그건 틀렸어", "그건 틀렸어요", "잘못", "틀리다"],
    },
    {
      id: "supp-sentence-this-wrong-answer",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "안 니 마이 툭 캅",
      thaiScript: "อันนี้ไม่ถูกครับ",
      korean: "이건 틀렸어요",
      note: "정답이나 방식이 틀렸다고 말할 때",
      tags: ["기본회화"],
      keywords: ["이건 틀렸어", "이건 틀렸어요", "잘못되었어", "잘못됐어", "틀리다"],
    },
  ],
};

const QUICK_SEARCHES = [
  "방바꿔주세요",
  "얼마예요",
  "물",
  "계산",
  "와이파이",
  "화장실",
  "병원",
  "천천히",
  "택시",
];

const STOPWORDS = new Set(["이", "그", "저", "것", "거", "좀", "더", "요", "은", "는", "이거", "내", "제", "나"]);
const GENERIC_SEARCH_TERMS = new Set([
  "하다",
  "있다",
  "없다",
  "되다",
  "주다",
  "주세요",
  "문제",
  "필요",
  "확인",
  "가다",
  "오다",
  "먹다",
  "보다",
  "지금",
  "현재",
  "어디",
  "시간",
]);
const GENERIC_ANCHOR_TERMS = new Set(["주세요", "주세여", "부탁", "좀", "지금", "현재", "시간", "몇시", "공구", "문제"]);
const SINGLE_SYLLABLE_ANCHORS = new Set(["방", "물", "밥", "약"]);
const ENTRY_SOURCE_SCORES = {
  custom: 170,
  "ai-assist": 148,
  "concept-corpus": 135,
  "external-corpus": 128,
  supplemental: 120,
  excel: 95,
  "generated-bulk": -130,
};
const GENERATED_BULK_PREFIX_REGEX =
  /^(?:이|저|그|새|다른|좋은|큰|작은|깨끗한|조용한|차가운|뜨거운|빠른|느린|비싼|싼)\s+/u;
const GENERATED_BULK_ENDING_REGEX =
  /(?:주세요|있어요\?|필요해요|확인해주세요|다시 주세요|준비해주세요|가져다 주세요|얼마예요\?|보여주세요|바꿔주세요|안 보여요|잃어버렸어요)$/u;
const VOCAB_SENTENCE_LIKE_REGEX =
  /(?:\?|있어요|있다|없어요|없다|해주세요|해 주세요|주실 수 있나요|가고 싶어요|가야 해요|가요|해요|됩니다|돼요|나와요|잠겨요|더러워요|시끄러워요|문제가 있어요|필요해요)$/u;
const VOCAB_GENERIC_LABEL_REGEX = /(?:문제|필요|있음|확인)$/u;
const SEARCH_OBJECT_RULES = [
  {
    id: "room",
    patterns: [/^방$|객실|룸|방바꿔|방좀바꿔|다른방|빈방|조용한방|깨끗한방|더러운방|시원한방|고장난방|방이|방안/],
    terms: ["방", "객실", "룸"],
    related: ["다른 방", "빈 방", "조용한 방"],
    display: ["방"],
    tags: ["이동"],
    avoidTags: ["일터"],
    phrases: ["방 바꿔 주세요", "다른 방 있나요?"],
  },
  {
    id: "noise",
    patterns: [/시끄럽|시끄러|소음|조용하|조용해|조용한/],
    terms: ["시끄럽다", "소음", "시끄러워요"],
    related: ["시끄러워요", "방이 시끄러워요", "이 방은 너무 시끄러워요", "조용한 방 있나요?"],
    display: ["시끄럽다", "소음"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["시끄러워요", "방이 시끄러워요", "이 방은 너무 시끄러워요", "조용한 방 있나요?"],
  },
  {
    id: "machineNoise",
    patterns: [/(?:기계|장비|설비).*(?:시끄럽|소음)|(?:시끄럽|소음).*(?:기계|장비|설비)/],
    terms: ["기계", "소음", "문제"],
    related: ["기계가 너무 시끄러워요", "기계 소음이 심해요", "기계를 확인해 주세요"],
    display: ["기계", "소음"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["기계가 너무 시끄러워요", "기계 소음이 심해요", "기계를 확인해 주세요"],
  },
  {
    id: "internetIssue",
    patterns: [/(?:와이파이|wifi|인터넷).*(?:안돼|안 돼|느리|연결|끊|비번|비밀번호)|(?:안돼|안 돼|느리|연결|끊).*(?:와이파이|wifi|인터넷)/i],
    terms: ["와이파이", "인터넷", "문제"],
    related: ["와이파이가 안 돼요", "인터넷이 안 돼요", "와이파이가 너무 느려요", "와이파이 비밀번호가 뭐예요?"],
    display: ["와이파이", "인터넷"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["와이파이가 안 돼요", "인터넷이 안 돼요", "와이파이가 너무 느려요", "와이파이 비밀번호가 뭐예요?"],
  },
  {
    id: "cleanliness",
    patterns: [/냄새|냄새나|더럽|더러워|지저분|청소/],
    terms: ["냄새", "더럽다", "청소", "문제"],
    related: ["방에서 냄새가 나요", "이 방에 냄새가 나요", "청소해 주세요"],
    display: ["냄새", "청소"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["방에서 냄새가 나요", "청소해 주세요"],
  },
  {
    id: "aircon",
    patterns: [/에어컨|냉방|안시원|안 시원|너무추워|너무더워/],
    terms: ["에어컨", "시원하다", "춥다", "덥다"],
    related: ["에어컨이 안 시원해요", "에어컨이 너무 추워요", "에어컨이 너무 더워요"],
    display: ["에어컨"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["에어컨이 안 시원해요", "에어컨이 너무 추워요", "에어컨이 너무 더워요"],
  },
  {
    id: "hotwater",
    patterns: [/온수|뜨거운물|뜨거운 물|물이안나와|물이 안 나와/],
    terms: ["온수", "뜨거운 물", "문제"],
    related: ["온수가 안 나와요", "뜨거운 물", "온수"],
    display: ["온수"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["온수가 안 나와요"],
  },
  {
    id: "doorlock",
    patterns: [/문안잠|문 안 잠|잠기지|잠겨|도어락/],
    terms: ["문", "잠기다", "문제"],
    related: ["문이 안 잠겨요", "문제가 있어요"],
    display: ["문"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["문이 안 잠겨요"],
  },
  {
    id: "toilet",
    patterns: [/화장실|욕실|변기|샤워실/],
    terms: ["화장실", "욕실"],
    related: ["화장실", "욕실", "샤워실"],
    display: ["화장실"],
    tags: ["이동", "건강"],
    avoidTags: ["일터"],
    phrases: [],
  },
  {
    id: "laundry",
    patterns: [/^빨래$/, /^세탁$/, /빨래해|세탁해|빨래맡기|세탁맡기/, /세탁실|세제/],
    terms: ["빨래", "세탁", "세탁실", "세제"],
    related: ["빨래 좀 해주세요", "세탁실이 어디예요?", "세제 있어요?"],
    display: ["빨래"],
    tags: ["기본회화", "이동"],
    phrases: ["빨래 좀 해주세요", "세탁실이 어디예요?", "빨래 맡길 수 있나요?"],
  },
  {
    id: "watermelonJuice",
    patterns: [/수박\s*주스|수박주스|수박쥬스/],
    terms: ["수박 주스", "수박주스", "주스", "수박"],
    related: ["수박 주스 주세요", "수박 주스 있어요?"],
    display: ["수박 주스"],
    tags: ["식당", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["수박 주스 주세요", "수박 주스 있어요?"],
  },
  {
    id: "watermelon",
    patterns: [/수박/],
    terms: ["수박", "과일"],
    related: ["수박 주세요", "수박 있어요?"],
    display: ["수박"],
    tags: ["식당", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["수박 주세요", "수박 있어요?"],
  },
  {
    id: "fruit",
    patterns: [/과일|과일주스/],
    terms: ["과일", "과일주스"],
    related: ["수박", "망고", "바나나", "과일 주스"],
    display: ["과일"],
    tags: ["식당", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["과일 있어요?", "과일 주스 있어요?"],
  },
  {
    id: "juice",
    patterns: [/주스|쥬스|음료/],
    terms: ["주스", "음료", "과일주스"],
    related: ["수박 주스", "오렌지 주스", "망고 주스"],
    display: ["주스"],
    tags: ["식당", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["주스 주세요", "주스 있어요?"],
  },
  {
    id: "gift",
    patterns: [
      /선물|기프트|기념품|기념선물|선물용|선물세트|선물셋트|기프트세트|선물포장|선물\s*포장|기념품가게|기념품\s*가게|선물가게|선물\s*가게|엽서|포스트카드|키링|열쇠고리|자석|냉장고자석|포장지|선물포장지|리본|말린망고|망고선물/,
    ],
    focusTerms: ["선물", "기념품"],
    terms: [
      "선물",
      "기념품",
      "선물용",
      "선물 포장",
      "선물세트",
      "기념품 가게",
      "엽서",
      "열쇠고리",
      "자석",
      "말린 망고",
    ],
    related: [
      "선물 추천해 주세요",
      "선물 사러 왔어요",
      "선물로 살 거예요",
      "선물 포장해 주세요",
      "기념품 가게가 어디예요?",
      "선물세트 있어요?",
      "말린 망고 선물용으로 좋아요?",
    ],
    display: ["선물", "기념품"],
    tags: ["쇼핑"],
    preferTags: ["쇼핑"],
    avoidTags: ["식당", "건강", "일터"],
    blockedTerms: ["물", "생수", "차가운물", "따뜻한물", "주스", "음료"],
    phrases: [
      "선물 추천해 주세요",
      "선물 사러 왔어요",
      "선물 포장해 주세요",
      "기념품 가게가 어디예요?",
      "선물세트 있어요?",
    ],
  },
  {
    id: "giftBag",
    patterns: [/쇼핑백|선물가방|선물봉투/],
    focusTerms: ["쇼핑백"],
    terms: ["쇼핑백", "선물가방", "봉투"],
    related: ["쇼핑백도 같이 주세요", "쇼핑백 하나 더 주세요"],
    display: ["쇼핑백"],
    tags: ["쇼핑"],
    preferTags: ["쇼핑"],
    avoidTags: ["식당", "건강", "일터"],
    blockedTerms: ["선물", "선물 포장", "기념품", "물", "주스"],
    phrases: ["쇼핑백도 같이 주세요", "쇼핑백 하나 더 주세요"],
  },
  {
    id: "water",
    patterns: [/물|생수|마실물|차가운물|따뜻한물/],
    terms: ["물", "생수", "차가운 물", "따뜻한 물"],
    related: ["차가운 물", "따뜻한 물"],
    display: ["물"],
    tags: ["식당", "건강"],
    avoidTags: ["일터"],
    phrases: ["물 주세요", "차가운 물 주세요"],
  },
  {
    id: "wetTissue",
    patterns: [/물티슈|물\s*티슈|물수건/],
    focusTerms: ["물티슈"],
    terms: ["물티슈"],
    related: ["물티슈 주세요", "물티슈 있어요?", "물티슈 더 주세요"],
    display: ["물티슈"],
    tags: ["이동", "건강", "기본회화"],
    avoidTags: ["일터"],
    blockedTerms: ["물", "휴지", "티슈", "냅킨"],
    phrases: ["물티슈 주세요", "물티슈 있어요?", "물티슈 더 주세요"],
  },
  {
    id: "towel",
    patterns: [/수건|목욕수건|타월/],
    terms: ["수건"],
    related: ["수건 두 장 더 주세요", "수건"],
    display: ["수건"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["수건 두 장 더 주세요"],
  },
  {
    id: "tissue",
    patterns: [/휴지|화장지|티슈|냅킨/],
    terms: ["휴지", "화장지"],
    related: ["휴지 더 주세요", "화장지", "화장지 / 휴지"],
    display: ["휴지"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["휴지 더 주세요"],
  },
  {
    id: "charger",
    patterns: [/충전기|차저|charger|어댑터|돼지코|콘센트/],
    terms: ["충전기", "어댑터", "콘센트"],
    related: ["충전기 있어요?", "충전기", "콘센트"],
    display: ["충전기"],
    tags: ["이동", "쇼핑", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["충전기 있어요?"],
  },
  {
    id: "ticketOffice",
    patterns: [/매표소|발권\s*창구|티켓\s*부스|티켓\s*창구|표\s*(?:사는|파는)\s*곳|ticket\s*office|box\s*office/i],
    terms: ["매표소", "티켓", "표"],
    related: ["매표소가 어디예요?", "표 파는 곳이 어디예요?", "여기서 표를 사요?"],
    display: ["매표소"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["매표소가 어디예요?", "표 파는 곳이 어디예요?", "여기서 표를 사요?"],
  },
  {
    id: "atm",
    patterns: [/atm|현금인출기|현금\s*뽑는\s*기계/i],
    focusTerms: ["ATM"],
    terms: ["ATM", "현금인출기"],
    related: ["ATM이 어디예요?", "현금 뽑고 싶어요", "여기서 ATM까지 멀어요?"],
    display: ["ATM"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    blockedTerms: ["현금", "동전", "사다", "사요", "어디서사요"],
    phrases: ["ATM이 어디예요?", "현금 뽑고 싶어요"],
  },
  {
    id: "platform",
    patterns: [/승강장|플랫폼/],
    focusTerms: ["플랫폼"],
    terms: ["플랫폼", "승강장"],
    related: ["승강장이 어디예요?", "플랫폼이 어디예요?", "이 승강장 맞아요?"],
    display: ["승강장"],
    tags: ["이동"],
    avoidTags: ["일터"],
    phrases: ["승강장이 어디예요?", "플랫폼이 어디예요?", "이 승강장 맞아요?"],
  },
  {
    id: "bikeTaxi",
    patterns: [/오토바이택시|오토바이\s*택시|바이크택시/],
    focusTerms: ["오토바이택시"],
    terms: ["오토바이택시", "택시"],
    related: ["오토바이 택시 불러 주세요", "오토바이 택시 타고 싶어요", "오토바이 택시가 어디예요?"],
    display: ["오토바이택시"],
    tags: ["이동"],
    avoidTags: ["일터"],
    phrases: ["오토바이 택시 불러 주세요", "오토바이 택시 타고 싶어요", "오토바이 택시가 어디예요?"],
  },
  {
    id: "trashCan",
    patterns: [/휴지통|쓰레기통/],
    focusTerms: ["휴지통"],
    terms: ["휴지통", "쓰레기통"],
    related: ["휴지통이 어디예요?", "쓰레기통이 어디예요?"],
    display: ["휴지통"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    blockedTerms: ["휴지", "티슈", "냅킨"],
    phrases: ["휴지통이 어디예요?", "쓰레기통이 어디예요?"],
  },
  {
    id: "laundryMachine",
    patterns: [/세탁기|건조기/],
    focusTerms: ["세탁기", "건조기"],
    terms: ["세탁기", "건조기"],
    related: ["세탁기 어디에요?", "건조기 있어요?", "세탁기 쓰고 싶어요"],
    display: ["세탁기", "건조기"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    blockedTerms: ["빨래", "세탁", "세제", "세탁소", "빨래방", "세탁실"],
    phrases: ["세탁기 어디에요?", "건조기 있어요?", "세탁기 쓰고 싶어요"],
  },
  {
    id: "laundryShop",
    patterns: [/세탁소|빨래방|코인세탁/],
    focusTerms: ["세탁소", "빨래방"],
    terms: ["세탁소", "빨래방"],
    related: ["세탁소가 어디예요?", "빨래방이 어디예요?", "빨래 맡기고 싶어요"],
    display: ["세탁소", "빨래방"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    blockedTerms: [
      "빨래",
      "세탁",
      "세제",
      "세탁기",
      "건조기",
      "세탁실",
      "방",
      "객실",
      "룸",
      "다른방",
      "빈방",
      "조용한방",
      "방바꿔주세요",
      "다른방있나요",
      "방어디예요",
    ],
    phrases: ["세탁소가 어디예요?", "빨래방이 어디예요?", "빨래 맡기고 싶어요"],
  },
  {
    id: "refrigerator",
    patterns: [/냉장고|냉장실/],
    focusTerms: ["냉장고"],
    terms: ["냉장고"],
    related: ["냉장고가 안 돼요", "냉장고가 안 차가워요"],
    display: ["냉장고"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["냉장고가 안 돼요", "냉장고가 안 차가워요"],
  },
  {
    id: "sink",
    patterns: [/세면대|세면기|sink/i],
    focusTerms: ["세면대"],
    terms: ["세면대"],
    related: ["세면대가 막혔어요", "세면대 물이 안 내려가요"],
    display: ["세면대"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["세면대가 막혔어요", "세면대 물이 안 내려가요"],
  },
  {
    id: "powerBank",
    patterns: [/보조배터리|파워뱅크|파워뱅/],
    focusTerms: ["보조배터리"],
    terms: ["보조배터리", "배터리", "충전기"],
    related: ["보조배터리 있어요?", "보조배터리 좀 주세요", "휴대폰 충전할 수 있어요?"],
    display: ["보조배터리"],
    tags: ["이동", "쇼핑", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["보조배터리 있어요?", "보조배터리 좀 주세요", "휴대폰 충전할 수 있어요?"],
  },
  {
    id: "wallet",
    patterns: [/지갑/],
    focusTerms: ["지갑"],
    terms: ["지갑", "현금", "카드"],
    related: ["지갑을 잃어버렸어요", "지갑 있어요?", "지갑 어디에요?"],
    display: ["지갑"],
    tags: ["쇼핑", "이동", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["지갑을 잃어버렸어요", "지갑 어디에요?"],
  },
  {
    id: "sunglasses",
    patterns: [/선글라스|썬글라스/],
    focusTerms: ["선글라스"],
    terms: ["선글라스"],
    related: ["선글라스 있어요?", "이 선글라스 주세요", "선글라스 어디서 사요?"],
    display: ["선글라스"],
    tags: ["쇼핑"],
    avoidTags: ["일터"],
    blockedTerms: ["안경"],
    phrases: ["선글라스 있어요?", "이 선글라스 주세요", "선글라스 어디서 사요?"],
  },
  {
    id: "message",
    patterns: [/메시지|문자/],
    focusTerms: ["메시지"],
    terms: ["메시지", "문자"],
    related: ["메시지로 보내 주세요", "문자로 보내도 돼요?", "메시지 다시 보내 주세요"],
    display: ["메시지"],
    tags: ["기본회화", "이동"],
    avoidTags: ["일터"],
    blockedTerms: ["휴대폰"],
    phrases: ["메시지로 보내 주세요", "문자로 보내도 돼요?", "메시지 다시 보내 주세요"],
  },
  {
    id: "phoneCall",
    patterns: [/전화|통화|콜/],
    focusTerms: ["전화"],
    terms: ["전화", "통화"],
    related: ["전화해 주세요", "지금 전화 가능해요?", "전화 좀 빌려 주세요"],
    display: ["전화"],
    tags: ["기본회화", "이동"],
    avoidTags: ["일터"],
    blockedTerms: ["휴대폰"],
    phrases: ["전화해 주세요", "지금 전화 가능해요?", "전화 좀 빌려 주세요"],
  },
  {
    id: "phone",
    patterns: [/휴대폰|핸드폰|스마트폰|사진|동영상/],
    terms: ["휴대폰", "사진", "동영상"],
    related: [
      "휴대폰 충전할 수 있어요?",
      "휴대폰 충전이 안 돼요",
      "휴대폰을 잃어버렸어요",
      "사진 찍어 주세요",
    ],
    display: ["휴대폰"],
    tags: ["기본회화", "이동"],
    avoidTags: ["일터"],
    phrases: [
      "휴대폰 충전할 수 있어요?",
      "휴대폰 충전이 안 돼요",
      "휴대폰을 잃어버렸어요",
      "사진 찍어 주세요",
    ],
  },
  {
    id: "wifi",
    patterns: [/와이파이|wifi|인터넷|비밀번호/i],
    terms: ["와이파이", "인터넷", "비밀번호"],
    related: ["와이파이 비밀번호", "인터넷 안 돼요", "와이파이가 너무 느려요"],
    display: ["와이파이"],
    tags: ["이동"],
    avoidTags: ["일터"],
    phrases: ["와이파이 비밀번호가 뭐예요?", "와이파이가 너무 느려요", "인터넷 안 돼요"],
  },
  {
    id: "computer",
    patterns: [/컴퓨터|노트북|랩탑|pc|피시|화면|마우스|키보드|프린터|배터리|전원/],
    terms: ["컴퓨터", "노트북", "화면", "마우스", "키보드", "프린터", "문제"],
    related: [
      "컴퓨터가 안 돼요",
      "노트북이 안 켜져요",
      "화면이 안 나와요",
      "마우스가 안 돼요",
      "키보드가 안 돼요",
      "프린터가 안 돼요",
      "충전이 안 돼요",
      "전원이 안 들어와요",
      "컴퓨터를 확인해 주세요",
    ],
    display: ["컴퓨터"],
    tags: ["기본회화"],
    avoidTags: ["일터"],
    blockedTerms: ["기계", "가동", "작동", "라인", "공장"],
    phrases: [
      "컴퓨터가 안 돼요",
      "노트북이 안 켜져요",
      "화면이 안 나와요",
      "마우스가 안 돼요",
      "키보드가 안 돼요",
      "프린터가 안 돼요",
      "충전이 안 돼요",
      "전원이 안 들어와요",
      "컴퓨터를 확인해 주세요",
    ],
  },
  {
    id: "smoking",
    patterns: [/담배|흡연|금연|흡연실|담배피우|라이터|재떨이|전자담배/],
    terms: ["담배", "담배 피우다", "흡연실", "라이터", "재떨이"],
    related: ["담배 피워도 돼요?", "흡연실이 어디예요?", "금연 구역이에요", "라이터 있어요?", "재떨이 있어요?"],
    display: ["담배", "흡연실"],
    tags: ["기본회화", "이동"],
    avoidTags: ["일터"],
    phrases: ["담배 피워도 돼요?", "흡연실이 어디예요?", "금연 구역이에요", "라이터 있어요?", "재떨이 있어요?"],
  },
  {
    id: "beauty",
    patterns: [/예쁘|이쁘|예뻐|이뻐|귀엽|멋있|잘생겼/],
    terms: ["예쁘다", "예뻐요", "귀엽다", "멋있다", "잘생겼다"],
    related: ["예뻐요", "정말 예뻐요", "귀여워요", "멋있어요", "잘생겼어요"],
    display: ["예쁘다"],
    tags: ["기본회화", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["예뻐요", "정말 예뻐요", "귀여워요", "멋있어요", "잘생겼어요"],
  },
  {
    id: "praise",
    patterns: [/잘하|잘했|대단|훌륭|고생/],
    terms: ["잘하다", "잘했어요", "대단하다", "훌륭하다"],
    related: ["잘하고 있어요", "잘했어요", "대단해요", "고생 많았어요"],
    display: ["잘하다"],
    tags: ["기본회화"],
    avoidTags: ["일터"],
    phrases: ["잘하고 있어요", "잘했어요", "대단해요", "고생 많았어요"],
  },
  {
    id: "coin",
    patterns: [/동전|잔돈|거스름돈|지폐|현금|지갑/],
    terms: ["동전", "잔돈", "현금", "지폐"],
    related: ["동전 있어요?", "잔돈 있어요?", "거스름돈 주세요", "현금 돼요?", "지폐 있어요?"],
    display: ["동전"],
    tags: ["쇼핑", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["동전 있어요?", "잔돈 있어요?", "거스름돈 주세요", "현금 돼요?", "지폐 있어요?"],
  },
  {
    id: "stock",
    patterns: [/주식|주가|주식시장|stock|투자|은행|계좌/i],
    terms: ["주식", "주식 투자", "주가", "은행", "계좌"],
    related: ["주식", "주식 투자", "주식을 사다", "저는 주식에 투자해요", "은행이 어디예요?"],
    display: ["주식"],
    tags: ["기본회화"],
    avoidTags: ["일터"],
    blockedTerms: ["가격", "할인", "쇼핑"],
    phrases: ["주식을 사요", "주식 투자해요", "저는 주식에 투자해요", "은행이 어디예요?"],
  },
  {
    id: "clothesShrink",
    patterns: [/옷.*줄|옷줄|작아졌|줄어들|꽉끼|꽉 끼|사이즈|짧아|길어/],
    terms: ["옷", "줄다", "작아지다", "사이즈", "문제"],
    related: ["옷이 줄었어요", "이 옷이 작아졌어요", "너무 꽉 껴요", "더 큰 사이즈 있어요?", "더 작은 사이즈 있어요?"],
    display: ["옷"],
    tags: ["쇼핑", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["옷이 줄었어요", "이 옷이 작아졌어요", "너무 꽉 껴요", "더 큰 사이즈 있어요?", "더 작은 사이즈 있어요?"],
  },
  {
    id: "heat",
    patterns: [/덥|더워|더운|시원|선풍기|후덥/],
    terms: ["덥다", "더워요", "시원하다", "선풍기"],
    related: ["너무 더워요", "오늘 너무 더워요", "이 방은 너무 더워요", "선풍기 켜 주세요", "시원한 방 있나요?"],
    display: ["덥다"],
    tags: ["기본회화", "이동"],
    avoidTags: ["일터"],
    phrases: ["너무 더워요", "오늘 너무 더워요", "이 방은 너무 더워요", "선풍기 켜 주세요", "시원한 방 있나요?"],
  },
  {
    id: "discount",
    patterns: [/깎|깍|할인|비싸|싸게|흥정/],
    terms: ["깎다", "할인", "비싸다"],
    related: ["깎아주세요", "조금만 더 깎아주세요", "너무 비싸요", "더 싸게 해 주세요", "할인돼요?"],
    display: ["깎다"],
    tags: ["쇼핑"],
    avoidTags: ["일터"],
    phrases: ["깎아주세요", "조금만 더 깎아주세요", "너무 비싸요", "더 싸게 해 주세요", "할인돼요?"],
  },
  {
    id: "completion",
    patterns: [/완성|완료|끝났|다끝|다 끝|마무리|거의다|거의 다|곧끝|금방끝/],
    terms: ["완성", "완료", "끝나다", "거의"],
    related: ["완성됐어요", "다 끝났어요", "아직 안 끝났어요", "거의 다 됐어요", "곧 끝나요"],
    display: ["완성"],
    tags: ["기본회화", "일터"],
    avoidTags: ["쇼핑"],
    phrases: ["완성됐어요", "다 끝났어요", "아직 안 끝났어요", "거의 다 됐어요", "곧 끝나요"],
  },
  {
    id: "freeTime",
    patterns: [/한가|안바빠|안 바빠|시간있|시간 있어|바빠/],
    terms: ["한가하다", "안 바쁘다", "바쁘다"],
    related: ["지금 한가해요?", "지금 안 바빠요", "지금 바빠요"],
    display: ["한가하다"],
    tags: ["기본회화"],
    avoidTags: ["일터"],
    phrases: ["지금 한가해요?", "지금 안 바빠요", "지금 바빠요"],
  },
  {
    id: "trouble",
    patterns: [/큰일|심각|난감|문제커|곤란|망했/],
    terms: ["큰일", "문제", "심각하다"],
    related: ["큰일 났어요", "이거 큰일이에요", "문제가 커요", "생각보다 심각해요"],
    display: ["큰일"],
    tags: ["기본회화"],
    avoidTags: ["쇼핑"],
    phrases: ["큰일 났어요", "이거 큰일이에요", "문제가 커요", "생각보다 심각해요"],
  },
  {
    id: "time",
    patterns: [/몇\s*시|몇시|시간|시각/],
    terms: ["시간", "몇 시", "몇시", "몇 시예요"],
    related: ["지금 몇 시예요", "몇 시에 만나요?"],
    display: ["시간"],
    tags: ["숫자·시간"],
    phrases: ["지금 몇 시예요?", "몇 시에 만나요?"],
  },
  {
    id: "price",
    patterns: [/얼마|가격|요금|비용|비싸|깎|할인/],
    terms: ["가격", "얼마", "얼마예요"],
    related: ["얼마예요", "깎아주세요", "할인"],
    display: ["가격"],
    tags: ["쇼핑"],
    avoidTags: ["일터"],
    phrases: ["얼마예요?", "좀 깎아주세요"],
  },
  {
    id: "hospital",
    patterns: [/병원|응급실/],
    terms: ["병원", "아프다"],
    related: ["병원 어디예요?", "병원 가고 싶어요"],
    display: ["병원"],
    tags: ["건강"],
    avoidTags: ["일터"],
    phrases: ["병원 어디예요?", "병원 가고 싶어요"],
  },
  {
    id: "pharmacy",
    patterns: [/^약$|약국|진통제|먹는약|상비약|약주세요|약이요/],
    terms: ["약국", "약", "진통제"],
    related: ["약국이 어디예요?", "약 주세요"],
    display: ["약국"],
    tags: ["건강"],
    avoidTags: ["일터"],
    phrases: ["약국이 어디예요?", "약 주세요"],
  },
  {
    id: "endmill",
    patterns: [/엔드밀|앤드밀|endmill|end\s*mill/i],
    terms: ["엔드밀", "공구"],
    related: ["엔드밀 가져와 주세요", "엔드밀 있어요?", "엔드밀 바꿔 주세요"],
    display: ["엔드밀"],
    tags: ["일터"],
    phrases: ["엔드밀 가져와 주세요", "엔드밀 있어요?", "엔드밀 바꿔 주세요"],
  },
  {
    id: "tool",
    patterns: [/공구|드릴|커터|홀더|비트|박스/],
    terms: ["공구", "드릴", "커터", "홀더"],
    related: ["공구 가져와 주세요", "홀더도 가져와 주세요"],
    display: ["공구"],
    tags: ["일터"],
    phrases: ["공구 가져와 주세요", "홀더도 가져와 주세요"],
  },
  {
    id: "factoryWork",
    patterns: [/공장|생산라인|자재|불량품|작업복|안전화/],
    terms: ["공장", "생산라인", "자재", "불량품", "작업복", "안전화"],
    related: ["자재가 부족해요", "이거 불량품이에요", "작업복이 필요해요", "안전화를 신어야 해요"],
    display: ["공장", "생산라인"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["자재가 부족해요", "이거 불량품이에요", "작업복이 필요해요", "안전화를 신어야 해요"],
  },
  {
    id: "education",
    patterns: [/교육|훈련|트레이닝|오리엔테이션|안전교육|입사교육|수업/],
    terms: ["교육", "훈련", "오리엔테이션", "수업"],
    related: ["교육 시작합시다", "교육 언제 시작해요?", "오리엔테이션 시작해요"],
    display: ["교육", "훈련"],
    tags: ["기본회화", "일터"],
    preferTags: ["일터"],
    phrases: ["교육 시작합시다", "교육 언제 시작해요?", "오리엔테이션 시작해요"],
  },
  {
    id: "workTask",
    patterns: [/업무|작업|회의|미팅|업무시작|작업시작|회의시작/],
    terms: ["업무", "작업", "회의", "미팅"],
    related: ["업무 시작합시다", "작업 시작할게요", "회의 시작합시다"],
    display: ["업무", "작업"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["업무 시작합시다", "작업 시작할게요", "회의 시작합시다"],
  },
  {
    id: "machine",
    patterns: [/기계|장비|라인|공장|설비|현장/],
    terms: ["기계", "작업", "장비"],
    related: ["기계를 가동하세요", "기계를 멈춰 주세요"],
    display: ["기계"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["기계를 가동하세요", "기계를 멈춰 주세요", "기계를 켜 주세요"],
  },
  {
    id: "payroll",
    patterns: [/급여|월급|임금|시급|일당|급여명세서|월급명세서|월급날|수당|오티|ot/i],
    terms: ["월급", "급여", "급여명세서", "초과근무", "시급"],
    related: ["월급이 아직 안 들어왔어요", "급여명세서 확인해 주세요", "월급날이 언제예요?"],
    display: ["급여", "월급"],
    tags: ["일터", "숫자·시간"],
    preferTags: ["일터"],
    phrases: ["월급이 아직 안 들어왔어요", "급여명세서 확인해 주세요", "월급날이 언제예요?"],
  },
  {
    id: "hr",
    patterns: [/인사팀|인사부|관리자|매니저|반장|라인반장|팀장|사장님|상사|사원증|직원증|출입카드|출입증|계약서|근로계약서|서류|은행계좌|급여계좌|통장/],
    terms: ["인사팀", "관리자", "반장", "사원증", "출입카드", "계약서"],
    related: ["인사팀이 어디예요?", "관리자 좀 불러 주세요", "반장님 어디 계세요?", "반장님 좀 불러 주세요", "사장님 계세요?"],
    display: ["인사팀", "관리자"],
    tags: ["일터"],
    preferTags: ["일터"],
    blockedTerms: ["이름", "감사", "안녕"],
    phrases: ["인사팀이 어디예요?", "관리자 좀 불러 주세요", "반장님 어디 계세요?", "반장님 좀 불러 주세요", "사장님 계세요?", "계약서를 다시 보여 주세요"],
  },
  {
    id: "dormitory",
    patterns: [/기숙사|숙소비|기숙사비|관리비|공과금|전기세|전기요금|수도세|수도요금|가스비|가스요금|인터넷비|와이파이요금/],
    terms: ["기숙사", "기숙사비", "공과금", "전기세", "수도세", "관리비"],
    related: ["기숙사에 문제가 있어요", "기숙사비 얼마예요?", "공과금은 어디서 내요?"],
    display: ["기숙사", "공과금"],
    tags: ["일터", "이동"],
    preferTags: ["일터"],
    phrases: ["기숙사에 문제가 있어요", "기숙사비 얼마예요?", "공과금은 어디서 내요?"],
  },
  {
    id: "busSchedule",
    patterns: [/버스시간표|버스시간|버스\s*시간|첫차|막차|통근버스|셔틀버스|회사버스|버스가몇시|버스몇시|버스언제/],
    terms: ["버스 시간표", "통근버스", "첫차", "막차", "출발시간", "도착시간"],
    related: ["버스 시간표 보여 주세요", "버스가 몇 시에 와요?", "통근버스가 몇 시에 와요?"],
    display: ["버스 시간표", "통근버스"],
    tags: ["이동", "숫자·시간", "일터"],
    preferTags: ["숫자·시간"],
    phrases: ["버스 시간표 보여 주세요", "버스가 몇 시에 와요?", "첫차가 몇 시예요?", "막차가 몇 시예요?"],
  },
  {
    id: "workSchedule",
    patterns: [/근무시간|출근시간|퇴근시간|초과근무|연장근무|야근|조퇴|휴게시간|쉬는날|쉬는\s*날|휴무|교대근무|주간근무|야간근무|출근|퇴근/],
    terms: ["근무시간", "출근", "퇴근", "초과근무", "연장근무", "휴게시간", "휴무"],
    related: ["출근시간이 몇 시예요?", "퇴근시간이 몇 시예요?", "몇 시 출근이에요?", "몇 시 퇴근이에요?", "오늘 초과근무 있어요?", "오늘 야근해요?", "조퇴하고 싶어요", "휴게시간이 언제예요?"],
    display: ["근무시간", "초과근무"],
    tags: ["일터", "숫자·시간"],
    preferTags: ["일터"],
    phrases: ["출근시간이 몇 시예요?", "퇴근시간이 몇 시예요?", "몇 시 출근이에요?", "몇 시 퇴근이에요?", "오늘 초과근무 있어요?", "오늘 야근해요?", "조퇴하고 싶어요", "쉬는 날이 언제예요?"],
  },
  {
    id: "meal",
    patterns: [/점심|아침|저녁|식사|밥/],
    terms: ["점심식사", "점심", "식사", "밥"],
    related: ["점심 먹으러 가자", "밥 먹으러 가자", "점심시간이에요"],
    display: ["식사"],
    tags: ["식당", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["점심 먹으러 가자", "점심 먹으러 갈래요?", "밥 먹으러 가자"],
  },
  {
    id: "understand",
    patterns: [/이해|알겠|못알아|못 알아|모르겠/],
    terms: ["이해", "이해해요", "이해합니다", "이해 못해요"],
    related: ["이해하나요?", "이해했어요", "이해 못했어요"],
    display: ["이해"],
    tags: ["기본회화"],
    avoidTags: ["일터"],
    phrases: ["이해해요", "이해하나요?", "이해합니다", "이해 못해요"],
  },
  {
    id: "hunger",
    patterns: [/배고프|허기|시장해/],
    terms: ["배고프다", "배고파요", "배고프세요"],
    related: ["밥 먹고 싶어요", "먹을 거 있어요?"],
    display: ["배고프다"],
    tags: ["식당", "기본회화", "건강"],
    avoidTags: ["일터"],
    phrases: ["배고파요", "배고프세요?", "밥 먹고 싶어요", "먹을 거 있어요?"],
    blockedTerms: ["배", "보트", "복부", "아프다", "병원", "약"],
  },
  {
    id: "problem",
    patterns: [/문제|고장|안돼|안 돼|수리|막혔|누수|물새/],
    terms: ["문제", "고장", "안 돼요"],
    related: ["문제가 있어요", "고장났어요", "수리해주세요"],
    display: ["문제"],
    tags: ["이동", "건강", "일터"],
    avoidTags: ["일터"],
    phrases: ["문제가 있어요", "수리해주세요"],
  },
];
const SEARCH_ACTION_RULES = [
  {
    id: "where",
    patterns: [/어디|어디예요|어디에요|어딘지|어디야|어디로|어디서|어딨어|어디있/],
    terms: ["어디", "어디예요", "어디에요", "어디로"],
    related: ["어디예요", "어디에요", "어디에 있어요?"],
    display: ["어디"],
    tags: ["이동"],
    phrases: ["어디예요?", "어디에요?", "어디에 있어요?", "{object} 어디예요?", "{object} 어디에요?"],
  },
  {
    id: "go",
    patterns: [/가다|간다|가요|가세요|가시나요|가십니까|갑니다|가고싶|가고 싶|가야|갈게|갈래|가자|가도/],
    terms: ["가다", "가요", "가세요", "가고 싶어요", "가야 해요"],
    related: ["가고 싶어요", "가야 해요", "어디 가세요?", "어디 가요?"],
    display: ["가다"],
    tags: ["이동", "기본회화"],
    phrases: ["{object} 가고 싶어요", "{object} 가야 해요", "{object} 가요"],
  },
  {
    id: "request",
    patterns: [/주세요|주세여|부탁|해줘|해줘요|줘요|도와줘|도와주세요/],
    terms: ["주세요", "부탁"],
    related: ["주세요", "부탁해요"],
    display: ["주세요"],
    tags: ["기본회화"],
    phrases: ["{object} 주세요"],
  },
  {
    id: "bring",
    patterns: [/가져와|가져다|가져오|갖고와|들고와/],
    terms: ["가져와", "가져와 주세요", "가져다 주세요", "가져오다"],
    related: ["가져와 주세요", "가져다 주세요"],
    display: ["가져오다"],
    tags: ["기본회화", "일터"],
    phrases: ["{object} 가져와 주세요", "{object} 가져다 주세요"],
  },
  {
    id: "change",
    patterns: [/바꿔|바꾸|변경|교체|체인지/],
    terms: ["바꿔", "바꿔 주세요", "바꾸다", "변경"],
    related: ["바꿔 주세요", "변경해주세요"],
    display: ["바꾸다"],
    tags: ["기본회화"],
    phrases: ["{object} 바꿔 주세요"],
  },
  {
    id: "show",
    patterns: [/보여|보여줘|보여주세요|보다|봐요|본다/],
    terms: ["보여주세요", "보다"],
    related: ["보여주세요"],
    display: ["보여주세요"],
    tags: ["기본회화"],
    phrases: ["{object} 보여주세요"],
  },
  {
    id: "buy",
    patterns: [/사요|사다|구매|팔아요|얼마|가격|깎|할인/],
    terms: ["사다", "사요", "얼마예요", "가격"],
    related: ["얼마예요", "어디서 사요?"],
    display: ["사다"],
    tags: ["쇼핑"],
    phrases: ["{object} 얼마예요?", "{object} 어디서 사요?"],
  },
  {
    id: "exist",
    patterns: [/있어요|있나요|있어|없어요|없나요|없어|필요해|필요해요|필요하다/],
    terms: ["있어요", "있나요", "필요해요", "없어요"],
    related: ["있어요?", "필요해요"],
    display: ["있다"],
    tags: ["기본회화"],
    phrases: ["{object} 있어요?", "{object} 필요해요"],
  },
  {
    id: "eat",
    patterns: [/먹자|먹으러|먹어|먹어요|먹다|마셔|마시|식사/],
    terms: ["먹다", "먹어요", "먹고 싶어요", "마시다", "마셔요"],
    related: ["먹고 싶어요", "마시고 싶어요"],
    display: ["먹다"],
    tags: ["식당"],
    phrases: ["{object} 먹고 싶어요", "{object} 마시고 싶어요"],
  },
  {
    id: "start",
    patterns: [/시작할게|시작할께|시작합시다|시작합니다|시작해요|시작해|시작하자|시작/],
    terms: ["시작하다", "시작해요", "시작합니다"],
    related: ["{object} 시작해요", "{object} 시작합시다"],
    display: ["시작하다"],
    tags: ["기본회화", "일터"],
    preferTags: ["일터"],
    phrases: ["{object} 시작해요", "{object} 시작합시다"],
  },
  {
    id: "operate",
    patterns: [/(?:가동|작동|멈춰|멈추|정지|중지|켜(?:라|요|줘|주세요|다)?|꺼(?:라|요|줘|주세요)?|끄(?:다|고|는))/],
    terms: ["가동", "작동", "멈춰", "멈추다", "켜 주세요", "꺼 주세요"],
    related: ["기계를 가동하세요", "기계를 멈춰 주세요"],
    display: ["가동"],
    tags: ["일터"],
    phrases: ["기계를 가동하세요", "기계를 멈춰 주세요", "기계를 켜 주세요"],
  },
  {
    id: "understand",
    patterns: [/이해해|이해하|이해못|이해 안|알겠|못알아|못 알아/],
    terms: ["이해", "이해해요", "이해합니다", "이해 못해요"],
    related: ["이해하나요?", "이해했어요"],
    display: ["이해"],
    tags: ["기본회화"],
    phrases: ["이해해요", "이해하나요?", "이해합니다", "이해 못해요"],
  },
  {
    id: "urgent",
    patterns: [/급해|급하다|서둘러|빨리|급합니다/],
    terms: ["급하다", "급해요", "빨리", "서둘러"],
    related: ["빨리 해주세요", "지금 바로 해주세요"],
    display: ["급하다"],
    tags: ["기본회화"],
    phrases: ["빨리 해주세요", "지금 바로 해주세요"],
  },
];
const THAI_SCRIPT_REGEX = /[\u0E00-\u0E7F]/;
const NUMBER_QUERY_REGEX = /^[+-]?(?:(?:\d+(?:\.\d+)?)|(?:\.\d+))$/;
const TIME_QUERY_REGEX =
  /^(?:(오전|오후)\s*)?\d{1,2}\s*시(?:\s*(?:\d{1,2}\s*분|반))?$|^(?:(오전|오후)\s*)?\d{1,2}:\d{2}$/;
const TIME_EXTRACT_REGEX =
  /(?:(오전|오후)\s*)?\d{1,2}\s*시(?:\s*(?:\d{1,2}\s*분|반))?|(?:(오전|오후)\s*)?\d{1,2}:\d{2}/;
const TIME_QUESTION_REGEX = /^(?:(?:지금|현재)?(?:시간)?몇시(?:야|예요|에요|인가요|니|냐)?)$|^(?:지금시간|현재시간|지금몇시|현재몇시)$/;

const RESULT_LIMITS = {
  vocab: 8,
  sentences: 10,
  seedEntries: 6,
};

const THAI_NUMERAL_DIGITS = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"];
const NUMBER_WORDS_SCRIPT = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
const NUMBER_WORDS_LATIN = ["sun", "nueng", "song", "sam", "si", "ha", "hok", "chet", "paet", "kao"];
const NUMBER_WORDS_KO = ["쑨", "능", "썽", "쌈", "씨", "하", "혹", "쩻", "뺏", "까오"];
const NUMBER_ET_SCRIPT = "เอ็ด";
const NUMBER_ET_LATIN = "et";
const NUMBER_ET_KO = "엣";
const NUMBER_YI_SCRIPT = "ยี่";
const NUMBER_YI_LATIN = "yi";
const NUMBER_YI_KO = "이";
const NUMBER_UNITS = [
  { script: "แสน", latin: "saen", ko: "쌘" },
  { script: "หมื่น", latin: "muen", ko: "믄" },
  { script: "พัน", latin: "phan", ko: "판" },
  { script: "ร้อย", latin: "roi", ko: "로이" },
  { script: "สิบ", latin: "sip", ko: "씹" },
  { script: "", latin: "", ko: "" },
];
const TIME_WORDS = {
  clock: { script: "นาฬิกา", latin: "nalika", ko: "나리까" },
  minute: { script: "นาที", latin: "nathi", ko: "나티" },
  now: { script: "ตอนนี้เวลา", latin: "ton ni wela", ko: "똔니 웨라" },
  nowQuestion: { script: "ตอนนี้กี่โมงครับ", latin: "ton ni ki mong khrap", ko: "똔니 끼 몽 캅" },
  meet: { script: "เจอกันตอน", latin: "joe kan ton", ko: "저 깐 똔" },
  go: { script: "ไปตอน", latin: "pai ton", ko: "빠이 똔" },
  am: { script: "เช้า", latin: "chao", ko: "차오", korean: "오전" },
  pm: { script: "บ่าย", latin: "bai", ko: "바이", korean: "오후" },
  whatTime: { script: "กี่โมง", latin: "ki mong", ko: "끼 몽" },
};
const NUMBER_UNIT_DEFINITIONS = {
  won: { label: "원", thaiScript: "วอน", thaiKo: "원", english: "won", tags: ["쇼핑", "숫자·시간"] },
  baht: { label: "바트", thaiScript: "บาท", thaiKo: "밧", english: "baht", tags: ["쇼핑", "숫자·시간"] },
  pieces: { label: "개", thaiScript: "ชิ้น", thaiKo: "친", english: "pieces", tags: ["쇼핑", "숫자·시간"] },
  people: { label: "명", thaiScript: "คน", thaiKo: "콘", english: "people", tags: ["숫자·시간"] },
  floor: { label: "층", thaiScript: "ชั้น", thaiKo: "찬", english: "floor", tags: ["이동", "숫자·시간"] },
};
const NUMBER_UNIT_ALIAS_MAP = {
  원: "won",
  krw: "won",
  바트: "baht",
  บาท: "baht",
  밧: "baht",
  개: "pieces",
  명: "people",
  층: "floor",
};
const DEMONSTRATIVE_DEFINITIONS = [
  { aliases: ["이거", "이것", "이건", "이게"], label: "이거", thaiKo: "안 니", thaiScript: "อันนี้" },
  { aliases: ["그거", "그것", "그건", "그게"], label: "그거", thaiKo: "안 난", thaiScript: "อันนั้น" },
  { aliases: ["저거", "저것", "저건", "저게"], label: "저거", thaiKo: "안 논", thaiScript: "อันโน้น" },
];
const ACTION_COMPOSITION_TEMPLATES = {
  request: {
    label: "주세요",
    korean: (objectLabel) => `${objectLabel} 주세요`,
    thaiKo: (objectThaiKo) => `커 ${objectThaiKo} 너이 캅`,
    thaiScript: (objectThaiScript) => `ขอ${objectThaiScript}หน่อยครับ`,
    note: "바로 가리키며 요청할 때",
  },
  bring: {
    label: "가져다 주세요",
    korean: (objectLabel) => `${objectLabel} 가져다 주세요`,
    thaiKo: (objectThaiKo) => `츄어이 아오 ${objectThaiKo} 마 하이 너이 캅`,
    thaiScript: (objectThaiScript) => `ช่วยเอา${objectThaiScript}มาให้หน่อยครับ`,
    note: "가리킨 물건을 가져다 달라고 할 때",
  },
  show: {
    label: "보여 주세요",
    korean: (objectLabel) => `${objectLabel} 보여 주세요`,
    thaiKo: (objectThaiKo) => `커 두 ${objectThaiKo} 너이 캅`,
    thaiScript: (objectThaiScript) => `ขอดู${objectThaiScript}หน่อยครับ`,
    note: "가리킨 물건을 보여 달라고 할 때",
  },
  change: {
    label: "로 바꿔 주세요",
    korean: (objectLabel) => `${attachKoreanDirectionalParticle(objectLabel)} 바꿔 주세요`,
    thaiKo: (objectThaiKo) => `츄어이 쁠리안 펜 ${objectThaiKo} 하이 너이 캅`,
    thaiScript: (objectThaiScript) => `ช่วยเปลี่ยนเป็น${objectThaiScript}ให้หน่อยครับ`,
    note: "가리킨 쪽으로 바꾸고 싶을 때",
  },
  start: {
    label: "시작해요",
    korean: (objectLabel) => `${objectLabel} 시작해요`,
    thaiKo: (objectThaiKo) => `뢰엄 ${objectThaiKo} 캅`,
    thaiScript: (objectThaiScript) => `เริ่ม${objectThaiScript}ครับ`,
    note: "교육이나 업무, 회의를 시작할 때",
  },
};
const ACTION_COMPOSITION_SUFFIXES = {
  request: ["부탁해요", "주세요", "주세여", "줘요", "줘", "부탁"],
  bring: [
    "가져와주세요",
    "가져다주세요",
    "가져오세요",
    "가져와줘요",
    "가져다줘요",
    "가져와줘",
    "가져다줘",
    "갖고와줘",
    "들고와줘",
    "갖다줘",
    "가져와",
    "가져다",
    "가져오",
    "갖고와",
    "들고와",
  ],
  show: ["보여주세요", "보여주세여", "보여줘요", "보여줘", "보여"],
  change: ["바꿔주세요", "바꿔줘요", "바꿔줘", "변경해주세요", "변경해줘", "바꾸다", "바꿔", "변경"],
  start: ["시작할게요", "시작할께요", "시작합니다", "시작합시다", "시작해요", "시작해", "시작하자", "시작"],
};
const ACTION_COMPOSITION_PARTICLE_SUFFIXES = ["으로", "로", "을", "를", "은", "는", "이", "가"];
const ACTION_COMPOSITION_FILLER_SUFFIXES = ["조금만", "좀만", "쫌", "좀"];
const WHAT_QUESTION_SUFFIXES = [
  "무슨뜻이야",
  "무슨뜻일까",
  "무엇이야",
  "무엇인가",
  "무엇일까",
  "뭐예요",
  "뭐에요",
  "뭘까요",
  "뭘까",
  "뭐야",
  "뭐지",
  "뭐냐",
  "뭔가",
];
const PREDICATE_QUERY_FAMILIES = [
  {
    id: "unknown",
    patterns: [/모르다|모른다|몰라|모르겠/],
    primary: ["모르다", "몰라요", "이해 못하다"],
    display: ["모르다", "몰라요"],
    tags: ["기본회화"],
    vocab: [{ korean: "모르다", thaiKo: "마이 루", thaiScript: "ไม่รู้", note: "알지 못하다 / 모르다" }],
    genericSentences: [
      { korean: "몰라요", thaiKo: "마이 루 캅", thaiScript: "ไม่รู้ครับ" },
      { korean: "잘 몰라요", thaiKo: "양 마이 루 캅", thaiScript: "ยังไม่รู้ครับ" },
      { korean: "모르겠어요", thaiKo: "양 마이 카오짜이 캅", thaiScript: "ยังไม่เข้าใจครับ" },
    ],
    selfSentences: [
      { korean: "저는 몰라요", thaiKo: "폼 마이 루 캅", thaiScript: "ผมไม่รู้ครับ" },
      { korean: "저는 잘 몰라요", thaiKo: "폼 양 마이 루 캅", thaiScript: "ผมยังไม่รู้ครับ" },
    ],
  },
  {
    id: "wrong",
    patterns: [/잘못|틀리|실수|오류|오타/],
    primary: ["잘못", "틀리다", "실수"],
    display: ["잘못", "틀리다", "실수"],
    tags: ["기본회화"],
    vocab: [
      { korean: "잘못", thaiKo: "핏", thaiScript: "ผิด", note: "틀리거나 잘못된 상태" },
      { korean: "틀리다", thaiKo: "마이 툭", thaiScript: "ไม่ถูก", note: "맞지 않다" },
      { korean: "실수", thaiKo: "쿠암 핏팟", thaiScript: "ความผิดพลาด", note: "실수 / 잘못" },
    ],
    genericSentences: [
      { korean: "잘못됐어요", thaiKo: "핏 캅", thaiScript: "ผิดครับ" },
      { korean: "틀렸어요", thaiKo: "마이 툭 캅", thaiScript: "ไม่ถูกครับ" },
      { korean: "실수했어요", thaiKo: "탐 핏팟 캅", thaiScript: "ทำผิดพลาดครับ" },
      { korean: "실수예요", thaiKo: "펜 쿠암 핏팟 캅", thaiScript: "เป็นความผิดพลาดครับ" },
    ],
    demonstrativeSentences: [
      { korean: (label) => `${label} 잘못됐어요`, thaiKo: (demo) => `${demo.thaiKo} 핏 캅`, thaiScript: (demo) => `${demo.thaiScript}ผิดครับ` },
      { korean: (label) => `${label} 틀렸어요`, thaiKo: (demo) => `${demo.thaiKo} 마이 툭 캅`, thaiScript: (demo) => `${demo.thaiScript}ไม่ถูกครับ` },
    ],
    selfSentences: [
      { korean: "제 실수예요", thaiKo: "펜 쿠암 핏팟 콩 폼 캅", thaiScript: "เป็นความผิดพลาดของผมครับ" },
      { korean: "제가 잘못했어요", thaiKo: "폼 탐 핏 캅", thaiScript: "ผมทำผิดครับ" },
    ],
  },
  {
    id: "correct",
    patterns: [/맞아|맞다|정답|옳/],
    primary: ["맞다"],
    display: ["맞다"],
    tags: ["기본회화"],
    vocab: [{ korean: "맞다", thaiKo: "툭", thaiScript: "ถูก", note: "맞는 상태" }],
    genericSentences: [{ korean: "맞아요", thaiKo: "툭 캅", thaiScript: "ถูกครับ" }],
    demonstrativeSentences: [
      { korean: (label) => `${label} 맞아요`, thaiKo: (demo) => `${demo.thaiKo} 툭 캅`, thaiScript: (demo) => `${demo.thaiScript}ถูกครับ` },
    ],
  },
  {
    id: "okay",
    patterns: [/괜찮|문제없|이상없|쓸만/],
    primary: ["괜찮다"],
    display: ["괜찮다"],
    tags: ["기본회화"],
    vocab: [{ korean: "괜찮다", thaiKo: "오케", thaiScript: "โอเค", note: "문제없고 괜찮은 상태" }],
    genericSentences: [{ korean: "괜찮아요", thaiKo: "오케 캅", thaiScript: "โอเคครับ" }],
    demonstrativeSentences: [
      { korean: (label) => `${label} 괜찮아요`, thaiKo: (demo) => `${demo.thaiKo} 오케 캅`, thaiScript: (demo) => `${demo.thaiScript}โอเคครับ` },
    ],
  },
  {
    id: "problem",
    patterns: [/문제야|문제가있|이상해|이상하다|고장났/],
    primary: ["문제", "이상하다"],
    display: ["문제", "이상하다"],
    tags: ["기본회화"],
    vocab: [
      { korean: "문제", thaiKo: "빤하", thaiScript: "ปัญหา", note: "문제 / 이슈" },
      { korean: "이상하다", thaiKo: "쁠랏", thaiScript: "แปลก", note: "정상과 다른 상태" },
    ],
    genericSentences: [
      { korean: "문제가 있어요", thaiKo: "미 빤하 캅", thaiScript: "มีปัญหาครับ" },
      { korean: "이상해요", thaiKo: "쁠랏 캅", thaiScript: "แปลกครับ" },
    ],
    demonstrativeSentences: [
      { korean: (label) => `${label} 문제가 있어요`, thaiKo: (demo) => `${demo.thaiKo} 미 빤하 캅`, thaiScript: (demo) => `${demo.thaiScript}มีปัญหาครับ` },
      { korean: (label) => `${label} 이상해요`, thaiKo: (demo) => `${demo.thaiKo} 쁠랏 캅`, thaiScript: (demo) => `${demo.thaiScript}แปลกครับ` },
    ],
  },
];
const THAI_MEANING_STOPWORD_TEXTS = [
  "ครับ",
  "ค่ะ",
  "คะ",
  "นะ",
  "นะครับ",
  "นะคะ",
  "หน่อย",
  "หน่อยครับ",
  "หน่อยค่ะ",
  "ผม",
  "ฉัน",
  "ดิฉัน",
  "ช่วย",
  "ด้วย",
  "เอา",
  "มา",
  "ให้",
  "ดู",
  "ขอ",
  "ไม่",
  "อยู่",
  "ไหน",
  "ที่ไหน",
  "ตรงไหน",
  "ราคา",
  "เท่าไหร่",
  "กี่บาท",
  "เปลี่ยน",
];
const THAI_DEMONSTRATIVE_MEANINGS = [
  { matches: ["อันนี้", "นี่"], label: "이거" },
  { matches: ["อันนั้น", "นั้น"], label: "그거" },
  { matches: ["อันโน้น", "โน้น"], label: "저거" },
];
const THAI_MEANING_INTENT_RULES = [
  { id: "notUnderstand", matches: ["ไม่เข้าใจ", "ไม่ค่อยเข้าใจ"] },
  { id: "help", matches: ["ช่วยด้วย"] },
  { id: "where", matches: ["อยู่ไหน", "ที่ไหน", "ตรงไหน"] },
  { id: "price", matches: ["ราคาเท่าไหร่", "เท่าไหร่", "กี่บาท"] },
  { id: "change", matches: ["เปลี่ยน"] },
  { id: "bring", matches: ["เอามาให้", "เอามา", "หยิบมาให้", "ยกมาให้"] },
  { id: "show", matches: ["ขอดู", "ดู"] },
  { id: "reject", matches: ["ไม่เอา", "ไม่ต้องเอา"] },
  { id: "request", matches: ["เอา", "ขอ"] },
];

const QUERY_BUNDLES = [
  {
    patterns: [/(방|객실|룸).*(바꿔|바꾸|변경|교체)/, /(다른|새).*(방|객실)/],
    primary: ["방", "객실", "바꾸다", "변경"],
    related: [
      "방 바꿔주세요",
      "다른 방으로 바꿔 주세요",
      "방을 좀 바꿔주실 수 있나요?",
      "다른 방",
      "다른 방 있나요",
    ],
    display: ["방", "바꾸다", "다른 방"],
    tags: ["이동", "건강"],
  },
  {
    patterns: [/(체크인|체크아웃|예약|숙소|호텔)/],
    primary: ["호텔", "숙소", "예약"],
    related: ["체크인", "체크아웃", "오늘 밤 빈 방 있나요"],
    display: ["숙소"],
    tags: ["이동", "숫자·시간"],
  },
  {
    patterns: [/(얼마|가격|비싸|깎|할인)/],
    primary: ["얼마", "가격"],
    related: ["얼마예요", "깎아주세요", "할인", "비싸다", "카드", "영수증"],
    display: ["가격"],
    tags: ["쇼핑"],
  },
  {
    patterns: [/(계산|결제|영수증|카드)/],
    primary: ["계산", "결제"],
    related: ["영수증", "카드", "계산서"],
    display: ["계산"],
    tags: ["식당", "쇼핑"],
  },
  {
    patterns: [/(물|생수|마실)/],
    primary: ["물", "생수"],
    related: ["차가운 물", "따뜻한 물"],
    display: ["물"],
    tags: ["식당", "건강"],
  },
  {
    patterns: [/(화장실|욕실|변기)/],
    primary: ["화장실"],
    related: ["화장실 어디예요", "가다", "욕실"],
    display: ["화장실"],
    tags: ["이동", "건강"],
  },
  {
    patterns: [/(매표소|발권\s*창구|티켓\s*부스|티켓\s*창구|표\s*(?:사는|파는)\s*곳)/],
    primary: ["매표소", "티켓", "표"],
    related: ["매표소가 어디예요?", "표 파는 곳이 어디예요?", "여기서 표를 사요?"],
    display: ["매표소"],
    tags: ["이동", "쇼핑"],
  },
  {
    patterns: [/(병원|약국|약|아파|두통|열)/],
    primary: ["병원", "약"],
    related: ["아프다", "두통", "열", "약국"],
    display: ["병원"],
    tags: ["건강"],
  },
  {
    patterns: [/(와이파이|wifi|인터넷|비밀번호)/i],
    primary: ["와이파이", "비밀번호"],
    related: ["인터넷"],
    display: ["와이파이"],
    tags: ["이동"],
  },
  {
    patterns: [/(천천히|다시|이해|못 알아|못알아)/],
    primary: ["천천히", "다시"],
    related: ["이해", "도와주세요", "한 번 더"],
    display: ["다시"],
    tags: ["기본회화"],
  },
];

const QUERY_PARTS = [
  {
    patterns: [/^방$|객실|룸|방바꿔|방좀바꿔|다른방|빈방|조용한방|깨끗한방|더러운방|시원한방|고장난방|방이|방안/],
    primary: ["방", "객실"],
    related: ["다른 방"],
    display: ["방"],
    tags: ["이동"],
  },
  { patterns: [/바꿔|바꾸|변경|교체/], primary: ["바꾸다", "변경"], related: ["방 바꿔주세요"], display: ["바꾸다"], tags: ["이동"] },
  { patterns: [/주세요|부탁|도와|해줘/], related: ["주세요", "부탁"], display: ["부탁"], tags: ["기본회화"] },
  { patterns: [/얼마|가격|비싸|깎/], primary: ["얼마", "가격"], related: ["비싸다", "깎아주세요"], display: ["가격"], tags: ["쇼핑"] },
  { patterns: [/계산|결제|영수증|카드/], primary: ["계산"], related: ["결제", "영수증", "카드"], display: ["계산"], tags: ["식당", "쇼핑"] },
  { patterns: [/물|생수/], primary: ["물", "생수"], related: ["차가운 물", "따뜻한 물"], display: ["물"], tags: ["식당", "건강"] },
  { patterns: [/화장실|욕실|변기/], primary: ["화장실"], related: ["욕실", "어디", "가다"], display: ["화장실"], tags: ["이동", "건강"] },
  { patterns: [/매표소|발권\s*창구|티켓\s*부스|티켓\s*창구|표\s*(?:사는|파는)\s*곳/], primary: ["매표소", "티켓", "표"], related: ["매표소가 어디예요?", "표 파는 곳이 어디예요?", "여기서 표를 사요?"], display: ["매표소"], tags: ["이동", "쇼핑"] },
  { patterns: [/가다|간다|가요|갑니다|갈게|갈래|가고|갔다/], primary: ["가다"], related: ["어디", "화장실", "공항"], display: ["가다"], tags: ["이동", "기본회화"] },
  { patterns: [/오다|온다|와요|옵니다|올게|오고|왔다/], primary: ["오다"], related: ["여기로 오세요"], display: ["오다"], tags: ["이동", "기본회화"] },
  { patterns: [/먹다|먹어요|먹는다|먹고/], primary: ["먹다"], related: ["메뉴", "음식"], display: ["먹다"], tags: ["식당", "기본회화"] },
  { patterns: [/마시다|마셔|마신다/], primary: ["마시다"], related: ["물", "음료"], display: ["마시다"], tags: ["식당", "기본회화"] },
  { patterns: [/주스|쥬스|음료/], primary: ["주스", "음료"], related: ["과일", "수박", "오렌지"], display: ["주스"], tags: ["식당", "쇼핑"] },
  {
    patterns: [/시끄럽|소음/],
    primary: ["시끄럽다", "소음"],
    related: ["시끄러워요", "방이 시끄러워요", "이 방은 너무 시끄러워요"],
    display: ["시끄럽다", "소음"],
    tags: ["이동", "기본회화"],
  },
  { patterns: [/조용하|조용해|조용한/], primary: ["조용하다", "조용한 방"], related: ["조용한 방 있나요?", "소음 없는 방"], display: ["조용한 방"], tags: ["이동", "기본회화"] },
  { patterns: [/냄새|더럽|지저분|청소/], primary: ["냄새", "청소"], related: ["방에서 냄새가 나요", "청소해 주세요"], display: ["청소"], tags: ["이동", "기본회화"] },
  { patterns: [/에어컨|냉방|안시원|안 시원/], primary: ["에어컨"], related: ["에어컨이 안 시원해요", "에어컨이 너무 추워요", "에어컨이 너무 더워요"], display: ["에어컨"], tags: ["이동", "기본회화"] },
  { patterns: [/온수|뜨거운물|뜨거운 물/], primary: ["온수"], related: ["온수가 안 나와요", "뜨거운 물"], display: ["온수"], tags: ["이동", "기본회화"] },
  { patterns: [/문안잠|문 안 잠|잠기|도어락/], primary: ["문", "문제"], related: ["문이 안 잠겨요"], display: ["문"], tags: ["이동", "기본회화"] },
  { patterns: [/수건/], primary: ["수건"], related: ["수건 두 장 더 주세요"], display: ["수건"], tags: ["이동", "기본회화"] },
  { patterns: [/휴지|화장지|티슈/], primary: ["휴지", "화장지"], related: ["휴지 더 주세요"], display: ["휴지"], tags: ["이동", "기본회화"] },
  { patterns: [/충전기|차저|charger|어댑터|콘센트/], primary: ["충전기", "어댑터"], related: ["충전기 있어요?", "콘센트"], display: ["충전기"], tags: ["이동", "쇼핑"] },
  { patterns: [/컴퓨터|노트북|랩탑|pc|피시/], primary: ["컴퓨터"], related: ["노트북", "컴퓨터가 안 돼요", "노트북이 안 켜져요"], display: ["컴퓨터"], tags: ["기본회화", "일터"] },
  { patterns: [/담배|흡연|금연|흡연실|담배피우/], primary: ["담배", "담배 피우다"], related: ["흡연실", "담배 피워도 돼요?", "금연 구역"], display: ["담배"], tags: ["기본회화", "이동"] },
  { patterns: [/예쁘|이쁘|예뻐|이뻐/], primary: ["예쁘다"], related: ["예뻐요", "정말 예뻐요"], display: ["예쁘다"], tags: ["기본회화", "쇼핑"] },
  { patterns: [/잘하|잘했/], primary: ["잘하다"], related: ["잘하고 있어요", "잘했어요"], display: ["잘하다"], tags: ["기본회화"] },
  { patterns: [/동전|잔돈|거스름돈/], primary: ["동전", "잔돈"], related: ["동전 있어요?", "잔돈 있어요?"], display: ["동전"], tags: ["쇼핑", "기본회화"] },
  { patterns: [/주식|주가|주식시장|stock/i], primary: ["주식"], related: ["주식 투자", "주식을 사요"], display: ["주식"], tags: ["기본회화"] },
  { patterns: [/옷.*줄|옷줄|작아졌|줄어들/], primary: ["옷", "줄다"], related: ["옷이 줄었어요", "이 옷이 작아졌어요"], display: ["옷"], tags: ["쇼핑", "기본회화"] },
  { patterns: [/덥|더워|더운/], primary: ["덥다"], related: ["더워요", "오늘 너무 더워요", "이 방은 너무 더워요"], display: ["덥다"], tags: ["기본회화", "이동"] },
  { patterns: [/깎|깍|할인/], primary: ["깎다"], related: ["깎아주세요", "조금만 더 깎아주세요"], display: ["깎다"], tags: ["쇼핑"] },
  { patterns: [/완성|완료|끝났|다끝|다 끝|마무리/], primary: ["완성", "끝나다"], related: ["완성됐어요", "다 끝났어요", "아직 안 끝났어요"], display: ["완성"], tags: ["기본회화", "일터"] },
  { patterns: [/한가|안바빠|안 바빠|시간있|시간 있어/], primary: ["한가하다"], related: ["지금 한가해요?", "지금 안 바빠요"], display: ["한가하다"], tags: ["기본회화"] },
  { patterns: [/큰일|심각|난감/], primary: ["큰일"], related: ["큰일 났어요", "이거 큰일이에요"], display: ["큰일"], tags: ["기본회화"] },
  { patterns: [/보다|봐요|본다/], primary: ["보다"], related: ["여기", "보여주세요"], display: ["보다"], tags: ["기본회화"] },
  { patterns: [/말하다|말해|말해요|말한다/], primary: ["말하다"], related: ["천천히", "다시"], display: ["말하다"], tags: ["기본회화"] },
  { patterns: [/이해|알겠|알겠습니다|알겠어/], primary: ["이해"], related: ["이해해요", "이해하나요", "이해합니다", "알겠습니다"], display: ["이해"], tags: ["기본회화"] },
  { patterns: [/급해|급하다|서둘러|급합니다|빨리좀|빨리 해/], primary: ["급하다", "빨리"], related: ["서둘러", "지금", "바로"], display: ["급하다"], tags: ["기본회화"] },
  { patterns: [/배고프|허기|시장해/], primary: ["배고프다"], related: ["배고파요", "배고프세요?", "밥 먹고 싶어요", "먹을 거 있어요?"], display: ["배고프다"], tags: ["식당", "기본회화", "건강"] },
  {
    patterns: [/^빨래$/, /^세탁$/, /빨래해|세탁해|빨래맡기|세탁맡기/, /세탁실|세제/],
    primary: ["빨래", "세탁"],
    related: ["세탁실", "세제", "빨래 맡기고 싶어요"],
    display: ["빨래"],
    tags: ["기본회화", "이동"],
  },
  { patterns: [/병원|약국|약|아파|두통|열/], primary: ["병원", "약"], related: ["아프다", "두통", "열"], display: ["병원"], tags: ["건강"] },
  { patterns: [/머리|배탈|배아파|배가아파|복통|두통|기침|콧물|어지러|멀미|설사|구토|토할|상처|허리|다리|무릎|숨쉬기/], primary: ["아프다", "병원"], related: ["약국", "의사", "약", "도와주세요"], display: ["건강"], tags: ["건강"] },
  { patterns: [/티셔츠|셔츠|바지|치마|원피스|드레스|자켓|재킷|점퍼|속옷|양말|신발|모자|우산|수영복/], primary: ["옷"], related: ["사이즈", "색", "보여주세요"], display: ["옷"], tags: ["쇼핑"] },
  { patterns: [/엔드밀|드릴|커터|공구|공구함|비트|홀더/], primary: ["엔드밀", "공구"], related: ["드릴", "커터", "홀더", "가져와 주세요"], display: ["공구"], tags: ["일터"] },
  { patterns: [/기계|장비|라인|공장|현장/], primary: ["기계", "작업"], related: ["가동", "작동", "시작하다", "멈추다", "공장"], display: ["기계"], tags: ["일터"] },
  { patterns: [/(?:가동|작동|멈춰|멈추|정지|중지|켜(?:라|요|줘|주세요|다)?|꺼(?:라|요|줘|주세요)?|끄(?:다|고|는))/], primary: ["작동", "시작하다"], related: ["기계", "가동", "멈추다", "켜다", "끄다"], display: ["작동"], tags: ["일터"] },
  { patterns: [/교육|훈련|트레이닝|오리엔테이션|안전교육|입사교육|수업/], primary: ["교육", "훈련"], related: ["교육 시작", "교육 시작합시다", "교육 언제 시작해요?"], display: ["교육"], tags: ["일터", "기본회화"] },
  { patterns: [/업무|작업|회의|미팅/], primary: ["업무", "작업", "회의"], related: ["업무 시작", "업무 시작합시다", "작업 시작할게요", "회의 시작합시다"], display: ["업무"], tags: ["일터"] },
  { patterns: [/몇\s*시|몇시|현재시간|지금시간/], primary: ["시간", "몇 시"], related: ["지금 몇 시예요", "현재 시간", "오전", "오후"], display: ["시간"], tags: ["숫자·시간"] },
  { patterns: [/점심|아침|저녁|밥|식사/], primary: ["점심식사", "먹다"], related: ["아침식사", "저녁식사", "가다", "같이"], display: ["식사"], tags: ["식당", "기본회화"] },
  { patterns: [/가자|먹자|하자|갈래/], primary: ["가다"], related: ["같이", "먹다", "하다", "점심 먹으러 가자"], display: ["같이"], tags: ["기본회화"] },
  { patterns: [/잃어버|분실|못찾|못 찾|두고왔|놓고왔/], primary: ["분실"], related: ["여권", "지갑", "휴대폰", "도와주세요", "경찰"], display: ["분실"], tags: ["이동", "기본회화"] },
  { patterns: [/체크인|체크아웃|게이트|탑승권|보딩패스|예약/], primary: ["예약", "체크인"], related: ["체크아웃", "게이트", "탑승권"], display: ["예약"], tags: ["이동"] },
  { patterns: [/비|우산|날씨|더워|추워|에어컨/], primary: ["날씨"], related: ["비", "우산", "에어컨", "더운 날씨", "추운 날씨"], display: ["날씨"], tags: ["기본회화", "이동"] },
  { patterns: [/냄새|소음|시끄러|얼룩|누수|물새|막혔|수리|청소/], primary: ["문제"], related: ["수리", "청소", "냄새", "소음", "누수"], display: ["문제"], tags: ["이동", "건강"] },
  { patterns: [/와이파이|wifi|인터넷|비밀번호/i], primary: ["와이파이"], related: ["비밀번호", "인터넷"], display: ["와이파이"], tags: ["이동"] },
  { patterns: [/천천히|다시|이해|못 알아|못알아/], primary: ["천천히", "다시"], related: ["이해", "한 번 더"], display: ["다시"], tags: ["기본회화"] },
];

const QUERY_ALIASES = [
  {
    matches: ["방바꿔주세요", "방좀바꿔주세요", "객실변경", "객실교체", "방교체", "룸체인지", "방바꿔", "방좀바꿔"],
    primary: ["방", "객실", "바꾸다", "변경"],
    related: ["다른 방", "방 바꿔주세요", "다른 방으로 바꿔 주세요", "방을 좀 바꿔주실 수 있나요?"],
    display: ["방", "바꾸다", "다른 방"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["방시끄러워", "소음때문에", "에어컨안돼", "온수안나와", "방냄새", "문안잠겨", "샤워기고장"],
    primary: ["방", "객실", "문제"],
    related: ["방 바꿔주세요", "다른 방", "조용한 방", "에어컨", "온수", "욕실"],
    display: ["방 문제"],
    tags: ["이동", "건강"],
  },
  {
    matches: ["시끄럽다", "시끄러워", "시끄러워요", "소음", "너무시끄러워", "너무시끄러워요", "조용한방", "조용하다", "조용해", "조용해요"],
    primary: ["시끄럽다", "소음"],
    related: ["시끄러워요", "방이 시끄러워요", "이 방은 너무 시끄러워요", "조용한 방 있나요?"],
    display: ["시끄럽다", "소음"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["냄새나요", "냄새나", "방냄새", "더럽다", "더러워", "더러워요", "지저분해", "청소해주세요"],
    primary: ["냄새", "청소", "문제"],
    related: ["방에서 냄새가 나요", "이 방에 냄새가 나요", "청소해 주세요"],
    display: ["냄새", "청소"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["에어컨안시원해", "에어컨안시원해요", "에어컨너무추워", "에어컨너무더워", "온수안나와", "온수가안나와요", "문안잠겨", "문이안잠겨요"],
    primary: ["에어컨", "온수", "문제"],
    related: ["에어컨이 안 시원해요", "온수가 안 나와요", "문이 안 잠겨요"],
    display: ["에어컨", "온수", "문"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: [
      "와이파이느려",
      "와이파이느려요",
      "와이파이안돼",
      "와이파이안돼요",
      "인터넷안돼",
      "인터넷안돼요",
      "인터넷이안돼요",
      "와이파이비밀번호",
      "비밀번호뭐예요",
    ],
    primary: ["와이파이", "인터넷", "비밀번호"],
    related: ["와이파이가 안 돼요", "인터넷이 안 돼요", "와이파이가 너무 느려요", "와이파이 비밀번호가 뭐예요?"],
    display: ["와이파이"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["수건", "수건더주세요", "휴지", "휴지더주세요", "화장지", "충전기", "충전기있어요", "어댑터", "콘센트"],
    primary: ["수건", "휴지", "충전기"],
    related: ["수건 두 장 더 주세요", "휴지 더 주세요", "충전기 있어요?"],
    display: ["수건", "휴지", "충전기"],
    tags: ["이동", "기본회화", "쇼핑"],
  },
  {
    matches: ["매표소", "표사는곳", "표파는곳", "티켓부스", "티켓창구", "발권창구"],
    primary: ["매표소", "티켓", "표"],
    related: ["매표소가 어디예요?", "표 파는 곳이 어디예요?", "여기서 표를 사요?", "버스표는 어디서 사요?", "기차표는 어디서 사요?"],
    display: ["매표소"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["교육시작", "교육 시작", "교육을시작해", "교육을 시작해", "훈련시작", "훈련 시작", "오리엔테이션시작", "오리엔테이션 시작"],
    primary: ["교육", "훈련", "오리엔테이션", "시작하다"],
    related: ["교육 시작합시다", "교육 언제 시작해요?", "오리엔테이션 시작해요"],
    display: ["교육 시작"],
    tags: ["일터"],
  },
  {
    matches: ["업무시작", "업무 시작", "업무를시작해", "업무를 시작해", "작업시작", "작업 시작", "작업을시작해", "작업을 시작해", "회의시작", "회의 시작"],
    primary: ["업무", "작업", "회의", "시작하다"],
    related: ["업무 시작합시다", "작업 시작할게요", "회의 시작합시다"],
    display: ["업무 시작"],
    tags: ["일터"],
  },
  {
    matches: ["현금인출기", "atm", "atm기", "현금뽑는기계"],
    primary: ["ATM", "현금인출기"],
    related: ["ATM이 어디예요?", "현금 뽑고 싶어요", "여기서 ATM까지 멀어요?"],
    display: ["ATM"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["승강장", "플랫폼"],
    primary: ["플랫폼", "승강장"],
    related: ["승강장이 어디예요?", "플랫폼이 어디예요?", "이 승강장 맞아요?"],
    display: ["승강장"],
    tags: ["이동"],
  },
  {
    matches: ["오토바이택시", "오토바이 택시", "바이크택시"],
    primary: ["오토바이택시", "택시"],
    related: ["오토바이 택시 불러 주세요", "오토바이 택시 타고 싶어요", "오토바이 택시가 어디예요?"],
    display: ["오토바이택시"],
    tags: ["이동"],
  },
  {
    matches: ["휴지통", "쓰레기통"],
    primary: ["휴지통", "쓰레기통"],
    related: ["휴지통이 어디예요?", "쓰레기통이 어디예요?"],
    display: ["휴지통"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["물티슈"],
    primary: ["물티슈"],
    related: ["물티슈 주세요", "물티슈 있어요?", "물티슈 더 주세요"],
    display: ["물티슈"],
    tags: ["건강", "이동", "기본회화"],
  },
  {
    matches: ["세탁기", "건조기", "세탁기사용하고싶어요", "세탁기쓰고싶어요"],
    primary: ["세탁기", "건조기"],
    related: ["세탁기 어디에요?", "건조기 있어요?", "세탁기 쓰고 싶어요"],
    display: ["세탁기", "건조기"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["세탁소", "빨래방", "코인세탁", "세탁소가어디예요", "빨래방이어디예요"],
    primary: ["세탁소", "빨래방"],
    related: ["세탁소가 어디예요?", "빨래방이 어디예요?", "빨래 맡기고 싶어요"],
    display: ["세탁소", "빨래방"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["냉장고", "냉장고가안돼요", "냉장고가안차가워요"],
    primary: ["냉장고"],
    related: ["냉장고가 안 돼요", "냉장고가 안 차가워요"],
    display: ["냉장고"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["세면대", "세면대가막혔어요", "세면대물이안내려가요"],
    primary: ["세면대"],
    related: ["세면대가 막혔어요", "세면대 물이 안 내려가요"],
    display: ["세면대"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["보조배터리", "파워뱅크", "파워뱅"],
    primary: ["보조배터리", "충전기"],
    related: ["보조배터리 있어요?", "보조배터리 좀 주세요", "휴대폰 충전할 수 있어요?"],
    display: ["보조배터리"],
    tags: ["이동", "쇼핑", "기본회화"],
  },
  {
    matches: ["지갑"],
    primary: ["지갑"],
    related: ["지갑을 잃어버렸어요", "지갑 어디에요?"],
    display: ["지갑"],
    tags: ["쇼핑", "이동", "기본회화"],
  },
  {
    matches: ["선글라스", "썬글라스"],
    primary: ["선글라스"],
    related: ["선글라스 있어요?", "이 선글라스 주세요", "선글라스 어디서 사요?"],
    display: ["선글라스"],
    tags: ["쇼핑"],
  },
  {
    matches: ["메시지", "문자", "메시지로보내주세요", "문자로보내주세요", "문자로보내도돼요", "메시지다시보내주세요"],
    primary: ["메시지", "문자"],
    related: ["메시지로 보내 주세요", "문자로 보내도 돼요?", "메시지 다시 보내 주세요"],
    display: ["메시지"],
    tags: ["기본회화", "이동"],
  },
  {
    matches: ["전화", "통화", "콜", "전화해주세요", "지금전화가능해요", "전화좀빌려주세요"],
    primary: ["전화", "통화"],
    related: ["전화해 주세요", "지금 전화 가능해요?", "전화 좀 빌려 주세요"],
    display: ["전화"],
    tags: ["기본회화", "이동"],
  },
  {
    matches: ["컴퓨터", "컴퓨터가안돼요", "컴퓨터안돼", "노트북", "노트북이안켜져요"],
    primary: ["컴퓨터"],
    related: ["컴퓨터가 안 돼요", "노트북이 안 켜져요", "컴퓨터를 확인해 주세요"],
    display: ["컴퓨터"],
    tags: ["기본회화", "일터"],
  },
  {
    matches: ["잘하고있어", "잘하고있어요"],
    primary: ["잘하다"],
    related: ["잘하고 있어요", "잘했어요", "대단해요"],
    display: ["잘하다"],
    tags: ["기본회화"],
  },
  {
    matches: ["담배피우다", "담배피워도돼요", "흡연실"],
    primary: ["담배", "담배 피우다"],
    related: ["담배 피워도 돼요?", "흡연실이 어디예요?", "여기서 담배 피우면 안 돼요?"],
    display: ["담배"],
    tags: ["기본회화", "이동"],
  },
  {
    matches: ["이쁘다", "예쁘다", "예뻐요"],
    primary: ["예쁘다"],
    related: ["예뻐요", "정말 예뻐요", "귀여워요"],
    display: ["예쁘다"],
    tags: ["기본회화", "쇼핑"],
  },
  {
    matches: ["동전", "잔돈", "거스름돈"],
    primary: ["동전", "잔돈"],
    related: ["동전 있어요?", "거스름돈 주세요", "잔돈 있어요?"],
    display: ["동전"],
    tags: ["기본회화", "쇼핑"],
  },
  {
    matches: ["주식", "주식시장"],
    primary: ["주식"],
    related: ["주식을 사요", "저는 주식에 투자해요", "요즘 주식이 내려가요"],
    display: ["주식"],
    tags: ["기본회화", "쇼핑"],
  },
  {
    matches: ["옷이줄었다", "옷줄었다"],
    primary: ["옷", "줄다"],
    related: ["옷이 줄었어요", "세탁하니까 옷이 줄었어요", "이 옷이 작아졌어요"],
    display: ["옷"],
    tags: ["기본회화", "쇼핑"],
  },
  {
    matches: ["더워", "더워요"],
    primary: ["덥다"],
    related: ["더워요", "오늘 너무 더워요", "이 방은 너무 더워요"],
    display: ["덥다"],
    tags: ["기본회화", "이동"],
  },
  {
    matches: ["깍다", "깎다"],
    primary: ["깎다"],
    related: ["깎아주세요", "조금만 더 깎아 주세요", "현금으로 하면 깎아줄 수 있어요?"],
    display: ["깎다"],
    tags: ["쇼핑"],
  },
  {
    matches: ["완성", "완료"],
    primary: ["완성"],
    related: ["완성됐어요", "다 끝났어요", "거의 다 됐어요"],
    display: ["완성"],
    tags: ["기본회화", "일터"],
  },
  {
    matches: ["한가하다", "한가해요"],
    primary: ["한가하다"],
    related: ["지금 한가해요?", "지금 안 바빠요", "지금 바빠요"],
    display: ["한가하다"],
    tags: ["기본회화"],
  },
  {
    matches: ["큰일난다", "큰일났어요", "큰일"],
    primary: ["큰일"],
    related: ["큰일 났어요", "이거 큰일이에요", "생각보다 심각해요"],
    display: ["큰일"],
    tags: ["기본회화"],
  },
  {
    matches: ["얼마에요", "얼마예요", "가격", "요금", "비용", "얼마", "깎아주세요", "할인", "비싸요", "싸요"],
    primary: ["얼마", "가격"],
    related: ["비용", "요금", "할인", "깎아주세요", "비싸다", "싸다", "카드", "현금"],
    display: ["가격"],
    tags: ["쇼핑"],
  },
  {
    matches: ["계산해주세요", "계산", "결제", "카드돼요", "카드되나요", "영수증", "환불", "교환", "큐알", "qr"],
    primary: ["계산", "결제"],
    related: ["카드", "영수증", "체크빌", "환불", "교환", "QR 결제"],
    display: ["계산"],
    tags: ["식당", "쇼핑"],
  },
  {
    matches: ["와이파이", "wifi", "비밀번호", "패스워드", "인터넷", "와이파이비번", "인터넷안돼요"],
    primary: ["와이파이", "인터넷"],
    related: ["비밀번호", "패스워드", "와이파이 비밀번호", "인터넷 안 돼요"],
    display: ["와이파이"],
    tags: ["이동"],
  },
  {
    matches: ["화장실", "욕실", "샤워", "온수"],
    primary: ["화장실", "욕실"],
    related: ["화장실 어디예요", "샤워기", "온수"],
    display: ["화장실"],
    tags: ["이동", "건강"],
  },
  {
    matches: ["화장실간다", "화장실가고싶어", "화장실가고싶어요", "화장실가", "화장실가야해"],
    primary: ["화장실", "가다"],
    related: ["화장실 가고 싶어요", "화장실", "가다"],
    display: ["화장실", "가다"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["화장실어디에요", "화장실어디예요", "화장실이어디예요"],
    primary: ["화장실", "어디"],
    related: ["화장실 어디예요", "화장실", "어디"],
    display: ["화장실", "어디"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["병원", "약국", "아파요", "두통", "복통", "응급실", "열나요"],
    primary: ["병원", "약"],
    related: ["약국", "응급실", "도와주세요"],
    display: ["병원"],
    tags: ["건강"],
  },
  {
    matches: ["택시", "공항", "지하철", "역", "길", "주소", "지도", "미터", "택시불러주세요", "공항가주세요"],
    primary: ["택시", "가다", "어디"],
    related: ["공항", "지하철역", "주소", "지도", "길", "미터", "택시 불러주세요"],
    display: ["이동"],
    tags: ["이동"],
  },
  {
    matches: ["안맵게", "덜맵게", "고수빼", "포장", "추천메뉴", "메뉴", "채식", "비건", "얼음빼"],
    primary: ["메뉴", "음식"],
    related: ["안 맵게", "덜 맵게", "고수 빼", "포장", "추천", "채식", "얼음 빼"],
    display: ["식당"],
    tags: ["식당"],
  },
  {
    matches: ["주스", "쥬스", "수박주스", "수박쥬스", "오렌지주스", "망고주스", "음료", "차가운음료"],
    primary: ["주스", "음료"],
    related: ["수박 주스", "오렌지 주스", "망고 주스", "과일", "물"],
    display: ["주스"],
    tags: ["식당", "쇼핑"],
  },
  {
    matches: ["빨래", "세탁", "세탁실", "세제", "빨래해주세요", "세탁해주세요", "빨래맡기고싶어요"],
    primary: ["빨래", "세탁"],
    related: ["세탁기", "세탁실", "건조기", "세제", "옷", "수건"],
    display: ["빨래"],
    tags: ["기본회화", "이동"],
  },
  {
    matches: ["급해", "급해요", "급합니다", "급하다", "빨리", "서둘러", "지금바로", "급한데"],
    primary: ["급하다", "빨리"],
    related: ["서둘러", "지금", "바로", "빨리 해주세요"],
    display: ["급하다"],
    tags: ["기본회화"],
  },
  {
    matches: ["배고프다", "배고파", "배고파요", "배가고파", "배가고파요", "시장해", "시장해요", "허기져", "허기지다"],
    primary: ["배고프다", "배고파요"],
    related: ["배고프세요?", "밥 먹고 싶어요", "먹을 거 있어요?", "식당"],
    display: ["배고프다", "식사"],
    tags: ["식당", "기본회화", "건강"],
  },
  {
    matches: [
      "잘못된방법",
      "그건잘못된방법이야",
      "틀린방법",
      "그방법틀렸어",
      "잘못되었어",
      "잘못됐어",
      "잘못되었어요",
      "잘못됐어요",
      "잘못되었습니다",
      "잘못됐습니다",
      "틀렸어",
      "틀렸어요",
      "틀렸습니다",
      "틀린거야",
      "틀린거예요",
      "이건잘못되었어",
      "이건잘못됐어",
      "이건잘못되었어요",
      "이건잘못됐어요",
      "이건틀렸어",
      "이건틀렸어요",
      "그건잘못되었어",
      "그건잘못됐어",
      "그건틀렸어",
      "그건틀렸어요"
    ],
    primary: ["잘못", "틀리다", "방법"],
    related: ["이건 잘못됐어요", "그건 잘못됐어요", "이건 틀렸어요", "그건 잘못된 방법이야", "다르게 해야 해요", "이건 맞는 방법이에요"],
    display: ["잘못", "틀리다"],
    tags: ["기본회화"],
  },
  {
    matches: ["이해", "이해해", "이해해요", "이해합니다", "이해하나요", "이해하니", "이해못해", "이해못해요", "이해안돼요", "알겠습니다", "알겠어요"],
    primary: ["이해"],
    related: ["이해해요", "이해하나요", "이해합니다", "이해했어요", "이해 못해요"],
    display: ["이해"],
    tags: ["기본회화"],
  },
  {
    matches: ["기계가동해라", "기계가동하세요", "기계가동해주세요", "기계를가동하세요", "기계를켜라", "기계켜", "기계멈춰", "기계멈춰라", "기계꺼", "기계를꺼주세요"],
    primary: ["기계", "가동", "작동"],
    related: ["기계를 가동하세요", "기계를 켜 주세요", "기계를 멈춰 주세요", "작업 시작합시다"],
    display: ["기계", "가동"],
    tags: ["일터"],
  },
  {
    matches: ["기계시끄러워", "기계시끄러워요", "기계소음", "장비시끄러워", "장비소음"],
    primary: ["기계", "소음"],
    related: ["기계가 너무 시끄러워요", "기계 소음이 심해요", "기계를 확인해 주세요"],
    display: ["기계", "소음"],
    tags: ["일터"],
  },
  {
    matches: ["엔드밀", "엔드밀가져와줘", "엔드밀가져와주세요", "엔드밀주세요", "엔드밀있어요", "앤드밀", "앤드밀가져와줘"],
    primary: ["엔드밀", "공구"],
    related: ["엔드밀 가져와 주세요", "엔드밀 있어요", "드릴", "커터", "공구 가져와 주세요"],
    display: ["엔드밀", "공구"],
    tags: ["일터"],
  },
  {
    matches: ["몇시야", "몇시에요", "몇시예요", "지금몇시야", "지금몇시에요", "지금몇시예요", "현재몇시", "현재시간", "지금시간"],
    primary: ["시간", "몇 시"],
    related: ["지금 몇 시예요", "현재 시간", "오전", "오후"],
    display: ["시간", "몇 시"],
    tags: ["숫자·시간"],
  },
  {
    matches: ["점심먹으러가자", "점심먹으로가자", "점심먹자", "밥먹으러가자", "밥먹으로가자", "밥먹자", "점심먹으러갈래", "점심먹을래", "저녁먹으러가자", "아침먹으러가자", "같이가자"],
    primary: ["점심식사", "먹다", "가다"],
    related: ["점심 먹으러 가자", "밥 먹으러 가자", "같이 가자", "점심시간이에요"],
    display: ["점심", "같이"],
    tags: ["식당", "기본회화"],
  },
  {
    matches: ["급여", "월급", "임금", "시급", "일당", "급여명세서", "월급명세서", "월급날", "초과근무", "연장근무", "오티"],
    primary: ["월급", "급여", "급여명세서", "초과근무"],
    related: ["월급이 아직 안 들어왔어요", "급여명세서 확인해 주세요", "월급날이 언제예요?", "오늘 초과근무 있어요?"],
    display: ["급여", "초과근무"],
    tags: ["일터", "숫자·시간"],
  },
  {
    matches: ["인사팀", "인사부", "관리자", "매니저", "반장", "라인반장", "팀장", "사장님", "상사", "사원증", "직원증", "출입카드", "출입증", "계약서", "근로계약서", "서류", "통장", "급여계좌"],
    primary: ["인사팀", "관리자", "반장", "사원증", "출입카드", "계약서"],
    related: ["인사팀이 어디예요?", "관리자 좀 불러 주세요", "반장님 어디 계세요?", "계약서를 다시 보여 주세요"],
    display: ["인사팀", "관리자"],
    tags: ["일터"],
  },
  {
    matches: ["기숙사", "기숙사비", "숙소비", "공과금", "전기세", "전기요금", "수도세", "수도요금", "가스비", "가스요금", "인터넷비", "와이파이요금", "관리비"],
    primary: ["기숙사", "공과금", "전기세", "수도세"],
    related: ["기숙사에 문제가 있어요", "기숙사비 얼마예요?", "공과금은 어디서 내요?", "전기세가 너무 많이 나왔어요"],
    display: ["기숙사", "공과금"],
    tags: ["일터", "이동"],
  },
  {
    matches: ["버스시간", "버스시간표", "첫차", "막차", "통근버스", "셔틀버스", "회사버스", "버스몇시", "버스가몇시에와요"],
    primary: ["버스 시간표", "통근버스", "첫차", "막차"],
    related: ["버스 시간표 보여 주세요", "버스가 몇 시에 와요?", "통근버스가 몇 시에 와요?", "막차가 몇 시예요?"],
    display: ["버스 시간표", "통근버스"],
    tags: ["이동", "숫자·시간", "일터"],
  },
  {
    matches: ["근무시간", "출근시간", "퇴근시간", "출근", "퇴근", "초과근무", "연장근무", "야근", "조퇴", "휴게시간", "쉬는날", "휴무", "교대근무", "주간근무", "야간근무"],
    primary: ["근무시간", "출근", "퇴근", "초과근무", "휴게시간", "휴무"],
    related: ["몇 시 출근이에요?", "몇 시 퇴근이에요?", "오늘 초과근무 있어요?", "쉬는 날이 언제예요?"],
    display: ["근무시간", "초과근무"],
    tags: ["일터", "숫자·시간"],
  },
];

const QUERY_ENDINGS = [
  { suffix: "해주세요", primary: ["하다"], related: ["부탁", "주세요"], display: ["부탁"] },
  { suffix: "해줘요", primary: ["하다"], related: ["부탁", "주세요"], display: ["부탁"] },
  { suffix: "해라", primary: ["하다"], related: ["시작하다", "부탁"], display: ["하다"] },
  { suffix: "하자", primary: ["하다"], related: ["같이"], display: ["같이"] },
  { suffix: "가자", primary: ["가다"], related: ["같이"], display: ["같이"] },
  { suffix: "먹자", primary: ["먹다"], related: ["같이"], display: ["같이"] },
  { suffix: "가세요", primary: ["가다"], related: ["이동", "어디 가세요?"], display: ["가다"] },
  { suffix: "가시나요", primary: ["가다"], related: ["이동", "어디 가세요?"], display: ["가다"] },
  { suffix: "가십니까", primary: ["가다"], related: ["이동", "어디 가세요?"], display: ["가다"] },
  { suffix: "가요", primary: ["가다"], related: ["이동", "어디 가요?"], display: ["가다"] },
  { suffix: "주세요", related: ["주다", "부탁"], display: ["주세요"] },
  { suffix: "있나요", related: ["있다"], display: ["있다"] },
  { suffix: "있어요", related: ["있다"], display: ["있다"] },
  { suffix: "돼요", related: ["되다", "가능"], display: ["가능"] },
  { suffix: "되나요", related: ["되다", "가능"], display: ["가능"] },
];

const COMPACT_QUERY_SUFFIX_RULES = [
  { suffix: "더주세요", spaced: (root) => `${root} 더 주세요` },
  { suffix: "빼주세요", spaced: (root) => `${root} 빼 주세요` },
  { suffix: "바꿔주세요", spaced: (root) => `${root} 바꿔 주세요` },
  { suffix: "보여주세요", spaced: (root) => `${root} 보여 주세요` },
  { suffix: "가져와주세요", spaced: (root) => `${root} 가져와 주세요` },
  { suffix: "가져다주세요", spaced: (root) => `${root} 가져다 주세요` },
  { suffix: "가세요", spaced: (root) => `${root} 가세요` },
  { suffix: "가시나요", spaced: (root) => `${root} 가시나요` },
  { suffix: "가십니까", spaced: (root) => `${root} 가십니까` },
  { suffix: "가요", spaced: (root) => `${root} 가요` },
  { suffix: "주세요", spaced: (root) => `${root} 주세요` },
  { suffix: "있어요", spaced: (root) => `${root} 있어요` },
  { suffix: "있나요", spaced: (root) => `${root} 있나요` },
  { suffix: "없어요", spaced: (root) => `${root} 없어요` },
  { suffix: "필요해요", spaced: (root) => `${root} 필요해요` },
  { suffix: "어디에요", spaced: (root) => `${root} 어디에요` },
  { suffix: "어디예요", spaced: (root) => `${root} 어디예요` },
  { suffix: "안돼요", spaced: (root) => `${root} 안 돼요` },
  { suffix: "안되요", spaced: (root) => `${root} 안 돼요` },
  { suffix: "시작할게요", spaced: (root) => `${root} 시작할게요` },
  { suffix: "시작합니다", spaced: (root) => `${root} 시작합니다` },
  { suffix: "시작합시다", spaced: (root) => `${root} 시작합시다` },
  { suffix: "시작해요", spaced: (root) => `${root} 시작해요` },
  { suffix: "시작해", spaced: (root) => `${root} 시작해` },
  { suffix: "시작", spaced: (root) => `${root} 시작` },
];

const PREDICATE_QUERY_VARIANTS = {
  "오다": ["와", "와요", "오세요", "왔어요", "언제 와요?"],
  "오르다": ["올라가요", "올라가", "오르세요", "올랐어요"],
  "내려가다": ["내려가요", "내려가", "내려가세요"],
  "맞다": ["맞아요", "맞아", "맞나요"],
  "아니다": ["아니에요", "아니야", "아닙니다"],
  "어때요": ["어때요?", "어땠어요?"],
  "중요하다": ["중요해요", "아주 중요해요"],
  "중요하지 않아": ["중요하지 않아요", "안 중요해요"],
  "가능한": ["가능해요", "할 수 있어요", "가능할까요?"],
  "모르다": ["몰라요", "몰라", "잘 몰라요", "모르겠어요", "모른다"],
  "몰라요": ["모르다", "몰라", "잘 몰라요"],
  "알겠습니다": ["알겠어요", "알았어요"],
  "알겠습니다.": ["알겠어요", "알았어요"],
  "죄송합니다": ["죄송해요", "실례합니다"],
  "죄송합니다.": ["죄송해요", "실례합니다"],
  "침착해": ["침착하세요", "진정하세요", "진정해요"],
  "가끔": ["가끔 와요", "가끔 가요"],
  "자주": ["자주 와요", "자주 가요", "자주 써요"],
  "피다": ["피워요", "담배 피워요"],
  "맵다": ["매워요", "안 맵게 해 주세요", "덜 맵게 해 주세요"],
  "달다": ["달아요", "이 과일 달아요?"],
  "따뜻하다": ["따뜻해요"],
  "어렵다": ["어려워요", "어려워요?"],
  "춥다": ["추워요", "너무 추워요"],
  "좋아": ["좋아요", "좋아해요"],
  "안좋아": ["안 좋아요", "별로예요"],
  "싫어": ["싫어요", "원하지 않아요"],
  "축하": ["축하해요", "축하합니다"],
  "덥다": ["더워요", "너무 더워요"],
  "좋아한다": ["좋아해요", "마음에 들어요"],
  "누구": ["누구예요?", "누구세요?"],
  "어느": ["어느 거예요?", "어느 쪽이에요?"],
  "늦어요": ["늦었어요", "조금 늦어요"],
  "쉬다": ["쉬어요", "쉴게요", "쉬고 싶어요"],
  "사다": ["사요", "사고 싶어요", "어디서 사요?"],
  "공부하다": ["공부해요", "태국어 공부하고 있어요", "배워요"],
  "언어": ["무슨 언어예요?", "한국어", "영어"],
  "위험": ["위험해요", "위험하니까 조심하세요"],
  "시끄럽다": ["시끄러워요", "방이 시끄러워요", "이 방은 너무 시끄러워요"],
  "강하다": ["강해요"],
  "약하다": ["약해요"],
  "깨끗하다": ["깨끗해요"],
  "지저분하다": ["지저분해요", "더러워요"],
  "조용하다": ["조용해요", "조용한 방"],
  "아깝다": ["아까워요"],
  "유명하다": ["유명해요"],
  "친절하다": ["친절해요"],
  "불친절하다": ["불친절해요"],
  "쉽다": ["쉬워요"],
  "시원하다": ["시원해요"],
  "행복하다": ["행복해요"],
  "슬프다": ["슬퍼요"],
  "화나다": ["화나요"],
  "무섭다": ["무서워요"],
  "놀라다": ["놀랐어요"],
  "싱겁다": ["싱거워요"],
  "짜다": ["짜요"],
  "쓰다": ["써요"],
  "시다": ["셔요"],
  "부드럽다": ["부드러워요"],
  "딱딱하다": ["딱딱해요"],
  "높다": ["높아요"],
  "낮다": ["낮아요"],
  "길다": ["길어요"],
  "크다": ["커요"],
  "작다": ["작아요"],
  "몇시": ["몇 시", "지금 몇 시예요?", "현재 시간"],
  "몇시야": ["몇 시", "지금 몇 시예요?", "현재 시간"],
  "현금인출기": ["atm", "atm이 어디예요?", "현금 뽑고 싶어요"],
  "세탁소": ["세탁소가 어디예요?", "빨래방이 어디예요?", "빨래 맡기고 싶어요"],
};

function isLaundryShopOrMachineQuery(text) {
  return /(세탁소|빨래방|코인세탁|세탁기|건조기)/.test(normalizeText(text));
}

function isGenericLaundryQuery(text) {
  const normalized = normalizeText(text);
  if (!normalized || isLaundryShopOrMachineQuery(normalized)) return false;
  return normalized === "빨래" || normalized === "세탁" || /빨래해|세탁해|빨래맡기|세탁맡기|세탁실|세제/.test(normalized);
}

function expandLaundryVariants(item) {
  const normalized = normalizeText(item);
  if (!normalized) return [];

  const variants = [];
  if (normalized === "세탁") variants.push("빨래");
  if (normalized === "빨래") variants.push("세탁");
  if (/세탁해주세요/.test(normalized)) variants.push(normalized.replace(/세탁/g, "빨래"));
  if (/빨래해주세요/.test(normalized)) variants.push(normalized.replace(/빨래/g, "세탁"));
  if (/세탁맡기/.test(normalized)) variants.push(normalized.replace(/세탁/g, "빨래"));
  if (/빨래맡기/.test(normalized)) variants.push(normalized.replace(/빨래/g, "세탁"));
  return variants;
}

function isAtmSpecificQuery(text) {
  return /atm|현금인출기|현금\s*뽑는\s*기계/i.test(normalizeText(text));
}

function addBatchimToLastSyllable(text, jongseongIndex) {
  if (!text) return "";
  const chars = [...text];
  const last = chars.at(-1);
  if (!last) return "";
  const code = last.charCodeAt(0);
  const base = 0xac00;
  const end = 0xd7a3;
  if (code < base || code > end) return "";
  const syllableIndex = code - base;
  const currentJong = syllableIndex % 28;
  if (currentJong !== 0) return "";
  const leadVowel = Math.floor(syllableIndex / 28);
  const next = String.fromCharCode(base + leadVowel * 28 + jongseongIndex);
  chars[chars.length - 1] = next;
  return chars.join("");
}

function expandPredicateInflectionVariants(item) {
  const normalized = normalizeText(item);
  if (!normalized || /\s/.test(normalized)) return [];

  const variants = [];
  const bieupMatch = normalized.match(/^(.*?)(워요|워)$/);
  if (bieupMatch?.[1]) {
    const stem = addBatchimToLastSyllable(bieupMatch[1], 17);
    if (stem) variants.push(`${stem}다`);
  }

  const peuMatch = normalized.match(/^(.*?)(파요|파)$/);
  if (peuMatch?.[1]) {
    variants.push(`${peuMatch[1]}프다`);
  }

  const riMatch = normalized.match(/^(.*?)(려요|려)$/);
  if (riMatch?.[1]) {
    variants.push(`${riMatch[1]}리다`);
  }

  if (normalized === "써요" || normalized === "써") variants.push("쓰다");
  if (normalized === "셔요" || normalized === "셔") variants.push("시다");
  if (normalized === "커요" || normalized === "커") variants.push("크다");
  if (normalized === "화나요" || normalized === "화나") variants.push("화나다");

  return unique(variants);
}

const searchIndexCache = new WeakMap();
const searchRuntimeCache = new WeakMap();
const searchCollectionCacheIds = new WeakMap();
const searchComputationCache = new Map();
const thaiMeaningAnalysisCache = new Map();
let searchRuntimeWarmupQueued = false;
let searchRuntimeWarmupDone = false;
let nextSearchCollectionCacheId = 1;
const hydratedBaseData = createHydratedBaseData();
const hydratedBaseMergedEntries = [...hydratedBaseData.vocab, ...hydratedBaseData.sentences];
const mergedEntriesCache = {
  revision: -1,
  entries: hydratedBaseMergedEntries,
};

const state = {
  query: "",
  scenario: "all",
  selectedVocabId: null,
  revealedThaiIds: new Set(),
  menuOpen: false,
  searchFrame: 0,
  custom: loadCustomData(),
  aiSettings: loadAiSettings(),
  aiAssist: {
    status: "idle",
    query: "",
    error: "",
    result: null,
    requestId: 0,
    trigger: "manual",
  },
  customRevision: 0,
  lastSearchContext: null,
};

const elements = {
  menuButton: document.querySelector("#menuButton"),
  menuCloseButton: document.querySelector("#menuCloseButton"),
  menuOverlay: document.querySelector("#menuOverlay"),
  menuSheet: document.querySelector("#menuSheet"),
  searchForm: document.querySelector("#searchForm"),
  searchInput: document.querySelector("#searchInput"),
  searchButton: document.querySelector("#searchButton"),
  jumpVocabButton: document.querySelector("#jumpVocabButton"),
  jumpSentenceButton: document.querySelector("#jumpSentenceButton"),
  aiAssistButton: document.querySelector("#aiAssistButton"),
  resetFiltersButton: document.querySelector("#resetFiltersButton"),
  scenarioChips: document.querySelector("#scenarioChips"),
  quickSearchChips: document.querySelector("#quickSearchChips"),
  activeSummary: document.querySelector("#activeSummary"),
  searchStatus: document.querySelector("#searchStatus"),
  filterSummary: document.querySelector("#filterSummary"),
  queryInsightsPanel: document.querySelector("#queryInsightsPanel"),
  queryInsights: document.querySelector("#queryInsights"),
  aiAssistPanel: document.querySelector("#aiAssistPanel"),
  aiAssistMeta: document.querySelector("#aiAssistMeta"),
  aiAssistStatus: document.querySelector("#aiAssistStatus"),
  aiAssistResults: document.querySelector("#aiAssistResults"),
  resultStack: document.querySelector("#resultStack"),
  vocabSection: document.querySelector("#vocabSection"),
  sentenceSection: document.querySelector("#sentenceSection"),
  statsGrid: document.querySelector("#statsGrid"),
  datasetNote: document.querySelector("#datasetNote"),
  vocabResults: document.querySelector("#vocabResults"),
  sentenceResults: document.querySelector("#sentenceResults"),
  vocabMeta: document.querySelector("#vocabMeta"),
  sentenceMeta: document.querySelector("#sentenceMeta"),
  entryForm: document.querySelector("#entryForm"),
  saveFeedback: document.querySelector("#saveFeedback"),
  exportButton: document.querySelector("#exportButton"),
  importButton: document.querySelector("#importButton"),
  importInput: document.querySelector("#importInput"),
  clearCustomButton: document.querySelector("#clearCustomButton"),
  customSummary: document.querySelector("#customSummary"),
  customEntries: document.querySelector("#customEntries"),
  aiSettingsForm: document.querySelector("#aiSettingsForm"),
  aiEnabledInput: document.querySelector("#aiEnabledInput"),
  aiModeInput: document.querySelector("#aiModeInput"),
  aiEndpointInput: document.querySelector("#aiEndpointInput"),
  aiTokenInput: document.querySelector("#aiTokenInput"),
  aiSettingsFeedback: document.querySelector("#aiSettingsFeedback"),
};

function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    query: "",
    scenario: String(params.get("scenario") || "all").trim(),
  };
}

function syncUrl() {
  if (!window.location.protocol.startsWith("http")) return;
  const params = new URLSearchParams();
  if (state.scenario !== "all") params.set("scenario", state.scenario);
  const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
  window.history.replaceState({}, "", nextUrl);
}

function normalizeText(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/잘돗/g, "잘못")
    .replace(/쥬스/g, "주스")
    .replace(/앤드밀/g, "엔드밀")
    .replace(/이에요/g, "예요")
    .replace(/에요/g, "예요")
    .replace(/예여/g, "예요")
    .replace(/해주세여/g, "해주세요")
    .replace(/먹으로/g, "먹으러")
    .replace(/밥먹으로/g, "밥먹으러")
    .replace(/배가\s*고파요/g, "배고프다")
    .replace(/배가\s*고파/g, "배고프다")
    .replace(/배고파요/g, "배고프다")
    .replace(/배고파/g, "배고프다")
    .replace(/시장해요/g, "배고프다")
    .replace(/시장해/g, "배고프다")
    .replace(/안되요/g, "안 돼요")
    .replace(/안되냐/g, "안 되냐")
    .replace(/안되네/g, "안 되네")
    .replace(/카드키안돼요/g, "카드키가 안 돼요")
    .replace(/카드키안되요/g, "카드키가 안 돼요")
    .replace(/냉장고안돼요/g, "냉장고가 안 돼요")
    .replace(/냉장고안되요/g, "냉장고가 안 돼요")
    .replace(/얼음좀주세요/g, "얼음 주세요")
    .replace(/얼음주세요/g, "얼음 주세요")
    .replace(/문제있습니다/g, "문제가 있어요")
    .replace(/문제있어요/g, "문제가 있어요")
    .replace(/문제있어/g, "문제가 있어요")
    .replace(/잘못되었어요/g, "잘못")
    .replace(/잘못됐어요/g, "잘못")
    .replace(/잘못되었습니다/g, "잘못")
    .replace(/잘못됐습니다/g, "잘못")
    .replace(/잘못되었어/g, "잘못")
    .replace(/잘못됐어/g, "잘못")
    .replace(/잘못된거예요/g, "잘못")
    .replace(/잘못된거야/g, "잘못")
    .replace(/잘못된 거예요/g, "잘못")
    .replace(/잘못된 거야/g, "잘못")
    .replace(/틀렸어요/g, "틀리다")
    .replace(/틀렸습니다/g, "틀리다")
    .replace(/틀렸어/g, "틀리다")
    .replace(/틀린거예요/g, "틀리다")
    .replace(/틀린거야/g, "틀리다")
    .replace(/틀린 거예요/g, "틀리다")
    .replace(/틀린 거야/g, "틀리다")
    .replace(/모릅니다/g, "모르다")
    .replace(/모른다/g, "모르다")
    .replace(/모르겠어요/g, "모르다")
    .replace(/모르겠어/g, "모르다")
    .replace(/잘몰라요/g, "모르다")
    .replace(/잘 몰라요/g, "모르다")
    .replace(/잘몰라/g, "모르다")
    .replace(/잘 몰라/g, "모르다")
    .replace(/몰라요/g, "모르다")
    .replace(/(^|\s)몰라(?=$|\s)/g, "$1모르다")
    .replace(/이쁘/g, "예쁘")
    .replace(/깍/g, "깎")
    .replace(/더워요/g, "덥다")
    .replace(/더워/g, "덥다")
    .replace(/한가해요/g, "한가하다")
    .replace(/한가해/g, "한가하다")
    .replace(/잘하고있어요/g, "잘하다")
    .replace(/잘하고있어/g, "잘하다")
    .replace(/잘하고있네/g, "잘하다")
    .replace(/잘 하고 있어요/g, "잘하다")
    .replace(/잘 하고 있어/g, "잘하다")
    .replace(/예뻐요/g, "예쁘다")
    .replace(/예뻐/g, "예쁘다")
    .replace(/이쁘다/g, "예쁘다")
    .replace(/이뻐요/g, "예쁘다")
    .replace(/이뻐/g, "예쁘다")
    .replace(/귀여워요/g, "귀엽다")
    .replace(/귀여워/g, "귀엽다")
    .replace(/멋있어요/g, "멋있다")
    .replace(/멋있어/g, "멋있다")
    .replace(/괜찮아요/g, "괜찮다")
    .replace(/괜찮아/g, "괜찮다")
    .replace(/배불러요/g, "배부르다")
    .replace(/배불러/g, "배부르다")
    .replace(/졸려요/g, "졸리다")
    .replace(/졸려/g, "졸리다")
    .replace(/힘들어요/g, "힘들다")
    .replace(/힘들어/g, "힘들다")
    .replace(/무거워요/g, "무겁다")
    .replace(/무거워/g, "무겁다")
    .replace(/가벼워요/g, "가볍다")
    .replace(/가벼워/g, "가볍다")
    .replace(/비싸요/g, "비싸다")
    .replace(/(^|\\s)비싸(?=$|\\s)/g, "$1비싸다")
    .replace(/(^|\\s)싸요(?=$|\\s)/g, "$1싸다")
    .replace(/뜨거워요/g, "뜨겁다")
    .replace(/뜨거워/g, "뜨겁다")
    .replace(/차가워요/g, "차갑다")
    .replace(/차가워/g, "차갑다")
    .replace(/안전해요/g, "안전하다")
    .replace(/안전해/g, "안전하다")
    .replace(/위험해요/g, "위험하다")
    .replace(/위험해/g, "위험하다")
    .replace(/잘생겼어요/g, "잘생겼다")
    .replace(/잘생겼어/g, "잘생겼다")
    .replace(/깎아줘요/g, "깎다")
    .replace(/깎아줘/g, "깎다")
    .replace(/깍아줘요/g, "깎다")
    .replace(/깍아줘/g, "깎다")
    .replace(/완성됐어요/g, "완성")
    .replace(/완성됐어/g, "완성")
    .replace(/완성됐네/g, "완성")
    .replace(/완료됐어요/g, "완성")
    .replace(/완료됐어/g, "완성")
    .replace(/거의 다 됐어요/g, "완성")
    .replace(/거의 다 됐어/g, "완성")
    .replace(/거의다됐어요/g, "완성")
    .replace(/거의다됐어/g, "완성")
    .replace(/큰일났어요/g, "큰일이다")
    .replace(/큰일났어/g, "큰일이다")
    .replace(/큰일났네/g, "큰일이다")
    .replace(/큰일난다/g, "큰일이다")
    .replace(/줄었어요/g, "줄다")
    .replace(/줄었다/g, "줄다")
    .replace(/바빠요/g, "바쁘다")
    .replace(/바빠/g, "바쁘다")
    .replace(/시원해요/g, "시원하다")
    .replace(/시원해/g, "시원하다")
    .replace(/심각해요/g, "심각하다")
    .replace(/심각해/g, "심각하다")
    .replace(/좋아요/g, "좋다")
    .replace(/나빠요/g, "나쁘다")
    .replace(/나빠/g, "나쁘다")
    .replace(/편해요/g, "편하다")
    .replace(/편해/g, "편하다")
    .replace(/불편해요/g, "불편하다")
    .replace(/불편해/g, "불편하다")
    .replace(/넓어요/g, "넓다")
    .replace(/넓어/g, "넓다")
    .replace(/좁아요/g, "좁다")
    .replace(/좁아/g, "좁다")
    .replace(/멀어요/g, "멀다")
    .replace(/멀어/g, "멀다")
    .replace(/가까워요/g, "가깝다")
    .replace(/가까워/g, "가깝다")
    .replace(/빨라요/g, "빠르다")
    .replace(/빨라/g, "빠르다")
    .replace(/느려요/g, "느리다")
    .replace(/느려/g, "느리다")
    .replace(/시끄러워요/g, "시끄럽다")
    .replace(/시끄러워/g, "시끄럽다")
    .replace(/조용해요/g, "조용하다")
    .replace(/조용해/g, "조용하다")
    .replace(/더러워요/g, "더럽다")
    .replace(/더러워/g, "더럽다")
    .replace(/냄새나요/g, "냄새")
    .replace(/냄새나/g, "냄새")
    .replace(/뭐에요/g, "뭐예요")
    .replace(/[“”"'`’]/g, "")
    .replace(/\s+/g, " ");
}

function compactText(text) {
  return normalizeText(text).replace(/[^0-9a-zA-Z가-힣\u0E00-\u0E7F]+/g, "");
}

function detectQueryDirection(text) {
  const value = String(text || "");
  const hasThai = /[\u0E00-\u0E7F]/.test(value);
  const hasKorean = /[가-힣]/.test(value);

  if (hasThai && !hasKorean) return "thai";
  if (hasKorean && !hasThai) return "korean";
  if (hasThai && hasKorean) return "mixed";
  return "other";
}

function isThaiOnlySearch(searchProfile) {
  return searchProfile?.queryDirection === "thai";
}

function normalizeThaiMeaningQuery(text) {
  return normalizeText(text)
    .replace(/นะครับ|นะคะ/g, " ")
    .replace(/ครับ|ค่ะ|คะ/g, " ")
    .replace(/หน่อย/g, " ")
    .replace(/ผม|ฉัน|ดิฉัน/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isThaiMeaningStopword(term) {
  const compact = compactText(term);
  if (!compact) return true;
  return THAI_MEANING_STOPWORD_TEXTS.some((item) => compactText(item) === compact);
}

function findThaiDemonstrativeMeaning(text) {
  const compact = compactText(text);
  if (!compact) return null;
  return (
    THAI_DEMONSTRATIVE_MEANINGS.find((item) =>
      item.matches.some((match) => compact.includes(compactText(match)))
    ) || null
  );
}

function detectThaiMeaningIntentIds(text) {
  const compact = compactText(text);
  if (!compact) return [];
  return THAI_MEANING_INTENT_RULES.filter((rule) =>
    rule.matches.some((match) => compact.includes(compactText(match)))
  ).map((rule) => rule.id);
}

function tokenize(text) {
  return normalizeText(text)
    .split(/[\s,./()!?+\-:;]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => token.length > 1 || !STOPWORDS.has(token));
}

const thaiScriptOverrideMap = new Map(
  THAI_SCRIPT_OVERRIDE_PAIRS.map(([key, value]) => [compactText(key), value])
);

function getThaiScriptOverride(entry) {
  return thaiScriptOverrideMap.get(compactText(entry.korean)) || "";
}

function isStrongAnchorTerm(term) {
  const compact = compactText(term);
  if (!compact) return false;
  if (compact.length < 2 && !SINGLE_SYLLABLE_ANCHORS.has(compact)) return false;
  if (GENERIC_ANCHOR_TERMS.has(compact)) return false;
  return !/(?:해주세요|해주세여|해줘요|해줘|해요|했어요|했어|하자|가자|먹자|갈래|볼래|주세요|주세여|줘요|줘|있어요|있나요|없어요|없나요|어디예요|어디에요|어디야|몇시예요|몇시에요|몇시야|예요|에요|인가요|나요|니|냐|하다)$/u.test(
    compact
  );
}

function matchesSearchRule(rule, patternTexts) {
  return (rule.patterns || []).some((pattern) => patternTexts.some((text) => pattern.test(text)));
}

function resolveIntentPhrase(phrase, objectLabel = "") {
  if (!phrase) return "";
  const resolved = phrase.includes("{object}")
    ? phrase.replace(/\{object\}/g, objectLabel || "").replace(/\s+/g, " ").trim()
    : phrase;
  return normalizeText(resolved);
}

function getEntrySourceScore(entry, kind) {
  const sourceScore = ENTRY_SOURCE_SCORES[entry.source] ?? 0;
  if (entry.source === "generated-bulk" && kind === "sentence") {
    return sourceScore - 30;
  }
  return sourceScore;
}

function isGeneratedBulkTemplateEntry(entry) {
  if (entry.source !== "generated-bulk") return false;
  const korean = normalizeText(entry.korean);
  return GENERATED_BULK_PREFIX_REGEX.test(korean) || GENERATED_BULK_ENDING_REGEX.test(korean);
}

function isSentenceLikeVocabEntry(entry) {
  if (entry.kind !== "vocab") return false;
  const korean = normalizeText(entry.korean);
  if (!korean) return false;
  if (VOCAB_SENTENCE_LIKE_REGEX.test(korean)) return true;
  const tokenCount = tokenize(korean).length;
  return tokenCount >= 3 && /\s/.test(korean) && /(?:있|없|해|가|돼|나와|잠겨|문제)/u.test(korean);
}

function isUtilityLabelVocabEntry(entry) {
  if (entry.kind !== "vocab") return false;
  const korean = normalizeText(entry.korean);
  if (!korean) return false;
  return VOCAB_GENERIC_LABEL_REGEX.test(korean);
}

function getStructuredFieldMatchStrength(index, term, options = {}) {
  const allowSupportContains = options.allowSupportContains ?? false;
  const strongFields = [index.korean, index.thai, index.thaiScript];
  const supportFields = [index.note, ...index.keywords];
  let best = 0;

  strongFields.forEach((field) => {
    if (!field || !term) return;
    if (field === term) {
      best = Math.max(best, 6);
      return;
    }
    if (term.length === 1 && field.startsWith(term)) {
      best = Math.max(best, 3);
      return;
    }
    if (term.length >= 2 && field.startsWith(term)) {
      best = Math.max(best, 5);
      return;
    }
    if (term.length >= 2 && field.includes(term)) {
      best = Math.max(best, 4);
    }
  });

  supportFields.forEach((field) => {
    if (!field || !term) return;
    if (field === term) {
      best = Math.max(best, 3);
      return;
    }
    if (term.length >= 2 && field.startsWith(term)) {
      best = Math.max(best, 2);
      return;
    }
    if (allowSupportContains && term.length >= 3 && field.includes(term)) {
      best = Math.max(best, 1);
    }
  });

  return best;
}

function buildIntentHints(query, patternTexts) {
  let objectRules = SEARCH_OBJECT_RULES.filter((rule) => matchesSearchRule(rule, patternTexts));
  if (objectRules.some((rule) => rule.id === "education")) {
    objectRules = objectRules.filter((rule) => !["workTask", "machine", "factoryWork", "problem"].includes(rule.id));
  }
  if (objectRules.some((rule) => rule.id === "machineNoise")) {
    objectRules = objectRules.filter((rule) => !["noise", "problem"].includes(rule.id));
  }
  if (objectRules.some((rule) => rule.id === "computer")) {
    objectRules = objectRules.filter((rule) => !["machine", "problem"].includes(rule.id));
  }
  if (objectRules.some((rule) => rule.id === "factoryWork")) {
    objectRules = objectRules.filter((rule) => rule.id !== "machine");
  }
  if (objectRules.some((rule) => rule.id === "internetIssue")) {
    objectRules = objectRules.filter((rule) => rule.id !== "problem");
  }
  if (objectRules.some((rule) => rule.id === "wetTissue")) {
    objectRules = objectRules.filter((rule) => !["water", "tissue"].includes(rule.id));
  }
  if (objectRules.some((rule) => rule.id === "gift")) {
    objectRules = objectRules.filter((rule) => !["water", "juice", "fruit"].includes(rule.id));
  }
  if (objectRules.some((rule) => rule.id === "giftBag")) {
    objectRules = objectRules.filter((rule) => rule.id !== "gift");
  }
  if (objectRules.some((rule) => rule.id === "trashCan")) {
    objectRules = objectRules.filter((rule) => rule.id !== "tissue");
  }
  if (objectRules.some((rule) => rule.id === "powerBank")) {
    objectRules = objectRules.filter((rule) => rule.id !== "computer");
  }
  if (objectRules.some((rule) => rule.id === "laundryMachine" || rule.id === "laundryShop")) {
    objectRules = objectRules.filter((rule) => rule.id !== "laundry");
  }
  if (objectRules.some((rule) => rule.id === "message" || rule.id === "phoneCall")) {
    objectRules = objectRules.filter((rule) => rule.id !== "phone");
  }
  const actionRules = SEARCH_ACTION_RULES.filter((rule) => matchesSearchRule(rule, patternTexts));
  const nonGenericActionRules = actionRules.filter((rule) => !["request", "exist"].includes(rule.id));
  const actionTermRules = actionRules.filter((rule) => {
    if (rule.id === "request" || rule.id === "exist") {
      return !nonGenericActionRules.length;
    }
    return true;
  });
  const objectLabels = unique(
    objectRules
      .flatMap((rule) => (rule.display && rule.display.length ? rule.display : rule.terms || []))
      .map((item) => normalizeText(item))
      .filter(Boolean)
  ).slice(0, 3);
  const phrases = [];

  objectRules.forEach((rule) => {
    (rule.phrases || []).forEach((phrase) => {
      if (phrase.includes("{object}") && objectLabels.length) {
        objectLabels.forEach((label) => phrases.push(resolveIntentPhrase(phrase, label)));
        return;
      }
      phrases.push(resolveIntentPhrase(phrase));
    });
  });

  actionRules.forEach((rule) => {
    (rule.phrases || []).forEach((phrase) => {
      if (phrase.includes("{object}") && objectLabels.length) {
        objectLabels.forEach((label) => phrases.push(resolveIntentPhrase(phrase, label)));
        return;
      }
      if (!phrase.includes("{object}")) {
        phrases.push(resolveIntentPhrase(phrase));
      }
    });
  });

  if (objectLabels.length) {
    const actionIds = new Set(actionRules.map((rule) => rule.id));
    if (actionIds.has("where")) {
      objectLabels.forEach((label) => {
        phrases.push(resolveIntentPhrase("{object} 어디예요?", label));
        phrases.push(resolveIntentPhrase("{object} 어디에요?", label));
      });
    }
    if (actionIds.has("go")) {
      objectLabels.forEach((label) => {
        phrases.push(resolveIntentPhrase("{object} 가고 싶어요", label));
        phrases.push(resolveIntentPhrase("{object} 가야 해요", label));
        phrases.push(resolveIntentPhrase("{object} 가요", label));
      });
    }
    if (actionIds.has("bring")) {
      objectLabels.forEach((label) => {
        phrases.push(resolveIntentPhrase("{object} 가져와 주세요", label));
        phrases.push(resolveIntentPhrase("{object} 가져다 주세요", label));
      });
    }
    if (actionIds.has("change")) {
      objectLabels.forEach((label) => phrases.push(resolveIntentPhrase("{object} 바꿔 주세요", label)));
    }
    if (actionIds.has("show")) {
      objectLabels.forEach((label) => phrases.push(resolveIntentPhrase("{object} 보여주세요", label)));
    }
    if (actionIds.has("request")) {
      objectLabels.forEach((label) => phrases.push(resolveIntentPhrase("{object} 주세요", label)));
    }
    if (objectRules.some((rule) => rule.id === "meal") && (actionIds.has("go") || actionIds.has("eat"))) {
      phrases.push("점심 먹으러 가자", "점심 먹으러 갈래요?", "밥 먹으러 가자");
    }
  }

  const actionIds = new Set(actionRules.map((rule) => rule.id));
  if (!objectLabels.length && actionIds.has("where")) {
    phrases.push("어디예요?", "어디에요?", "어디에 있어요?");
    if (actionIds.has("go")) {
      phrases.push("어디 가요?", "어디 가세요?", "어디로 가요?", "어디로 가세요?");
    }
  }

  return {
    objectIds: unique(objectRules.map((rule) => rule.id)),
    actionIds: unique(actionRules.map((rule) => rule.id)),
    objectTerms: unique(
      objectRules.flatMap((rule) => (rule.focusTerms && rule.focusTerms.length ? rule.focusTerms : rule.display?.length ? rule.display : (rule.terms || []).slice(0, 1)))
    ),
    actionTerms: unique(
      actionTermRules.flatMap((rule) => (rule.focusTerms && rule.focusTerms.length ? rule.focusTerms : (rule.terms || []).slice(0, 3)))
    ),
    primaryTerms: unique([
      ...objectRules.flatMap((rule) => rule.terms || []),
      ...actionRules.flatMap((rule) => rule.terms || []),
    ]),
    relatedTerms: unique([
      ...objectRules.flatMap((rule) => rule.related || []),
      ...actionRules.flatMap((rule) => rule.related || []),
      ...phrases,
    ]),
    templateTerms: unique(phrases),
    displayTerms: unique([
      ...objectRules.flatMap((rule) => rule.display || []),
      ...actionRules.flatMap((rule) => rule.display || []),
    ]),
    tags: unique([
      ...objectRules.flatMap((rule) => rule.tags || []),
      ...actionRules.flatMap((rule) => rule.tags || []),
    ]),
    preferredTags: unique([
      ...objectRules.flatMap((rule) => rule.preferTags || []),
      ...actionRules.flatMap((rule) => rule.preferTags || []),
    ]),
    avoidTags: unique([
      ...objectRules.flatMap((rule) => rule.avoidTags || []),
      ...actionRules.flatMap((rule) => rule.avoidTags || []),
    ]),
    blockedTerms: unique([
      ...objectRules.flatMap((rule) => rule.blockedTerms || []),
      ...actionRules.flatMap((rule) => rule.blockedTerms || []),
    ]),
  };
}

function collectIntentDrivenVariants(text) {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  // Keep query expansion aligned with the same intent tables used for scoring.
  const patternTexts = unique([normalized, ...expandCompactPhraseVariants(normalized)]);
  const hints = buildIntentHints(normalized, patternTexts);
  const hasActionIntent = Boolean(hints.actionIds?.length);
  const multiTokenQuery = tokenize(normalized).length >= 2;
  const phraseLevelVariants = hasActionIntent || multiTokenQuery;
  return unique([
    ...(hints.objectTerms || []),
    ...(hints.actionTerms || []),
    ...(hints.primaryTerms || []),
    ...(hints.displayTerms || []),
    ...(phraseLevelVariants ? hints.relatedTerms || [] : []),
    ...(phraseLevelVariants ? hints.templateTerms || [] : []),
  ]).filter(Boolean);
}

function filterExpandedQuestionVariants(baseQuery, variants = []) {
  const normalizedBase = compactText(baseQuery);
  const explicitWhere = /어디|어디예요|어디에요|어딘지|어디야|어디로|어디서|어딨어|어디있/.test(normalizedBase);
  const explicitPrice = /얼마|가격|요금|비용|비싸|깎|깍|할인/.test(normalizedBase);
  const explicitBuy = /사요|사다|구매|팔아요/.test(normalizedBase);

  return unique(
    variants
      .map((item) => normalizeText(item))
      .filter(Boolean)
      .filter((item) => {
        const compactItem = compactText(item);
        if (
          !explicitWhere &&
          /어디예요|어디에요|어디에있어요|어디가요|어디가세요|어디로가요|어디로가세요|어디서사요|어디서내요|어디계세요/.test(
            compactItem
          )
        ) {
          return false;
        }
        if (!explicitPrice && !explicitBuy && /얼마예요|얼마에요/.test(compactItem)) {
          return false;
        }
        return true;
      })
  );
}

function extractCompactPhraseRoots(item) {
  const normalized = normalizeText(item);
  if (!normalized || /\s/.test(normalized) || normalized.length < 4) return [];

  const roots = [];
  COMPACT_QUERY_SUFFIX_RULES.forEach((rule) => {
    if (!normalized.endsWith(rule.suffix)) return;
    const root = normalized.slice(0, -rule.suffix.length).trim();
    if (!root || root.length < 1) return;
    roots.push(root);
  });

  return unique(roots);
}

function expandCompactPhraseVariants(item) {
  const roots = extractCompactPhraseRoots(item);
  const variants = [];
  roots.forEach((root) => {
    COMPACT_QUERY_SUFFIX_RULES.forEach((rule) => {
      if (!normalizeText(item).endsWith(rule.suffix)) return;
      variants.push(rule.spaced(root), root);
    });
  });
  return variants;
}

function expandQueryVariants(query, rawTokens = []) {
  const variants = [];
  const candidates = [query, ...rawTokens].map((item) => normalizeText(item)).filter(Boolean);
  const normalizedQuery = normalizeText(query);
  const machineNoiseQuery =
    /(기계|장비|설비|라인|공장|작업)/.test(normalizedQuery) && /시끄럽|소음/.test(normalizedQuery);
  const phoneChargeQuery =
    /(휴대폰|핸드폰|스마트폰|폰)/.test(normalizedQuery) && /충전|배터리/.test(normalizedQuery);
  const verbLikePatterns = [
    /^(.*)해$/,
    /^(.*)해요$/,
    /^(.*)해줘$/,
    /^(.*)해줘요$/,
    /^(.*)해주세요$/,
    /^(.*)해라$/,
    /^(.*)합니다$/,
    /^(.*)하자$/,
    /^(.*)가자$/,
    /^(.*)먹자$/,
    /^(.*)했어요$/,
    /^(.*)했어$/,
  ];

  candidates.forEach((item) => {
    variants.push(item);
    variants.push(...expandCompactPhraseVariants(item));
    if (PREDICATE_QUERY_VARIANTS[item]) {
      variants.push(...PREDICATE_QUERY_VARIANTS[item]);
    }
    variants.push(...expandPredicateInflectionVariants(item));
    variants.push(...collectIntentDrivenVariants(item));
    if (/하다$/.test(item)) {
      const stem = item.slice(0, -2);
      if (stem) {
        variants.push(`${stem}해`, `${stem}해요`, `${stem}합니다`, `${stem}했어요`);
      }
    }
    variants.push(...expandLaundryVariants(item));
    if (item.includes("주스")) variants.push(item.replace(/주스/g, "쥬스"));
    if (item.includes("먹으로")) variants.push(item.replace(/먹으로/g, "먹으러"));
    if (/선물포장/.test(item)) {
      variants.push("선물 포장", "선물 포장해 주세요", "선물 포장 돼요?", "선물용", "포장");
    }
    if (/선물세트|선물셋트|기프트세트/.test(item)) {
      variants.push("선물세트", "선물세트 있어요?", "선물용", "선물", "기념품");
    }
    if (/선물용/.test(item)) {
      variants.push("선물용", "선물", "선물 포장", "선물용으로 괜찮아요");
    }
    if (/쇼핑백|선물가방/.test(item)) {
      variants.push("쇼핑백", "쇼핑백도 같이 주세요", "봉투", "선물");
    }
    if (/말린망고|망고선물/.test(item)) {
      variants.push("말린 망고", "말린 망고 선물용으로 좋아요?", "선물", "기념품");
    }
    if (/기념품가게|선물가게/.test(item)) {
      variants.push("기념품 가게", "기념품", "선물", "기념품 가게가 어디예요?");
    }
    if (/선물사러왔|선물사러와/.test(item)) {
      variants.push("선물 사러 왔어요", "선물", "기념품", "사다");
    }
    if (/선물로줄|선물로드릴|선물할거|선물로살/.test(item)) {
      variants.push("선물로 살 거예요", "선물로 줄 거예요", "선물", "주다", "사다");
    }
    if (/선물추천|기념품추천/.test(item)) {
      variants.push("선물 추천해 주세요", "선물", "기념품");
    }
    if (/친구선물|가족선물/.test(item)) {
      variants.push("친구 줄 선물 있어요?", "가족 줄 선물 있어요?", "선물", "기념품");
    }
    if (/선물|기념품/.test(item) && !/쇼핑백|선물가방|선물봉투/.test(item)) {
      variants.push(
        "선물",
        "기념품",
        "선물용",
        "선물 포장",
        "선물 추천해 주세요",
        "선물 사러 왔어요",
        "선물로 살 거예요",
        "이건 선물이에요",
        "기념품 가게가 어디예요?"
      );
    }
    if (/급해|급해요|급합니다|급한데|급하니까/.test(item)) {
      variants.push("급하다", "급해요", "빨리", "서둘러");
    }
    if (isGenericLaundryQuery(item)) {
      variants.push("빨래", "세탁", "세탁실", "세제", "빨래 맡기고 싶어요");
    }
    if (/세탁소|빨래방|코인세탁/.test(item)) {
      variants.push("세탁소", "빨래방", "세탁소가 어디예요?", "빨래방이 어디예요?", "빨래 맡기고 싶어요");
    }
    if (/세탁기|건조기/.test(item)) {
      variants.push("세탁기", "건조기", "세탁기 어디에요?", "건조기 있어요?", "세탁기 쓰고 싶어요");
    }
    if (/주스|쥬스/.test(item)) {
      variants.push("음료", "과일", "물");
    }
    if (machineNoiseQuery && /시끄럽|소음/.test(item)) {
      variants.push("기계", "기계 소음", "기계가 너무 시끄러워요", "기계 소음이 심해요", "기계를 확인해 주세요");
    } else if (/시끄럽|소음/.test(item)) {
      variants.push("시끄러워요", "소음", "방이 시끄러워요", "이 방은 너무 시끄러워요");
    }
    if (/조용하/.test(item)) {
      variants.push("조용한 방", "소음 없는 방", "방");
    }
    if (/냄새|더럽|지저분|청소/.test(item)) {
      variants.push("냄새", "방에서 냄새가 나요", "청소", "청소해 주세요");
    }
    if (/에어컨|냉방/.test(item)) {
      variants.push("에어컨", "에어컨이 안 시원해요", "에어컨이 너무 추워요", "에어컨이 너무 더워요");
    }
    if (/온수|뜨거운물|뜨거운 물/.test(item)) {
      variants.push("온수", "뜨거운 물", "온수가 안 나와요");
    }
    if (/문안잠|문 안 잠|도어락|잠기/.test(item)) {
      variants.push("문이 안 잠겨요", "문제", "문");
    }
    if (/와이파이|wifi|인터넷/.test(item) && /느리|안돼|안 돼|비번|비밀번호|연결|끊/.test(item)) {
      variants.push(
        "와이파이",
        "인터넷",
        "와이파이 비밀번호",
        "와이파이가 안 돼요",
        "인터넷이 안 돼요",
        "와이파이가 너무 느려요",
        "인터넷이 너무 느려요"
      );
    }
    if (/수건/.test(item)) {
      variants.push("수건", "수건 두 장 더 주세요");
    }
    if (/휴지|화장지|티슈/.test(item)) {
      variants.push("휴지", "화장지", "휴지 더 주세요");
    }
    if (/충전기|차저|charger|어댑터|콘센트/.test(item)) {
      variants.push("충전기", "어댑터", "콘센트", "충전기 있어요?");
    }
    if (/컴퓨터|노트북|랩탑|pc|피시/.test(item)) {
      variants.push("컴퓨터", "노트북", "컴퓨터가 안 돼요", "노트북이 안 켜져요", "컴퓨터를 확인해 주세요");
    }
    if (phoneChargeQuery || (/(휴대폰|핸드폰|스마트폰|폰)/.test(item) && /충전|배터리/.test(item))) {
      variants.push(
        "휴대폰",
        "충전기",
        "보조배터리",
        "휴대폰 충전할 수 있어요?",
        "휴대폰 충전이 안 돼요",
        "배터리가 없어요"
      );
    }
    if (/컴퓨터|노트북|랩탑|pc|피시|화면|마우스|키보드|프린터|배터리|전원/.test(item)) {
      variants.push(
        "화면이 안 나와요",
        "마우스가 안 돼요",
        "키보드가 안 돼요",
        "프린터가 안 돼요",
        "충전이 안 돼요",
        "전원이 안 들어와요"
      );
    }
    if (/잘하|잘했|대단|훌륭|고생/.test(item)) {
      variants.push("잘하다", "잘하고 있어요", "잘했어요", "대단해요", "고생 많았어요");
    }
    if (/담배|흡연|금연|라이터|재떨이|전자담배/.test(item)) {
      variants.push("담배", "담배 피우다", "담배 피워도 돼요?", "흡연실", "금연 구역", "라이터 있어요?", "재떨이 있어요?");
    }
    if (/예쁘|이쁘|예뻐|이뻐|귀엽|멋있|잘생겼/.test(item)) {
      variants.push("예쁘다", "예뻐요", "정말 예뻐요", "귀여워요", "멋있어요", "잘생겼어요");
    }
    if (isAtmSpecificQuery(item)) {
      variants.push("atm", "atm이 어디예요?", "현금 뽑고 싶어요");
    } else if (/동전|잔돈|거스름|지폐|현금|지갑/.test(item)) {
      variants.push("동전", "잔돈", "현금", "지폐", "동전 있어요?", "잔돈 있어요?", "거스름돈 주세요", "현금 돼요?");
    }
    if (/주식|주가|주식시장|stock|투자|은행|계좌/.test(item)) {
      variants.push("주식", "주식 투자", "주식을 사요", "저는 주식에 투자해요", "은행이 어디예요?");
    }
    if (/옷.*줄|옷줄|작아졌|줄어들|꽉끼|꽉 끼|사이즈|짧아|길어/.test(item)) {
      variants.push("옷", "줄다", "옷이 줄었어요", "이 옷이 작아졌어요", "너무 꽉 껴요", "더 큰 사이즈 있어요?", "더 작은 사이즈 있어요?");
    }
    if (/덥|더워|더운|시원|선풍기/.test(item)) {
      variants.push("덥다", "더워요", "오늘 너무 더워요", "이 방은 너무 더워요", "선풍기 켜 주세요", "시원한 방 있나요?");
    }
    if (/깎|깍|할인|비싸|싸게|흥정/.test(item)) {
      variants.push("깎다", "깎아주세요", "조금만 더 깎아주세요", "너무 비싸요", "더 싸게 해 주세요", "할인돼요?");
    }
    if (/완성|완료|끝났|다끝|다 끝|마무리|거의다|거의 다|곧끝|금방끝/.test(item)) {
      variants.push("완성", "완성됐어요", "다 끝났어요", "아직 안 끝났어요", "거의 다 됐어요", "곧 끝나요");
    }
    if (/한가|안바빠|안 바빠|시간있|시간 있어|바빠/.test(item)) {
      variants.push("한가하다", "바쁘다", "지금 한가해요?", "지금 안 바빠요", "지금 바빠요");
    }
    if (/큰일|심각|난감|곤란|망했/.test(item)) {
      variants.push("큰일", "큰일 났어요", "이거 큰일이에요", "문제가 커요", "생각보다 심각해요");
    }
    if (/배고프|허기|시장해/.test(item)) {
      variants.push("배고프다", "배고파요", "밥", "먹다", "식당");
    }
    if (/기계|장비|라인|공장|설비|현장/.test(item)) {
      variants.push("기계", "작동", "가동", "시작하다", "멈추다");
    }
    if (/교육|훈련|트레이닝|오리엔테이션|안전교육|입사교육|수업/.test(item)) {
      variants.push("교육", "훈련", "오리엔테이션", "교육 시작", "교육 시작합시다", "교육 언제 시작해요?");
    }
    if (/업무|작업|회의|미팅|업무시작|작업시작|회의시작/.test(item)) {
      variants.push("업무", "작업", "회의", "업무 시작", "업무 시작합시다", "작업 시작할게요", "회의 시작합시다");
    }
    if (/공장|생산라인|자재|불량품|작업복|안전화/.test(item)) {
      variants.push("공장", "생산라인", "자재", "불량품", "작업복", "안전화", "자재가 부족해요", "이거 불량품이에요", "안전화를 신어야 해요");
    }
    if (/급여명세서|월급명세서/.test(item)) {
      variants.push("급여명세서", "월급", "급여", "급여명세서 확인해 주세요");
    }
    if (/급여|월급|임금|시급|일당|수당|월급날|오티|ot/.test(item)) {
      variants.push("월급", "급여", "급여명세서", "월급이 아직 안 들어왔어요", "월급날이 언제예요?", "초과근무");
    }
    if (/인사팀|인사부|관리자|매니저|반장|라인반장|팀장|사장님|상사|사원증|직원증|출입카드|출입증|계약서|근로계약서|서류|통장|급여계좌/.test(item)) {
      variants.push("인사팀", "관리자", "반장", "계약서", "사원증", "출입카드", "인사팀이 어디예요?", "관리자 좀 불러 주세요");
    }
    if (/반장|라인반장/.test(item)) {
      variants.push("반장", "반장님 어디 계세요?", "반장님 좀 불러 주세요");
    }
    if (/사장님|상사/.test(item)) {
      variants.push("사장님", "사장님 계세요?", "관리자");
    }
    if (/출근시간/.test(item)) {
      variants.push("출근시간", "출근시간이 몇 시예요?", "몇 시 출근이에요?");
    }
    if (/퇴근시간/.test(item)) {
      variants.push("퇴근시간", "퇴근시간이 몇 시예요?", "몇 시 퇴근이에요?");
    }
    if (/야근/.test(item)) {
      variants.push("야근", "오늘 야근해요?", "오늘 초과근무 있어요?");
    }
    if (/조퇴/.test(item)) {
      variants.push("조퇴", "조퇴하고 싶어요", "조퇴해도 될까요?");
    }
    if (/기숙사|기숙사비|숙소비|공과금|전기세|전기요금|수도세|수도요금|가스비|가스요금|인터넷비|와이파이요금|관리비/.test(item)) {
      variants.push("기숙사", "공과금", "전기세", "수도세", "기숙사에 문제가 있어요", "기숙사비 얼마예요?", "공과금은 어디서 내요?");
    }
    if (/버스시간|버스시간표|첫차|막차|통근버스|셔틀버스|회사버스|버스몇시|버스가몇시에와요/.test(item)) {
      variants.push("버스 시간표", "통근버스", "첫차", "막차", "버스 시간표 보여 주세요", "버스가 몇 시에 와요?", "막차가 몇 시예요?");
    }
    if (/근무시간|출근시간|퇴근시간|출근|퇴근|초과근무|연장근무|야근|조퇴|휴게시간|쉬는날|쉬는 날|휴무|교대근무|주간근무|야간근무/.test(item)) {
      variants.push("근무시간", "출근", "퇴근", "초과근무", "휴게시간", "쉬는 날", "몇 시 출근이에요?", "몇 시 퇴근이에요?", "오늘 초과근무 있어요?");
    }
    if (/가동|작동|켜/.test(item)) {
      variants.push("기계", "작동", "가동", "시작하다", "켜다");
    }
    if (/멈춰|멈추|정지|중지|꺼/.test(item)) {
      variants.push("멈추다", "정지하다", "끄다", "기계");
    }
    if (/점심|아침|저녁|밥|식사/.test(item)) {
      variants.push("먹다", "가다", "같이");
      if (item.includes("점심")) variants.push("점심식사", "점심 먹으러 가자");
      if (item.includes("아침")) variants.push("아침식사", "아침 먹으러 가자");
      if (item.includes("저녁")) variants.push("저녁식사", "저녁 먹으러 가자");
      if (item.includes("밥")) variants.push("밥 먹으러 가자");
    }
    if (/가자|먹자|하자|갈래/.test(item)) {
      variants.push("같이", "가다", "먹다", "하다");
    }
    verbLikePatterns.forEach((pattern) => {
      const matched = item.match(pattern);
      if (!matched || !matched[1]) return;
      variants.push(`${matched[1]}하다`);
    });
  });

  return filterExpandedQuestionVariants(query, variants);
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function dropGenericTermsWhenSpecific(terms) {
  const normalized = unique(terms.map((item) => compactText(item)).filter(Boolean));
  const hasSpecific = normalized.some((term) => term.length >= 3 && !GENERIC_SEARCH_TERMS.has(term));
  if (!hasSpecific) return normalized;
  return normalized.filter((term) => !GENERIC_SEARCH_TERMS.has(term));
}

function sortTags(tags) {
  const order = new Map(baseData.scenarios.map((item, index) => [item.id, index]));
  return [...tags].sort((left, right) => (order.get(left) ?? 999) - (order.get(right) ?? 999));
}

function detectTags(...parts) {
  const joined = parts.join(" ");
  const rules = {
    기본회화: ["어떻게", "뭐", "다시", "천천히", "도와", "잠깐", "괜찮", "이해"],
    인사: ["안녕", "반가", "감사", "죄송", "실례", "이름", "한국", "태국"],
    식당: ["먹", "물", "계산", "맛", "맵", "음식", "메뉴", "포장"],
    이동: ["어디", "왼쪽", "오른쪽", "길", "가다", "오다", "집", "위치", "화장실"],
    쇼핑: ["얼마", "비싸", "깎", "카드", "사이즈", "색", "가격", "영수증"],
    건강: ["아프", "병원", "약", "화장실", "열", "기침", "조심"],
    일터: ["확인", "완료", "문제", "기다리", "빠르", "느리", "작업", "기계", "공장"],
    "숫자·시간": ["오늘", "내일", "어제", "아침", "저녁", "요일", "시간", "오후", "월"],
  };

  const tags = [];
  Object.entries(rules).forEach(([tag, keywords]) => {
    if (keywords.some((keyword) => joined.includes(keyword))) {
      tags.push(tag);
    }
  });
  return tags.length ? tags : ["기본회화"];
}

function extractKeywords(entry) {
  return unique(
    [
      ...tokenize(entry.thai),
      ...tokenize(entry.thaiScript),
      ...tokenize(entry.korean),
      ...tokenize(entry.note),
      ...(entry.tags || []),
      ...((entry.keywords || []).map((item) => normalizeText(item))),
    ].map((item) => item.trim())
  );
}

function hydrateEntry(entry, fallbackKind) {
  const kind = entry.kind || fallbackKind;
  const thai = String(entry.thai || "").trim();
  const thaiScript = String(entry.thaiScript || "").trim();
  const korean = String(entry.korean || "").trim();
  const note = String(entry.note || "").trim();
  const tags = sortTags(
    unique(
      Array.isArray(entry.tags) && entry.tags.length
        ? entry.tags.map((tag) => String(tag).trim()).filter(Boolean)
        : detectTags(thai, korean, note)
    )
  );

  return {
    id: entry.id || `custom-${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    source: entry.source || "custom",
    sheet: entry.sheet || "직접 추가",
    thai,
    thaiScript,
    korean,
    note,
    tags,
    keywords: unique(
      Array.isArray(entry.keywords) && entry.keywords.length
        ? entry.keywords.map((item) => normalizeText(item))
        : extractKeywords({ thai, thaiScript, korean, note, tags })
    ),
    createdAt: entry.createdAt || new Date().toISOString(),
  };
}

function loadCustomData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { vocab: [], sentences: [] };
    const parsed = JSON.parse(raw);
    return {
      vocab: Array.isArray(parsed.vocab) ? parsed.vocab.map((entry) => hydrateEntry(entry, "vocab")) : [],
      sentences: Array.isArray(parsed.sentences)
        ? parsed.sentences.map((entry) => hydrateEntry(entry, "sentence"))
        : [],
    };
  } catch (error) {
    console.error("커스텀 데이터 로드 실패", error);
    return { vocab: [], sentences: [] };
  }
}

function loadAiSettings() {
  try {
    const raw = localStorage.getItem(AI_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_AI_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      enabled: Boolean(parsed.enabled),
      mode: parsed.mode === "auto" ? "auto" : "manual",
      endpoint: String(parsed.endpoint || "").trim(),
      accessToken: String(parsed.accessToken || "").trim(),
    };
  } catch (error) {
    console.error("AI 설정 로드 실패", error);
    return { ...DEFAULT_AI_SETTINGS };
  }
}

function saveCustomData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.custom));
  state.customRevision += 1;
  clearDerivedSearchCaches();
  mergedEntriesCache.revision = -1;
}

function saveAiSettings() {
  localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(state.aiSettings));
}

function createHydratedBaseData() {
  return {
    vocab: [...(baseData.vocab || []), ...(SUPPLEMENTAL_DATA.vocab || [])].map((entry) =>
      hydrateEntry(entry, "vocab")
    ),
    sentences: [...(baseData.sentences || []), ...(SUPPLEMENTAL_DATA.sentences || [])].map((entry) =>
      hydrateEntry(entry, "sentence")
    ),
  };
}

function getMergedData() {
  if (!state.custom.vocab.length && !state.custom.sentences.length) {
    return hydratedBaseData;
  }

  return {
    vocab: [...hydratedBaseData.vocab, ...state.custom.vocab],
    sentences: [...hydratedBaseData.sentences, ...state.custom.sentences],
  };
}

function getMergedEntries(merged) {
  if (!state.custom.vocab.length && !state.custom.sentences.length) {
    return hydratedBaseMergedEntries;
  }
  if (mergedEntriesCache.revision === state.customRevision) {
    return mergedEntriesCache.entries;
  }
  mergedEntriesCache.revision = state.customRevision;
  mergedEntriesCache.entries = [...merged.vocab, ...merged.sentences];
  return mergedEntriesCache.entries;
}

function getSearchCollectionCacheId(entries) {
  if (!Array.isArray(entries) || !entries.length) {
    return `empty-${state.customRevision}`;
  }

  const cached = searchCollectionCacheIds.get(entries);
  if (cached) return cached;

  const cacheId = `collection-${nextSearchCollectionCacheId++}-${entries.length}`;
  searchCollectionCacheIds.set(entries, cacheId);
  return cacheId;
}

function clearDerivedSearchCaches() {
  searchComputationCache.clear();
  thaiMeaningAnalysisCache.clear();
}

function buildSearchComputationCacheKey(query) {
  return [state.scenario, state.customRevision, compactText(query)].join("||");
}

function hasConfiguredAiAssist() {
  return Boolean(
    state.aiSettings.enabled &&
      String(state.aiSettings.endpoint || "").trim() &&
      /^https?:\/\//i.test(String(state.aiSettings.endpoint || "").trim())
  );
}

function syncAiSettingsForm() {
  if (!elements.aiSettingsForm) return;
  if (elements.aiEnabledInput) elements.aiEnabledInput.checked = Boolean(state.aiSettings.enabled);
  if (elements.aiModeInput) elements.aiModeInput.value = state.aiSettings.mode || "manual";
  if (elements.aiEndpointInput) elements.aiEndpointInput.value = state.aiSettings.endpoint || "";
  if (elements.aiTokenInput) elements.aiTokenInput.value = state.aiSettings.accessToken || "";
}

function serializeAiContextEntry(entry) {
  return {
    korean: entry.korean,
    thai: entry.thai,
    thaiScript: getThaiScriptText(entry),
    tags: entry.tags || [],
    note: entry.note || "",
    source: entry.source || "",
  };
}

function createAiAssistEntry(item, kind, query, index) {
  const korean = String(item.korean || "").trim();
  const thaiScript = String(item.thaiScript || "").trim();
  const thai = String(item.thai || "").trim() || thaiScript;
  const noteParts = [String(item.note || "").trim(), "AI 보강 제안"].filter(Boolean);
  return hydrateEntry(
    {
      id: `ai-${kind}-${compactText(query).slice(0, 48) || "query"}-${index}`,
      kind,
      source: "ai-assist",
      sheet: "AI 보강",
      thai,
      thaiScript,
      korean,
      note: noteParts.join(" · "),
      tags: Array.isArray(item.tags) ? item.tags : [],
      keywords: Array.isArray(item.keywords) ? item.keywords : [query, korean],
      createdAt: new Date().toISOString(),
    },
    kind
  );
}

function normalizeAiAssistResponse(payload, query) {
  const raw = payload && typeof payload === "object" && payload.result ? payload.result : payload || {};
  const hints = unique(
    (Array.isArray(raw.searchHints) ? raw.searchHints : Array.isArray(raw.hints) ? raw.hints : [])
      .map((item) => String(item || "").trim())
      .filter(Boolean)
  ).slice(0, 6);

  const vocab = Array.isArray(raw.vocab)
    ? raw.vocab
        .map((item, index) => createAiAssistEntry(item, "vocab", query, index + 1))
        .filter((entry) => entry.korean || entry.thai || entry.thaiScript)
        .slice(0, AI_RESULT_LIMITS.vocab)
    : [];

  const sentences = Array.isArray(raw.sentences)
    ? raw.sentences
        .map((item, index) => createAiAssistEntry(item, "sentence", query, index + 1))
        .filter((entry) => entry.korean || entry.thai || entry.thaiScript)
        .slice(0, AI_RESULT_LIMITS.sentences)
    : [];

  return {
    normalizedQuery: String(raw.normalizedQuery || "").trim(),
    intent: String(raw.intent || "").trim(),
    caution: String(raw.caution || "").trim(),
    confidence: Number.isFinite(Number(raw.confidence)) ? Number(raw.confidence) : null,
    hints,
    vocab,
    sentences,
    model: String(payload?.model || raw.model || "").trim(),
  };
}

function buildAiAssistRequestPayload(context) {
  return {
    query: String(context?.query || "").trim(),
    scenario: state.scenario,
    mode: state.aiSettings.mode,
    searchProfile: {
      displayTerms: (context?.searchProfile?.displayTerms || []).slice(0, 8),
      primaryTerms: (context?.searchProfile?.primaryTerms || []).slice(0, 12),
      tags: (context?.searchProfile?.tags || []).slice(0, 8),
    },
    localResults: {
      vocab: (context?.vocabResults || []).slice(0, 6).map(serializeAiContextEntry),
      sentences: (context?.sentenceResults || []).slice(0, 6).map(serializeAiContextEntry),
    },
  };
}

function isAiEligibleQuery(query) {
  const trimmed = String(query || "").trim();
  if (trimmed.length < AI_ASSIST_MIN_QUERY_LENGTH) return false;
  if (/^[0-9\s:./-]+$/.test(trimmed)) return false;
  return true;
}

function shouldAutoRunAiAssist(context) {
  if (!hasConfiguredAiAssist()) return false;
  if (state.aiSettings.mode !== "auto") return false;
  if (!context || !isAiEligibleQuery(context.query)) return false;
  if (context.numberMode || context.timeMode || context.timeQuestionMode) return false;
  if (context.exactVocabMatch || context.exactSentenceMatch) return false;
  if ((context.vocabResults || []).length >= 3 && (context.sentenceResults || []).length >= 3) return false;
  return true;
}

async function requestAiAssist(context = state.lastSearchContext, options = {}) {
  if (!context || !isAiEligibleQuery(context.query)) return;
  if (!hasConfiguredAiAssist()) {
    openMenu();
    if (elements.aiSettingsFeedback) {
      elements.aiSettingsFeedback.textContent = "AI 보강을 쓰려면 프록시 URL을 먼저 저장해 주세요.";
    }
    elements.aiEndpointInput?.focus();
    return;
  }

  const trigger = options.trigger === "auto" ? "auto" : "manual";
  const query = String(context.query || "").trim();
  const requestId = state.aiAssist.requestId + 1;
  state.aiAssist = {
    status: "loading",
    query,
    error: "",
    result: trigger === "manual" && state.aiAssist.query === query ? state.aiAssist.result : null,
    requestId,
    trigger,
  };
  render();

  const headers = {
    "Content-Type": "application/json",
  };
  if (state.aiSettings.accessToken) {
    headers.Authorization = `Bearer ${state.aiSettings.accessToken}`;
  }

  try {
    const response = await fetch(state.aiSettings.endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(buildAiAssistRequestPayload(context)),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(String(data.error || data.message || `AI 요청 실패 (${response.status})`));
    }

    if (requestId !== state.aiAssist.requestId) return;

    state.aiAssist = {
      status: "done",
      query,
      error: "",
      result: normalizeAiAssistResponse(data, query),
      requestId,
      trigger,
    };
  } catch (error) {
    if (requestId !== state.aiAssist.requestId) return;
    state.aiAssist = {
      status: "error",
      query,
      error: error instanceof Error ? error.message : "AI 보강 요청에 실패했습니다.",
      result: null,
      requestId,
      trigger,
    };
  }

  render();
}

function submitAiSettings(event) {
  event.preventDefault();
  const formData = new FormData(elements.aiSettingsForm);
  state.aiSettings = {
    enabled: formData.get("enabled") === "on",
    mode: formData.get("mode") === "auto" ? "auto" : "manual",
    endpoint: String(formData.get("endpoint") || "").trim(),
    accessToken: String(formData.get("accessToken") || "").trim(),
  };
  saveAiSettings();
  syncAiSettingsForm();
  if (elements.aiSettingsFeedback) {
    elements.aiSettingsFeedback.textContent = hasConfiguredAiAssist()
      ? "AI 보강 설정을 저장했습니다."
      : "프록시 URL이 비어 있어 AI 보강은 아직 꺼진 상태입니다.";
  }
  render();
}

function matchesScenario(entry) {
  return state.scenario === "all" || entry.tags.includes(state.scenario);
}

function buildSearchIndex(entry) {
  const cached = searchIndexCache.get(entry);
  if (cached) return cached;

  const korean = compactText(entry.korean);
  const thai = compactText(entry.thai);
  const thaiScript = compactText(getThaiScriptText(entry));
  const note = compactText(entry.note);
  const keywords = unique((entry.keywords || []).map((item) => compactText(item)));
  const koreanTokens = unique(tokenize(entry.korean).map((item) => compactText(item)));
  const thaiTokens = unique(tokenize(entry.thai).map((item) => compactText(item)));
  const thaiScriptTokens = unique(tokenize(getThaiScriptText(entry)).map((item) => compactText(item)));
  const coreTokens = unique([...koreanTokens, ...thaiTokens, ...thaiScriptTokens]);
  const tokens = unique(
    [
      ...coreTokens,
      ...tokenize(entry.note),
      ...(entry.keywords || []),
    ].map((item) => compactText(item))
  );
  const index = { korean, thai, thaiScript, note, keywords, tokens, coreTokens, koreanTokens, thaiTokens, thaiScriptTokens };
  searchIndexCache.set(entry, index);
  return index;
}

function addRuntimeEntry(map, key, entry) {
  if (!key) return;
  const bucket = map.get(key);
  if (bucket) {
    bucket.push(entry);
    return;
  }
  map.set(key, [entry]);
}

function getRuntimeTerms(index) {
  return unique([index.korean, index.thai, index.thaiScript, index.note, ...index.tokens, ...index.keywords]);
}

function buildSearchRuntime(entries) {
  const exactMap = new Map();
  const prefix2Map = new Map();
  const prefix3Map = new Map();

  entries.forEach((entry) => {
    const index = buildSearchIndex(entry);
    getRuntimeTerms(index).forEach((term) => {
      addRuntimeEntry(exactMap, term, entry);
      if (term.length >= 2) addRuntimeEntry(prefix2Map, term.slice(0, 2), entry);
      if (term.length >= 3) addRuntimeEntry(prefix3Map, term.slice(0, 3), entry);
    });
  });

  return { exactMap, prefix2Map, prefix3Map };
}

function getSearchRuntime(entries) {
  const cached = searchRuntimeCache.get(entries);
  if (cached) return cached;
  const runtime = buildSearchRuntime(entries);
  searchRuntimeCache.set(entries, runtime);
  return runtime;
}

function getCandidateSearchTerms(searchProfile) {
  if (!searchProfile?.query) return [];
  if (searchProfile.queryDirection === "thai") {
    return dropGenericTermsWhenSpecific([
      searchProfile.compact,
      ...(searchProfile.directTerms || []).slice(0, 6),
      ...(searchProfile.objectTerms || []).slice(0, 3),
      ...(searchProfile.templateTerms || []).slice(0, 4),
      ...(searchProfile.relatedTerms || []).slice(0, 3),
      ...(searchProfile.anchorTerms || []).slice(0, 2),
    ]).slice(0, 14);
  }
  return dropGenericTermsWhenSpecific([
    searchProfile.compact,
    ...(searchProfile.directTerms || []),
    ...(searchProfile.primaryTerms || []).slice(0, 12),
    ...(searchProfile.objectTerms || []),
    ...(searchProfile.actionTerms || []),
    ...(searchProfile.anchorTerms || []),
    ...(searchProfile.templateTerms || []).slice(0, 8),
    ...(searchProfile.relatedTerms || []).slice(0, 6),
  ]).slice(0, 24);
}

function collectCandidateEntries(entries, searchProfile) {
  if (!searchProfile?.query) return entries;

  const runtime = getSearchRuntime(entries);
  const candidateTerms = getCandidateSearchTerms(searchProfile);
  if (!candidateTerms.length) return entries;

  const results = [];
  const seen = new Set();
  const pushEntries = (bucket) => {
    if (!bucket) return;
    bucket.forEach((entry) => {
      if (seen.has(entry.id)) return;
      seen.add(entry.id);
      results.push(entry);
    });
  };

  candidateTerms.forEach((term) => {
    pushEntries(runtime.exactMap.get(term));
    if (term.length >= 3) {
      pushEntries(runtime.prefix3Map.get(term.slice(0, 3)));
    } else if (term.length >= 2) {
      pushEntries(runtime.prefix2Map.get(term.slice(0, 2)));
    }
  });

  if (!results.length) return entries;
  if (results.length >= Math.floor(entries.length * 0.85)) return entries;
  return results;
}

function normalizeNumberQuery(query) {
  const cleaned = String(query || "").trim().replace(/,/g, "");
  if (!NUMBER_QUERY_REGEX.test(cleaned)) return "";
  if (cleaned.startsWith("+")) return cleaned.slice(1);
  if (cleaned.startsWith(".")) return `0${cleaned}`;
  if (cleaned.startsWith("-.")) return `-0${cleaned.slice(1)}`;
  return cleaned;
}

function parseNumberWithUnitQuery(query) {
  const trimmed = String(query || "").trim();
  if (!trimmed) return null;

  const cleaned = trimmed.replace(/,/g, "").replace(/\s+/g, "");
  const matched = cleaned.match(/^([+-]?(?:(?:\d+(?:\.\d+)?)|(?:\.\d+)))(원|krw|바트|บาท|밧|개|명|층)$/i);
  if (!matched) return null;

  const rawUnit = String(matched[2] || "");
  const unitKey = NUMBER_UNIT_ALIAS_MAP[rawUnit.toLowerCase()] || NUMBER_UNIT_ALIAS_MAP[rawUnit];
  if (!unitKey || !NUMBER_UNIT_DEFINITIONS[unitKey]) return null;

  return {
    query: trimmed,
    number: matched[1],
    unitKey,
    unit: NUMBER_UNIT_DEFINITIONS[unitKey],
  };
}

function toThaiNumeralDigits(text) {
  return String(text || "").replace(/\d/g, (digit) => THAI_NUMERAL_DIGITS[Number(digit)]);
}

function stripLeadingZeros(numberText) {
  const stripped = String(numberText || "").replace(/^0+(?=\d)/, "");
  return stripped || "0";
}

function convertUnderMillionToThaiTokens(numberText) {
  const normalized = stripLeadingZeros(numberText);
  if (normalized === "0") {
    return {
      script: [NUMBER_WORDS_SCRIPT[0]],
      latin: [NUMBER_WORDS_LATIN[0]],
      ko: [NUMBER_WORDS_KO[0]],
    };
  }

  const padded = normalized.padStart(6, "0").split("").map(Number);
  const script = [];
  const latin = [];
  const ko = [];

  padded.forEach((digit, index) => {
    if (!digit) return;

    const isTens = index === 4;
    const isOnes = index === 5;
    const hasHigherInGroup = padded.slice(0, 5).some((value) => value > 0);
    const unit = NUMBER_UNITS[index];

    if (isTens) {
      if (digit === 1) {
        script.push(unit.script);
        latin.push(unit.latin);
        ko.push(unit.ko);
        return;
      }
      if (digit === 2) {
        script.push(`${NUMBER_YI_SCRIPT}${unit.script}`);
        latin.push(`${NUMBER_YI_LATIN} ${unit.latin}`);
        ko.push(`${NUMBER_YI_KO}${unit.ko ? ` ${unit.ko}` : ""}`.trim());
        return;
      }
      script.push(`${NUMBER_WORDS_SCRIPT[digit]}${unit.script}`);
      latin.push(`${NUMBER_WORDS_LATIN[digit]} ${unit.latin}`);
      ko.push(`${NUMBER_WORDS_KO[digit]}${unit.ko ? ` ${unit.ko}` : ""}`.trim());
      return;
    }

    if (isOnes) {
      if (digit === 1 && hasHigherInGroup) {
        script.push(NUMBER_ET_SCRIPT);
        latin.push(NUMBER_ET_LATIN);
        ko.push(NUMBER_ET_KO);
        return;
      }
      script.push(NUMBER_WORDS_SCRIPT[digit]);
      latin.push(NUMBER_WORDS_LATIN[digit]);
      ko.push(NUMBER_WORDS_KO[digit]);
      return;
    }

    script.push(`${NUMBER_WORDS_SCRIPT[digit]}${unit.script}`);
    latin.push(`${NUMBER_WORDS_LATIN[digit]} ${unit.latin}`);
    ko.push(`${NUMBER_WORDS_KO[digit]}${unit.ko ? ` ${unit.ko}` : ""}`.trim());
  });

  return { script, latin, ko };
}

function convertIntegerToThaiTokens(numberText) {
  const normalized = stripLeadingZeros(numberText);
  if (normalized === "0") {
    return {
      script: [NUMBER_WORDS_SCRIPT[0]],
      latin: [NUMBER_WORDS_LATIN[0]],
      ko: [NUMBER_WORDS_KO[0]],
    };
  }

  const groups = [];
  for (let index = normalized.length; index > 0; index -= 6) {
    groups.unshift(normalized.slice(Math.max(0, index - 6), index));
  }

  const script = [];
  const latin = [];
  const ko = [];

  groups.forEach((group, index) => {
    const isZeroGroup = /^0+$/.test(group);
    const repeatMillions = groups.length - index - 1;
    if (!isZeroGroup) {
      const converted = convertUnderMillionToThaiTokens(group);
      script.push(...converted.script);
      latin.push(...converted.latin);
      ko.push(...converted.ko);
    }

    if (repeatMillions > 0 && (!isZeroGroup || script.length)) {
      const millionScript = "ล้าน".repeat(repeatMillions);
      const millionLatin = Array(repeatMillions).fill("lan").join(" ");
      const millionKo = Array(repeatMillions).fill("란").join(" ");
      script.push(millionScript);
      latin.push(millionLatin);
      ko.push(millionKo);
    }
  });

  return { script, latin, ko };
}

function convertNumberToThai(query) {
  const normalized = normalizeNumberQuery(query);
  if (!normalized) return null;

  const negative = normalized.startsWith("-");
  const absolute = negative ? normalized.slice(1) : normalized;
  const parts = absolute.split(".");
  const integerPart = stripLeadingZeros(parts[0] || "0");
  const fractionPart = parts.length > 1 ? parts[1] : "";
  const integerTokens = convertIntegerToThaiTokens(integerPart);

  const scriptTokens = [];
  const latinTokens = [];
  const koTokens = [];

  if (negative) {
    scriptTokens.push("ลบ");
    latinTokens.push("lop");
    koTokens.push("롭");
  }

  scriptTokens.push(...integerTokens.script);
  latinTokens.push(...integerTokens.latin);
  koTokens.push(...integerTokens.ko);

  if (fractionPart) {
    scriptTokens.push("จุด");
    latinTokens.push("chut");
    koTokens.push("쭛");
    fractionPart.split("").forEach((digit) => {
      scriptTokens.push(NUMBER_WORDS_SCRIPT[Number(digit)]);
      latinTokens.push(NUMBER_WORDS_LATIN[Number(digit)]);
      koTokens.push(NUMBER_WORDS_KO[Number(digit)]);
    });
  }

  const thaiDigits = `${negative ? "-" : ""}${toThaiNumeralDigits(integerPart)}${fractionPart ? `.${toThaiNumeralDigits(fractionPart)}` : ""}`;

  return {
    normalized,
    thaiDigits,
    thaiScript: scriptTokens.join(""),
    thaiLatin: latinTokens.join(" "),
    thaiKo: koTokens.join(" "),
    isDecimal: Boolean(fractionPart),
    isNegative: negative,
    integerPart,
    fractionPart,
  };
}

function buildGeneratedNumberEntries(query) {
  const unitQuery = parseNumberWithUnitQuery(query);
  const displayQuery = String(query || "").trim();
  const converted = convertNumberToThai(unitQuery ? unitQuery.number : query);
  if (!converted) {
    return { vocab: [], sentences: [] };
  }

  const notePieces = ["한국어식 발음"];
  if (converted.isDecimal) notePieces.push("소수점은 뒤 숫자를 하나씩 읽습니다");
  if (converted.isNegative) notePieces.push("음수는 앞에 ลบ를 붙입니다");
  if (unitQuery) notePieces.push(`${unitQuery.unit.label} 단위까지 함께 읽습니다`);

  const idSuffix = unitQuery ? `${converted.normalized}-${unitQuery.unitKey}` : converted.normalized;
  const thaiWithUnitKo = unitQuery ? `${converted.thaiKo} ${unitQuery.unit.thaiKo}`.trim() : converted.thaiKo;
  const thaiWithUnitScript = unitQuery ? `${converted.thaiScript}${unitQuery.unit.thaiScript}` : converted.thaiScript;
  const thaiWithUnitLatin = unitQuery ? `${converted.thaiLatin} ${unitQuery.unit.english}` : converted.thaiLatin;
  const baseTags = unitQuery ? unique(["숫자·시간", ...(unitQuery.unit.tags || [])]) : ["숫자·시간", "쇼핑"];
  const commonKeywords = unique(
    [
      query,
      displayQuery,
      converted.normalized,
      converted.thaiDigits,
      converted.thaiKo,
      converted.thaiScript,
      unitQuery?.unit.label,
      unitQuery?.unit.english,
      unitQuery?.unit.thaiKo,
      unitQuery?.unit.thaiScript,
      "숫자",
      "가격",
      "수량",
    ].filter(Boolean)
  );

  const baseEntry = hydrateEntry(
    {
      id: `generated-number-read-${idSuffix}`,
      kind: "vocab",
      source: "generated",
      sheet: "숫자 변환",
      thai: thaiWithUnitKo,
      thaiScript: thaiWithUnitScript,
      korean: displayQuery,
      note: `${notePieces.join(" · ")} · 영문 표기: ${thaiWithUnitLatin}`,
      tags: baseTags,
      keywords: commonKeywords,
    },
    "vocab"
  );

  const digitEntry = hydrateEntry(
    {
      id: `generated-number-digits-${idSuffix}`,
      kind: "vocab",
      source: "generated",
      sheet: "숫자 변환",
      thai: converted.thaiDigits,
      thaiScript: converted.thaiDigits,
      korean: `${displayQuery} 태국 숫자`,
      note: "태국 숫자 표기",
      tags: ["숫자·시간"],
      keywords: [...commonKeywords, "태국 숫자", "숫자 표기"],
    },
    "vocab"
  );

  const sentenceEntries = [
    hydrateEntry(
      {
        id: `generated-number-say-${idSuffix}`,
        kind: "sentence",
        source: "generated",
        sheet: "숫자 변환",
        thai: thaiWithUnitKo,
        thaiScript: thaiWithUnitScript,
        korean: `${displayQuery} 읽기`,
        note: `숫자를 그대로 읽을 때 · 영문 표기: ${thaiWithUnitLatin}`,
        tags: unique(["숫자·시간", ...(unitQuery?.unit.tags || [])]),
        keywords: [...commonKeywords, "숫자 읽기"],
      },
      "sentence"
    ),
    unitQuery
      ? hydrateEntry(
          {
            id: `generated-number-unit-${idSuffix}`,
            kind: "sentence",
            source: "generated",
            sheet: "숫자 변환",
            thai: thaiWithUnitKo,
            thaiScript: thaiWithUnitScript,
            korean: `${displayQuery} 표시`,
            note: `단위까지 같이 보여주기 · 영문 표기: ${thaiWithUnitLatin}`,
            tags: unique(["숫자·시간", ...(unitQuery.unit.tags || [])]),
            keywords: [...commonKeywords, `${unitQuery.unit.label} 단위`, "금액", "수량"],
          },
          "sentence"
        )
      : hydrateEntry(
          {
            id: `generated-number-price-${idSuffix}`,
            kind: "sentence",
            source: "generated",
            sheet: "숫자 변환",
            thai: `${converted.thaiKo} 밧`,
            thaiScript: `${converted.thaiScript}บาท`,
            korean: `${displayQuery} 바트`,
            note: `가격으로 바로 보여주기 · 영문 표기: ${converted.thaiLatin} baht`,
            tags: ["쇼핑", "숫자·시간"],
            keywords: [...commonKeywords, "바트", "가격", "금액"],
          },
          "sentence"
        ),
  ];

  return {
    vocab: [baseEntry, digitEntry],
    sentences: sentenceEntries,
  };
}

function getActionCompositionSuffixes(actionId) {
  return [...(ACTION_COMPOSITION_SUFFIXES[actionId] || [])].sort((left, right) => right.length - left.length);
}

function detectComposableActionId(text) {
  const compact = compactText(text);
  if (!compact) return "";

  return ["bring", "show", "change", "request"].find((actionId) =>
    getActionCompositionSuffixes(actionId).some((suffix) => compact.endsWith(suffix))
  ) || "";
}

function getWhatQuestionSuffix(text) {
  const compact = compactText(text);
  if (!compact) return "";
  return WHAT_QUESTION_SUFFIXES.find((suffix) => compact.endsWith(suffix)) || "";
}

function isWhatQuestionQuery(text) {
  return Boolean(getWhatQuestionSuffix(text));
}

function findDemonstrativeDefinition(text) {
  const compact = compactText(text);
  if (!compact) return null;

  return (
    DEMONSTRATIVE_DEFINITIONS.find((item) =>
      item.aliases.some((alias) => compact.startsWith(compactText(alias)))
    ) || null
  );
}

function trimComposableCompact(compact) {
  let current = compactText(compact);
  let updated = true;

  while (updated && current) {
    updated = false;

    ACTION_COMPOSITION_FILLER_SUFFIXES.forEach((suffix) => {
      if (current.endsWith(suffix) && current.length > suffix.length) {
        current = current.slice(0, -suffix.length);
        updated = true;
      }
    });

    ACTION_COMPOSITION_PARTICLE_SUFFIXES.forEach((suffix) => {
      if (current.endsWith(suffix) && current.length > suffix.length) {
        current = current.slice(0, -suffix.length);
        updated = true;
      }
    });
  }

  return current;
}

function extractComposableObjectCompacts(query, actionId) {
  const compact = compactText(query);
  if (!compact) return [];

  const suffix = getActionCompositionSuffixes(actionId).find((item) => compact.endsWith(item)) || "";
  const stripped = suffix ? compact.slice(0, -suffix.length) : compact;
  const strippedCompact = trimComposableCompact(stripped);
  const variants = unique([strippedCompact]).filter(Boolean);

  const demonstrative = findDemonstrativeDefinition(stripped || compact);
  if (demonstrative) {
    variants.push(...demonstrative.aliases.map((alias) => compactText(alias)));
  }

  return unique(variants.filter(Boolean)).sort((left, right) => right.length - left.length);
}

function getComposableObjectMatchScore(entry, objectCompacts) {
  if (!entry || entry.kind !== "vocab") return -1;
  if (isSentenceLikeVocabEntry(entry) || isUtilityLabelVocabEntry(entry)) return -1;
  if (isLikelyActionMeaningEntry(entry)) return -1;

  const index = buildSearchIndex(entry);
  let best = -1;

  objectCompacts.forEach((term) => {
    if (!term) return;
    if (index.korean === term) {
      best = Math.max(best, 120);
      return;
    }
    if (index.koreanTokens.includes(term)) {
      best = Math.max(best, 112);
      return;
    }
    if (index.coreTokens.includes(term)) {
      best = Math.max(best, 106);
      return;
    }
    if (index.korean.startsWith(term)) {
      best = Math.max(best, 96);
      return;
    }
    if (index.korean.includes(term)) {
      best = Math.max(best, 90);
      return;
    }
    if (index.keywords.includes(term)) {
      best = Math.max(best, 82);
      return;
    }
    if (index.tokens.some((token) => token === term)) {
      best = Math.max(best, 78);
      return;
    }
    if (index.tokens.some((token) => token.startsWith(term) || (term.length >= 3 && token.includes(term)))) {
      best = Math.max(best, 72);
    }
  });

  if (entry.source === "generated-bulk") best -= 45;
  if (!getThaiScriptText(entry)) best -= 18;
  return best;
}

function findComposableObjectEntry(entries, objectCompacts) {
  if (!objectCompacts.length) return null;

  const ranked = entries
    .filter((entry) => entry.kind === "vocab" && matchesScenario(entry))
    .map((entry) => ({
      entry,
      score: getComposableObjectMatchScore(entry, objectCompacts),
      hasThaiScript: Boolean(getThaiScriptText(entry)),
    }))
    .filter((item) => item.score >= 72)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (left.hasThaiScript !== right.hasThaiScript) return Number(right.hasThaiScript) - Number(left.hasThaiScript);
      if (left.entry.korean.length !== right.entry.korean.length) return left.entry.korean.length - right.entry.korean.length;
      return left.entry.korean.localeCompare(right.entry.korean, "ko");
    });

  return ranked[0]?.entry || null;
}

function createGeneratedComposedSentence(query, actionId, objectLabel, objectThaiKo, objectThaiScript, tags = [], keywords = []) {
  const template = ACTION_COMPOSITION_TEMPLATES[actionId];
  if (!template || !objectLabel || !objectThaiKo || !objectThaiScript) return null;

  return hydrateEntry(
    {
      id: `generated-compose-${actionId}-${compactText(query)}-${compactText(objectLabel)}`,
      kind: "sentence",
      source: "generated",
      sheet: "자동 조합",
      thai: template.thaiKo(objectThaiKo),
      thaiScript: template.thaiScript(objectThaiScript),
      korean: template.korean(objectLabel),
      note: `입력한 표현에서 목적어와 동사를 분리해 자동 조합 · ${template.note}`,
      tags: unique(["기본회화", ...tags]),
      keywords: unique([query, objectLabel, ...keywords, template.label, actionId, "자동 조합"]),
    },
    "sentence"
  );
}

function createGeneratedDemonstrativeVocab(query, demonstrative) {
  if (!demonstrative) return null;

  return hydrateEntry(
    {
      id: `generated-demo-${compactText(query)}-${compactText(demonstrative.label)}`,
      kind: "vocab",
      source: "generated",
      sheet: "자동 조합",
      thai: demonstrative.thaiKo,
      thaiScript: demonstrative.thaiScript,
      korean: demonstrative.label,
      note: "손으로 가리키는 표현",
      tags: ["기본회화"],
      keywords: unique([query, demonstrative.label, ...demonstrative.aliases, "가리키기"]),
    },
    "vocab"
  );
}

function isStartComposableObjectEntry(entry) {
  const label = getEntryPrimaryKoreanText(entry) || normalizeText(entry?.korean || "");
  if (!label) return false;

  if (/(?:교육|훈련|오리엔테이션|수업|업무|작업|근무|회의|미팅|청소|검사|포장|조립|생산|점검)/u.test(label)) {
    return true;
  }

  return (entry?.keywords || []).some((keyword) =>
    /(?:교육|훈련|오리엔테이션|수업|업무|작업|근무|회의|미팅|청소|검사|포장|조립|생산|점검)/u.test(
      normalizeText(keyword)
    )
  );
}

function getMatchedPredicateFamilies(text) {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  return PREDICATE_QUERY_FAMILIES.filter((family) =>
    (family.patterns || []).some((pattern) => pattern.test(normalized))
  );
}

function hasSelfReferentQuery(text) {
  return /(?:^|\s)(?:내|제|나의|저의|나는|저는|난|전)(?:\s|$)|내가|제가/.test(normalizeText(text));
}

function getDemonstrativeSubjectLabel(demonstrative) {
  if (!demonstrative?.label) return "";
  if (demonstrative.label === "이거") return "이건";
  if (demonstrative.label === "그거") return "그건";
  if (demonstrative.label === "저거") return "저건";
  return attachKoreanSubjectParticle(demonstrative.label);
}

function createGeneratedPredicateEntry(query, korean, thaiKo, thaiScript, kind, tags = [], keywords = [], note = "") {
  if (!korean || !thaiKo || !thaiScript) return null;

  return hydrateEntry(
    {
      id: `generated-predicate-${kind}-${compactText(query)}-${compactText(korean)}`,
      kind,
      source: "generated",
      sheet: "판단 조합",
      thai: thaiKo,
      thaiScript,
      korean,
      note: note || "지시어와 상태 판단을 조합해 만든 표현",
      tags: sortTags(unique(["기본회화", ...tags])),
      keywords: unique([query, korean, thaiKo, thaiScript, ...keywords, "판단", "상태"]),
    },
    kind
  );
}

function getPredicateEntryPriority(entry, query, options = {}) {
  const normalizedQuery = normalizeText(query);
  const compactQuery = compactText(query);
  const korean = normalizeText(entry?.korean || "");
  const compactKorean = compactText(entry?.korean || "");
  const selfReferent = options.selfReferent ?? hasSelfReferentQuery(query);
  const demonstrative = options.demonstrative || findDemonstrativeDefinition(query);
  const subjectLabel = demonstrative ? normalizeText(getDemonstrativeSubjectLabel(demonstrative)) : "";
  let score = 0;

  if (compactQuery && compactKorean === compactQuery) score += 500;
  if (compactQuery && compactKorean && compactQuery.includes(compactKorean)) score += 260;
  if (compactQuery && compactKorean && compactKorean.includes(compactQuery)) score += 180;

  if (/실수|오류|오타/.test(normalizedQuery) && /실수/.test(korean)) score += 220;
  if (/잘못/.test(normalizedQuery) && /잘못/.test(korean)) score += 220;
  if (/틀리/.test(normalizedQuery) && /틀리|틀렸/.test(korean)) score += 220;
  if (/모르|몰라/.test(normalizedQuery) && /모르|몰라/.test(korean)) score += 260;
  if (/모르|몰라/.test(normalizedQuery) && /이해합니다|이해해요/.test(korean)) score -= 120;
  if (/맞아|맞다|정답|옳/.test(normalizedQuery) && /맞아|맞다|맞아요/.test(korean)) score += 220;
  if (/괜찮|문제없|이상없|쓸만/.test(normalizedQuery) && /괜찮/.test(korean)) score += 220;
  if (/문제|이상해|이상하다|고장났/.test(normalizedQuery) && /문제|이상/.test(korean)) score += 220;

  if (selfReferent && /^(제|제가)/.test(korean)) score += 260;
  if (subjectLabel && korean.startsWith(subjectLabel)) score += 240;
  if (entry?.kind === "sentence") score += 20;

  return score;
}

function buildPredicateIntentHints(query) {
  const families = getMatchedPredicateFamilies(query);
  if (!families.length) return null;

  const demonstrative = findDemonstrativeDefinition(query);
  const selfReferent = hasSelfReferentQuery(query);
  const subjectLabel = getDemonstrativeSubjectLabel(demonstrative);
  const primaryTerms = [];
  const relatedTerms = [];
  const displayTerms = [];
  const tags = [];

  families.forEach((family) => {
    primaryTerms.push(...(family.primary || []));
    displayTerms.push(...(family.display || []));
    tags.push(...(family.tags || []));

    (family.genericSentences || []).forEach((item) => {
      relatedTerms.push(item.korean);
    });

    if (selfReferent) {
      (family.selfSentences || []).forEach((item) => {
        relatedTerms.push(item.korean);
      });
    }

    if (demonstrative) {
      relatedTerms.push(demonstrative.label);
      (family.demonstrativeSentences || []).forEach((item) => {
        relatedTerms.push(typeof item.korean === "function" ? item.korean(subjectLabel) : item.korean);
      });
    }
  });

  return {
    primaryTerms: unique(primaryTerms),
    relatedTerms: unique(relatedTerms),
    displayTerms: unique(displayTerms),
    tags: sortTags(unique(tags)),
  };
}

function buildGeneratedPredicateEntries(query) {
  const trimmedQuery = String(query || "").trim();
  if (!trimmedQuery) return { vocab: [], sentences: [], suppressFallbackSentences: false };

  const families = getMatchedPredicateFamilies(trimmedQuery);
  if (!families.length) return { vocab: [], sentences: [], suppressFallbackSentences: false };

  const demonstrative = findDemonstrativeDefinition(trimmedQuery);
  const selfReferent = hasSelfReferentQuery(trimmedQuery);
  const subjectLabel = getDemonstrativeSubjectLabel(demonstrative);
  const vocab = [];
  const sentences = [];

  if (demonstrative) {
    const demoVocab = createGeneratedDemonstrativeVocab(trimmedQuery, demonstrative);
    if (demoVocab) vocab.push(demoVocab);
  }

  families.forEach((family) => {
    (family.vocab || []).forEach((item) => {
      const vocabEntry = createGeneratedPredicateEntry(
        trimmedQuery,
        item.korean,
        item.thaiKo,
        item.thaiScript,
        "vocab",
        family.tags || [],
        [...(family.primary || []), ...(family.display || [])],
        item.note
      );
      if (vocabEntry) vocab.push(vocabEntry);
    });

    let sentenceDefs = [];
    if (selfReferent && family.selfSentences?.length) {
      sentenceDefs.push(...family.selfSentences);
    }
    if (demonstrative && family.demonstrativeSentences?.length) {
      sentenceDefs.push(
        ...family.demonstrativeSentences.map((item) => ({
          korean: typeof item.korean === "function" ? item.korean(subjectLabel) : item.korean,
          thaiKo: typeof item.thaiKo === "function" ? item.thaiKo(demonstrative) : item.thaiKo,
          thaiScript: typeof item.thaiScript === "function" ? item.thaiScript(demonstrative) : item.thaiScript,
        }))
      );
    }
    sentenceDefs.push(...(family.genericSentences || []));

    sentenceDefs.forEach((item) => {
      const sentenceEntry = createGeneratedPredicateEntry(
        trimmedQuery,
        item.korean,
        item.thaiKo,
        item.thaiScript,
        "sentence",
        family.tags || [],
        [...(family.primary || []), ...(family.display || [])]
      );
      if (sentenceEntry) sentences.push(sentenceEntry);
    });
  });

  const rankedVocab = uniqueByMeaning(uniqueById(vocab)).sort(
    (left, right) =>
      getPredicateEntryPriority(right, trimmedQuery, { selfReferent, demonstrative }) -
      getPredicateEntryPriority(left, trimmedQuery, { selfReferent, demonstrative })
  );
  const rankedSentences = uniqueByMeaning(uniqueById(sentences)).sort(
    (left, right) =>
      getPredicateEntryPriority(right, trimmedQuery, { selfReferent, demonstrative }) -
      getPredicateEntryPriority(left, trimmedQuery, { selfReferent, demonstrative })
  );

  return {
    vocab: rankedVocab,
    sentences: rankedSentences,
    suppressFallbackSentences: true,
  };
}

function extractWhatQuestionObjectCompacts(query) {
  const compact = compactText(query);
  const suffix = getWhatQuestionSuffix(compact);
  if (!suffix) return [];

  const root = compact.slice(0, -suffix.length);
  const variants = [];
  if (root) {
    variants.push(root);
    if (/[은는이가을를]$/.test(root) && root.length > 1) {
      variants.push(root.slice(0, -1));
    }
  }

  const demonstrative = findDemonstrativeDefinition(query);
  if (demonstrative) {
    variants.push(...demonstrative.aliases.map((alias) => compactText(alias)));
  }

  return unique(variants.filter(Boolean)).sort((left, right) => right.length - left.length);
}

function createGeneratedWhatQuestionEntry(query, korean, thai, thaiScript, kind, tags = [], note = "") {
  if (!korean || !thai) return null;
  return hydrateEntry(
    {
      id: `generated-what-${kind}-${compactText(query)}-${compactText(korean)}`,
      kind,
      source: "generated",
      sheet: "질문 조합",
      thai,
      thaiScript,
      korean,
      note: note || "대상의 정체나 뜻을 물을 때",
      tags: sortTags(unique(["기본회화", ...tags])),
      keywords: unique([query, korean, thai, thaiScript, "뭐예요", "무엇", "질문"]),
    },
    kind
  );
}

function createGeneratedWhereQuestionEntry(query, korean, thai, thaiScript, kind, tags = [], note = "") {
  if (!korean || !thai) return null;
  return hydrateEntry(
    {
      id: `generated-where-${kind}-${compactText(query)}-${compactText(korean)}`,
      kind,
      source: "generated",
      sheet: "질문 조합",
      thai,
      thaiScript,
      korean,
      note: note || "위치나 이동 방향을 바로 물을 때",
      tags: sortTags(unique(["기본회화", "이동", ...tags])),
      keywords: unique([query, korean, thai, thaiScript, "어디", "질문", "이동"]),
    },
    kind
  );
}

function buildGeneratedWhatQuestionEntries(query, searchProfile, vocabEntries) {
  const trimmedQuery = String(query || "").trim();
  if (!trimmedQuery || !isWhatQuestionQuery(trimmedQuery)) {
    return { vocab: [], sentences: [], suppressFallbackSentences: false };
  }

  const demonstrative = findDemonstrativeDefinition(trimmedQuery);
  const objectCompacts = extractWhatQuestionObjectCompacts(trimmedQuery);
  const objectEntry = demonstrative ? null : findComposableObjectEntry(vocabEntries, objectCompacts);
  const vocab = [];
  const sentences = [];
  let objectLabel = "";
  let objectThaiKo = "";
  let objectThaiScript = "";
  let tags = ["기본회화"];

  if (demonstrative) {
    const demoVocab = createGeneratedDemonstrativeVocab(trimmedQuery, demonstrative);
    if (demoVocab) vocab.push(demoVocab);
    objectLabel = demonstrative.label;
    objectThaiKo = demonstrative.thaiKo;
    objectThaiScript = demonstrative.thaiScript;
  } else if (objectEntry) {
    vocab.push(objectEntry);
    objectLabel = getEntryPrimaryKoreanText(objectEntry) || objectEntry.korean;
    objectThaiKo = objectEntry.thai;
    objectThaiScript = getThaiScriptText(objectEntry);
    tags = sortTags(unique([...tags, ...(objectEntry.tags || [])]));
  } else {
    const vocabEntry = createGeneratedWhatQuestionEntry(trimmedQuery, "무엇", "아라이", "อะไร", "vocab");
    if (vocabEntry) vocab.push(vocabEntry);
  }

  const koreanQuestion = !objectLabel
    ? "뭐예요?"
    : ["이거", "그거", "저거"].includes(objectLabel)
      ? `${objectLabel} 뭐예요?`
      : `${attachKoreanSubjectParticle(objectLabel)} 뭐예요?`;
  const thaiQuestion = objectThaiKo ? `${objectThaiKo} 크ือ 아라이 캅` : "아라이 캅";
  const thaiScriptQuestion = objectThaiScript ? `${objectThaiScript}คืออะไรครับ` : "อะไรครับ";
  const sentenceEntry = createGeneratedWhatQuestionEntry(
    trimmedQuery,
    koreanQuestion,
    thaiQuestion,
    thaiScriptQuestion,
    "sentence",
    tags
  );
  if (sentenceEntry) sentences.push(sentenceEntry);

  return {
    vocab: uniqueByMeaning(uniqueById(vocab)),
    sentences: uniqueByMeaning(uniqueById(sentences)),
    suppressFallbackSentences: true,
  };
}

function buildGeneratedWhereQuestionEntries(query, searchProfile, vocabEntries) {
  const trimmedQuery = String(query || "").trim();
  if (!trimmedQuery || !searchProfile?.actionIds?.includes("where")) {
    return { vocab: [], sentences: [], suppressFallbackSentences: false };
  }

  const vocab = [];
  const sentences = [];
  const hasSpecificObject = Boolean(searchProfile.objectTerms.length);

  if (hasSpecificObject) {
    const objectEntry = findComposableObjectEntry(vocabEntries, searchProfile.objectTerms);
    if (objectEntry) {
      vocab.push(objectEntry);
      const objectLabel = getEntryPrimaryKoreanText(objectEntry) || objectEntry.korean;
      const objectThaiKo = objectEntry.thai;
      const objectThaiScript = getThaiScriptText(objectEntry);
      const koreanQuestion = `${attachKoreanSubjectParticle(objectLabel)} 어디예요?`;
      const thaiQuestion = `${objectThaiKo} 유 티 나이 캅`;
      const thaiScriptQuestion = `${objectThaiScript}อยู่ที่ไหนครับ`;
      const sentenceEntry = createGeneratedWhereQuestionEntry(
        trimmedQuery,
        koreanQuestion,
        thaiQuestion,
        thaiScriptQuestion,
        "sentence",
        objectEntry.tags || []
      );
      if (sentenceEntry) sentences.push(sentenceEntry);
    }

    return {
      vocab: uniqueByMeaning(uniqueById(vocab)),
      sentences: uniqueByMeaning(uniqueById(sentences)),
      suppressFallbackSentences: true,
    };
  }

  const whereVocab = createGeneratedWhereQuestionEntry(trimmedQuery, "어디", "티 나이", "ที่ไหน", "vocab");
  if (whereVocab) vocab.push(whereVocab);

  const normalized = normalizeText(trimmedQuery);
  const goStyle = /가세요|가시나요|가십니까/.test(normalized)
    ? "polite-go"
    : /가요|갑니다|가고싶|가고 싶|가야|갈게|갈래|가자|가도/.test(normalized)
      ? "go"
      : "";

  if (goStyle) {
    const koreanQuestions =
      goStyle === "polite-go" ? ["어디 가세요?", "어디로 가세요?"] : ["어디 가요?", "어디로 가요?"];
    koreanQuestions.forEach((koreanQuestion, index) => {
      const thai = index === 0 ? "빠이 나이 캅" : "빠이 티 나이 캅";
      const thaiScript = index === 0 ? "ไปไหนครับ" : "ไปที่ไหนครับ";
      const entry = createGeneratedWhereQuestionEntry(trimmedQuery, koreanQuestion, thai, thaiScript, "sentence");
      if (entry) sentences.push(entry);
    });
  } else {
    [
      ["어디예요?", "티 나이 캅", "ที่ไหนครับ"],
      ["어디에 있어요?", "유 티 나이 캅", "อยู่ที่ไหนครับ"],
    ].forEach(([koreanQuestion, thai, thaiScript]) => {
      const entry = createGeneratedWhereQuestionEntry(trimmedQuery, koreanQuestion, thai, thaiScript, "sentence");
      if (entry) sentences.push(entry);
    });
  }

  return {
    vocab: uniqueByMeaning(uniqueById(vocab)),
    sentences: uniqueByMeaning(uniqueById(sentences)),
    suppressFallbackSentences: Boolean(goStyle),
  };
}

function buildGeneratedComposedEntries(query, searchProfile, vocabEntries) {
  const trimmedQuery = String(query || "").trim();
  if (!trimmedQuery) return { vocab: [], sentences: [] };
  if (isWhatQuestionQuery(trimmedQuery)) {
    return { vocab: [], sentences: [], suppressFallbackSentences: false };
  }

  const actionId = detectComposableActionId(trimmedQuery);
  const demonstrative = findDemonstrativeDefinition(trimmedQuery);
  const predicateFamilies = getMatchedPredicateFamilies(trimmedQuery);
  if (!actionId && !demonstrative) {
    return { vocab: [], sentences: [], suppressFallbackSentences: false };
  }

  const vocab = [];
  const sentences = [];

  if (demonstrative) {
    const demoVocab = createGeneratedDemonstrativeVocab(trimmedQuery, demonstrative);
    if (demoVocab) vocab.push(demoVocab);
  }

  if (!actionId && demonstrative && predicateFamilies.length) {
    return {
      vocab: uniqueById(vocab),
      sentences: [],
      suppressFallbackSentences: false,
    };
  }

  if (actionId === "start" && demonstrative) {
    return {
      vocab: uniqueById(vocab),
      sentences: [],
      suppressFallbackSentences: false,
    };
  }

  if (!actionId) {
    if (!demonstrative) return { vocab: [], sentences: [] };

    ["request", "show", "bring"].forEach((defaultActionId) => {
      const entry = createGeneratedComposedSentence(
        trimmedQuery,
        defaultActionId,
        demonstrative.label,
        demonstrative.thaiKo,
        demonstrative.thaiScript,
        ["기본회화"],
        demonstrative.aliases
      );
      if (entry) sentences.push(entry);
    });

    return {
      vocab: uniqueById(vocab),
      sentences: uniqueById(sentences),
      suppressFallbackSentences: false,
    };
  }

  let objectLabel = "";
  let objectThaiKo = "";
  let objectThaiScript = "";
  let objectTags = [];
  let objectKeywords = [];

  if (demonstrative) {
    objectLabel = demonstrative.label;
    objectThaiKo = demonstrative.thaiKo;
    objectThaiScript = demonstrative.thaiScript;
    objectTags = ["기본회화"];
    objectKeywords = demonstrative.aliases;
  } else {
    const objectCompacts = extractComposableObjectCompacts(trimmedQuery, actionId);
    const objectEntry = findComposableObjectEntry(vocabEntries, objectCompacts);
    if (!objectEntry) {
      return {
        vocab: uniqueById(vocab),
        sentences: [],
        suppressFallbackSentences: false,
      };
    }

    if (actionId === "start" && !isStartComposableObjectEntry(objectEntry)) {
      return {
        vocab: uniqueById(vocab),
        sentences: [],
        suppressFallbackSentences: false,
      };
    }

    vocab.push(objectEntry);
    objectLabel = getEntryPrimaryKoreanText(objectEntry) || objectEntry.korean;
    objectThaiKo = objectEntry.thai;
    objectThaiScript = getThaiScriptText(objectEntry);
    objectTags = objectEntry.tags || [];
    objectKeywords = objectEntry.keywords || [];
  }

  const composed = createGeneratedComposedSentence(
    trimmedQuery,
    actionId,
    objectLabel,
    objectThaiKo,
    objectThaiScript,
    unique([...objectTags, ...(searchProfile?.tags || [])]),
    unique([...objectKeywords, ...(searchProfile?.displayTerms || [])])
  );

  return {
    vocab: uniqueById(vocab),
    sentences: composed ? [composed] : [],
    suppressFallbackSentences: Boolean(demonstrative),
  };
}

function getThaiMeaningTags(intentIds = [], objectEntry = null) {
  const tags = [];
  intentIds.forEach((intentId) => {
    if (intentId === "where") tags.push("이동");
    if (intentId === "price") tags.push("쇼핑");
    if (intentId === "help" || intentId === "notUnderstand") tags.push("기본회화");
    if (intentId === "change") tags.push("이동", "쇼핑", "일터");
    if (intentId === "bring" || intentId === "show" || intentId === "request" || intentId === "reject") {
      tags.push("기본회화");
    }
  });
  if (objectEntry?.tags?.length) {
    tags.push(...objectEntry.tags);
  }
  return sortTags(unique(tags));
}

function getEntryPrimaryKoreanText(entry) {
  const korean = String(entry?.korean || "").trim();
  if (!korean) return "";
  return korean.split(/\s*\/\s*/)[0].trim();
}

function hasKoreanBatchim(text) {
  const trimmed = String(text || "").trim();
  const lastChar = trimmed.charAt(trimmed.length - 1);
  if (!/[가-힣]/.test(lastChar)) return false;
  return (lastChar.charCodeAt(0) - 44032) % 28 !== 0;
}

function getKoreanBatchimIndex(text) {
  const trimmed = String(text || "").trim();
  const lastChar = trimmed.charAt(trimmed.length - 1);
  if (!/[가-힣]/.test(lastChar)) return -1;
  return (lastChar.charCodeAt(0) - 44032) % 28;
}

function attachKoreanSubjectParticle(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return "";
  return `${trimmed}${hasKoreanBatchim(trimmed) ? "이" : "가"}`;
}

function attachKoreanDirectionalParticle(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return "";
  const batchimIndex = getKoreanBatchimIndex(trimmed);
  if (batchimIndex < 0) return `${trimmed}로`;
  return `${trimmed}${batchimIndex === 0 || batchimIndex === 8 ? "로" : "으로"}`;
}

function isLikelyActionMeaningEntry(entry) {
  const korean = getEntryPrimaryKoreanText(entry);
  return /(?:가져오다|가져다|보여|보다|바꾸다|변경|주세요|도와주|이해하다|이해)$/u.test(korean);
}

function getThaiMeaningObjectMatchScore(entry, compactQuery) {
  if (!entry || entry.kind !== "vocab") return -1;
  if (isSentenceLikeVocabEntry(entry) || isUtilityLabelVocabEntry(entry)) return -1;
  if (isLikelyActionMeaningEntry(entry)) return -1;

  const index = buildSearchIndex(entry);
  const thaiTerms = unique([index.thai, index.thaiScript, ...index.thaiTokens, ...index.thaiScriptTokens]).filter(
    (term) => term && term.length >= 2 && !isThaiMeaningStopword(term)
  );
  let best = -1;

  thaiTerms.forEach((term) => {
    if (compactQuery === term) {
      best = Math.max(best, 160);
      return;
    }
    if (compactQuery.includes(term)) {
      best = Math.max(best, 110 + term.length * 8);
      return;
    }
    if (term.includes(compactQuery) && compactQuery.length >= 2) {
      best = Math.max(best, 80 + compactQuery.length * 5);
    }
  });

  if (entry.source === "generated-bulk") best -= 45;
  if (!getThaiScriptText(entry)) best -= 14;
  return best;
}

function findThaiMeaningObjectEntry(entries, query) {
  const compactQuery = compactText(normalizeThaiMeaningQuery(query));
  if (!compactQuery) return null;

  const seedProfile = {
    query,
    compact: compactQuery,
    queryDirection: "thai",
    directTerms: [compactQuery],
    primaryTerms: [compactQuery],
    relatedTerms: [],
    objectTerms: [],
    actionTerms: [],
    anchorTerms: [compactQuery],
    templateTerms: [],
  };
  const candidateEntries = collectCandidateEntries(entries, seedProfile);

  const ranked = candidateEntries
    .filter((entry) => entry.kind === "vocab" && matchesScenario(entry))
    .map((entry) => ({
      entry,
      score: getThaiMeaningObjectMatchScore(entry, compactQuery),
    }))
    .filter((item) => item.score >= 96)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      const leftThai = Boolean(getThaiScriptText(left.entry));
      const rightThai = Boolean(getThaiScriptText(right.entry));
      if (leftThai !== rightThai) return Number(rightThai) - Number(leftThai);
      return left.entry.korean.length - right.entry.korean.length;
    });

  return ranked[0]?.entry || null;
}

function analyzeThaiMeaningQuery(query, entries = []) {
  const direction = detectQueryDirection(query);
  if (direction !== "thai" && direction !== "mixed") return null;

  const normalized = normalizeThaiMeaningQuery(query);
  const compact = compactText(normalized);
  if (!compact || compact.length < 2) return null;

  const detectedIntentIds = detectThaiMeaningIntentIds(normalized);
  const intentIds = detectedIntentIds.filter((intentId) => {
    if (intentId === "request" && (detectedIntentIds.includes("reject") || detectedIntentIds.includes("bring"))) {
      return false;
    }
    if (intentId === "show" && detectedIntentIds.includes("notUnderstand")) {
      return false;
    }
    return true;
  });
  const demonstrative = findThaiDemonstrativeMeaning(normalized);
  const objectEntry = findThaiMeaningObjectEntry(entries, normalized);
  const objectLabel = demonstrative?.label || getEntryPrimaryKoreanText(objectEntry) || "";
  const tags = getThaiMeaningTags(intentIds, objectEntry);
  const primaryTerms = [];
  const relatedTerms = [];
  const displayTerms = [];
  const objectTerms = [];
  const actionTerms = [];
  const templateTerms = [];

  if (objectLabel) {
    primaryTerms.push(objectLabel);
    displayTerms.push(objectLabel);
    objectTerms.push(objectLabel);
  }

  if (intentIds.includes("where")) {
    primaryTerms.push("어디", "찾다");
    relatedTerms.push(objectLabel ? `${objectLabel} 어디예요?` : "어디예요?");
    displayTerms.push("어디");
    actionTerms.push("어디");
    templateTerms.push(objectLabel ? `${objectLabel} 어디예요?` : "어디예요?");
  }
  if (intentIds.includes("price")) {
    primaryTerms.push("얼마", "가격");
    relatedTerms.push(objectLabel && objectLabel !== "가격" ? `${objectLabel} 얼마예요?` : "얼마예요?");
    displayTerms.push("가격");
    actionTerms.push("얼마");
    templateTerms.push(objectLabel && objectLabel !== "가격" ? `${objectLabel} 얼마예요?` : "얼마예요?");
  }
  if (intentIds.includes("help")) {
    primaryTerms.push("도와주세요", "도와주다");
    relatedTerms.push("도와주세요");
    displayTerms.push("도와주세요");
    actionTerms.push("도와주세요");
    templateTerms.push("도와주세요");
  }
  if (intentIds.includes("notUnderstand")) {
    primaryTerms.push("이해 못하다", "이해");
    relatedTerms.push("이해 못해요", "한 번 더 말해주세요");
    displayTerms.push("이해");
    actionTerms.push("이해");
    templateTerms.push("이해 못해요");
  }
  if (intentIds.includes("change")) {
    primaryTerms.push("바꾸다", "변경");
    relatedTerms.push(objectLabel ? `${objectLabel} 바꿔 주세요` : "바꿔 주세요");
    displayTerms.push("바꾸다");
    actionTerms.push("바꾸다");
    templateTerms.push(objectLabel ? `${objectLabel} 바꿔 주세요` : "바꿔 주세요");
  }
  if (intentIds.includes("bring")) {
    primaryTerms.push("가져오다", "가져다 주세요");
    relatedTerms.push(objectLabel ? `${objectLabel} 가져다 주세요` : "가져다 주세요");
    displayTerms.push("가져오다");
    actionTerms.push("가져오다");
    templateTerms.push(objectLabel ? `${objectLabel} 가져다 주세요` : "가져다 주세요");
  }
  if (intentIds.includes("show")) {
    primaryTerms.push("보여주세요", "보다");
    relatedTerms.push(objectLabel ? `${objectLabel} 보여 주세요` : "보여 주세요");
    displayTerms.push("보여주세요");
    actionTerms.push("보여주세요");
    templateTerms.push(objectLabel ? `${objectLabel} 보여 주세요` : "보여 주세요");
  }
  if (intentIds.includes("request")) {
    primaryTerms.push("주세요");
    relatedTerms.push(objectLabel ? `${objectLabel} 주세요` : "주세요");
    displayTerms.push("주세요");
    actionTerms.push("주세요");
    templateTerms.push(objectLabel ? `${objectLabel} 주세요` : "주세요");
  }
  if (intentIds.includes("reject")) {
    primaryTerms.push("말고", "싫어");
    relatedTerms.push(demonstrative ? `${demonstrative.label} 말고 다른 거 주세요` : "말고 다른 거 주세요", "싫어요");
    displayTerms.push("말고");
    actionTerms.push("말고");
    templateTerms.push(demonstrative ? `${demonstrative.label} 말고 다른 거 주세요` : "말고 다른 거 주세요");
  }
  if (!intentIds.length && demonstrative) {
    relatedTerms.push(demonstrative.label);
  }

  const strongIntents = ["where", "price", "help", "notUnderstand", "change", "bring", "show", "request", "reject"];
  const suppressFallbackSentences = intentIds.some((intentId) => strongIntents.includes(intentId));

  return {
    normalized,
    compact,
    intentIds,
    demonstrative,
    objectEntry,
    objectLabel,
    tags,
    primaryTerms: unique(primaryTerms),
    relatedTerms: unique(relatedTerms),
    displayTerms: unique(displayTerms),
    objectTerms: unique(objectTerms),
    actionTerms: unique(actionTerms),
    templateTerms: unique(templateTerms),
    suppressFallbackSentences,
  };
}

function getThaiMeaningAnalysis(query, entries = []) {
  const direction = detectQueryDirection(query);
  if (direction !== "thai" && direction !== "mixed") return null;

  const compact = compactText(normalizeThaiMeaningQuery(query));
  if (!compact || compact.length < 2) return null;

  const cacheKey = [state.scenario, state.customRevision, getSearchCollectionCacheId(entries), compact].join("||");
  if (thaiMeaningAnalysisCache.has(cacheKey)) {
    return thaiMeaningAnalysisCache.get(cacheKey);
  }

  const analysis = analyzeThaiMeaningQuery(query, entries);
  thaiMeaningAnalysisCache.set(cacheKey, analysis);
  if (thaiMeaningAnalysisCache.size > 96) {
    const oldestKey = thaiMeaningAnalysisCache.keys().next().value;
    if (oldestKey) thaiMeaningAnalysisCache.delete(oldestKey);
  }
  return analysis;
}

function buildThaiMeaningHints(query, entries = []) {
  const analysis = getThaiMeaningAnalysis(query, entries);
  if (!analysis) {
    return {
      primaryTerms: [],
      relatedTerms: [],
      displayTerms: [],
      tags: [],
      objectTerms: [],
      actionTerms: [],
      templateTerms: [],
    };
  }

  return {
    primaryTerms: analysis.primaryTerms,
    relatedTerms: analysis.relatedTerms,
    displayTerms: analysis.displayTerms,
    tags: analysis.tags,
    objectTerms: analysis.objectTerms,
    actionTerms: analysis.actionTerms,
    templateTerms: analysis.templateTerms,
  };
}

function createGeneratedThaiMeaningEntry(query, korean, kind, tags = [], note = "") {
  const thaiText = String(query || "").trim();
  if (!thaiText || !korean) return null;

  return hydrateEntry(
    {
      id: `generated-thai-meaning-${kind}-${compactText(query)}-${compactText(korean)}`,
      kind,
      source: "generated",
      sheet: "태국어 해석",
      thai: thaiText,
      thaiScript: /[\u0E00-\u0E7F]/.test(thaiText) ? thaiText : "",
      korean,
      note: note || "태국어 입력을 한국어 뜻으로 바로 해석",
      tags: sortTags(unique(["기본회화", ...tags])),
      keywords: unique([query, thaiText, korean, "태국어 검색", "한국어 뜻"]),
    },
    kind
  );
}

function buildGeneratedThaiMeaningEntries(query, searchProfile, vocabEntries) {
  const analysis = getThaiMeaningAnalysis(query, vocabEntries);
  if (!analysis) {
    return { vocab: [], sentences: [], suppressFallbackSentences: false };
  }

  const vocab = [];
  const sentences = [];
  const showObjectVocab =
    analysis.objectLabel &&
    !analysis.intentIds.includes("help") &&
    !analysis.intentIds.includes("notUnderstand");

  if (showObjectVocab) {
    const vocabEntry = createGeneratedThaiMeaningEntry(
      query,
      analysis.objectLabel,
      "vocab",
      analysis.tags,
      "태국어 문장에서 핵심 대상을 먼저 해석"
    );
    if (vocabEntry) vocab.push(vocabEntry);
  }

  if (analysis.intentIds.includes("help")) {
    const vocabEntry = createGeneratedThaiMeaningEntry(query, "도와주세요", "vocab", analysis.tags);
    if (vocabEntry) vocab.push(vocabEntry);
    const sentenceEntry = createGeneratedThaiMeaningEntry(query, "도와주세요", "sentence", analysis.tags);
    if (sentenceEntry) sentences.push(sentenceEntry);
  }

  if (analysis.intentIds.includes("notUnderstand")) {
    const vocabEntry = createGeneratedThaiMeaningEntry(query, "이해 못하다", "vocab", analysis.tags);
    if (vocabEntry) vocab.push(vocabEntry);
    ["이해 못해요", "한 번 더 말해주세요"].forEach((text) => {
      const entry = createGeneratedThaiMeaningEntry(query, text, "sentence", analysis.tags);
      if (entry) sentences.push(entry);
    });
  }

  if (analysis.intentIds.includes("where")) {
    if (!analysis.objectLabel) {
      const vocabEntry = createGeneratedThaiMeaningEntry(query, "어디", "vocab", analysis.tags);
      if (vocabEntry) vocab.push(vocabEntry);
    }
    const entry = createGeneratedThaiMeaningEntry(
      query,
      analysis.objectLabel ? `${attachKoreanSubjectParticle(analysis.objectLabel)} 어디예요?` : "어디예요?",
      "sentence",
      analysis.tags
    );
    if (entry) sentences.push(entry);
  }

  if (analysis.intentIds.includes("price")) {
    const vocabEntry = createGeneratedThaiMeaningEntry(query, "가격", "vocab", analysis.tags);
    if (vocabEntry) vocab.push(vocabEntry);
    const entry = createGeneratedThaiMeaningEntry(
      query,
      analysis.objectLabel && analysis.objectLabel !== "가격" ? `${analysis.objectLabel} 얼마예요?` : "얼마예요?",
      "sentence",
      analysis.tags
    );
    if (entry) sentences.push(entry);
  }

  if (analysis.intentIds.includes("change")) {
    if (!analysis.objectLabel) {
      const vocabEntry = createGeneratedThaiMeaningEntry(query, "바꾸다", "vocab", analysis.tags);
      if (vocabEntry) vocab.push(vocabEntry);
    }
    const entry = createGeneratedThaiMeaningEntry(
      query,
      analysis.objectLabel ? `${analysis.objectLabel} 바꿔 주세요` : "바꿔 주세요",
      "sentence",
      analysis.tags
    );
    if (entry) sentences.push(entry);
  }

  if (analysis.intentIds.includes("bring")) {
    if (!analysis.objectLabel) {
      const vocabEntry = createGeneratedThaiMeaningEntry(query, "가져다 주세요", "vocab", analysis.tags);
      if (vocabEntry) vocab.push(vocabEntry);
    }
    const entry = createGeneratedThaiMeaningEntry(
      query,
      analysis.objectLabel ? `${analysis.objectLabel} 가져다 주세요` : "가져다 주세요",
      "sentence",
      analysis.tags
    );
    if (entry) sentences.push(entry);
  }

  if (analysis.intentIds.includes("show")) {
    if (!analysis.objectLabel) {
      const vocabEntry = createGeneratedThaiMeaningEntry(query, "보여 주세요", "vocab", analysis.tags);
      if (vocabEntry) vocab.push(vocabEntry);
    }
    const entry = createGeneratedThaiMeaningEntry(
      query,
      analysis.objectLabel ? `${analysis.objectLabel} 보여 주세요` : "보여 주세요",
      "sentence",
      analysis.tags
    );
    if (entry) sentences.push(entry);
  }

  if (analysis.intentIds.includes("request")) {
    if (!analysis.objectLabel) {
      const vocabEntry = createGeneratedThaiMeaningEntry(query, "주세요", "vocab", analysis.tags);
      if (vocabEntry) vocab.push(vocabEntry);
    }
    const entry = createGeneratedThaiMeaningEntry(
      query,
      analysis.objectLabel ? `${analysis.objectLabel} 주세요` : "주세요",
      "sentence",
      analysis.tags
    );
    if (entry) sentences.push(entry);
  }

  if (analysis.intentIds.includes("reject")) {
    const vocabEntry = createGeneratedThaiMeaningEntry(query, "말고", "vocab", analysis.tags);
    if (vocabEntry) vocab.push(vocabEntry);
    const entry = createGeneratedThaiMeaningEntry(
      query,
      analysis.demonstrative ? `${analysis.demonstrative.label} 말고 다른 거 주세요` : "말고 다른 거 주세요",
      "sentence",
      analysis.tags
    );
    if (entry) sentences.push(entry);
  }

  return {
    vocab: uniqueByMeaning(uniqueById(vocab)),
    sentences: uniqueByMeaning(uniqueById(sentences)),
    suppressFallbackSentences: analysis.suppressFallbackSentences,
  };
}

function extractStandaloneTimeQuery(query) {
  const normalized = normalizeText(query);
  const matched = normalized.match(TIME_EXTRACT_REGEX);
  if (!matched) return "";
  const extracted = matched[0].trim();
  const remainder = normalized
    .replace(extracted, " ")
    .replace(/(인데|인대|예요|이에요|입니다|이야|야|쯤|정도|쯔음|쯤에|때|때요|네요)/g, " ")
    .replace(/[은는이가을를요.!?,]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return remainder ? "" : extracted;
}

function convertSmallNumberBundle(value) {
  const converted = convertIntegerToThaiTokens(String(value));
  return {
    script: converted.script.join(""),
    latin: converted.latin.join(" "),
    ko: converted.ko.join(" "),
  };
}

function parseTimeQuery(query) {
  const extracted = extractStandaloneTimeQuery(query);
  if (!extracted) return null;

  const normalized = normalizeText(extracted);
  let meridiem = "";
  let body = normalized;
  if (body.startsWith("오전")) {
    meridiem = "am";
    body = body.replace(/^오전\s*/, "");
  } else if (body.startsWith("오후")) {
    meridiem = "pm";
    body = body.replace(/^오후\s*/, "");
  }

  let hour = null;
  let minute = 0;
  let usedHalf = false;
  let matched = body.match(/^(\d{1,2}):(\d{2})$/);
  if (matched) {
    hour = Number(matched[1]);
    minute = Number(matched[2]);
  } else {
    matched = body.match(/^(\d{1,2})\s*시\s*반$/);
    if (matched) {
      hour = Number(matched[1]);
      minute = 30;
      usedHalf = true;
    } else {
      matched = body.match(/^(\d{1,2})\s*시(?:\s*(\d{1,2})\s*분)?$/);
      if (!matched) return null;
      hour = Number(matched[1]);
      minute = matched[2] ? Number(matched[2]) : 0;
    }
  }

  if (!Number.isInteger(hour) || !Number.isInteger(minute) || minute < 0 || minute > 59) return null;

  let hour24 = hour;
  if (meridiem === "am") {
    if (hour < 1 || hour > 12) return null;
    hour24 = hour === 12 ? 0 : hour;
  } else if (meridiem === "pm") {
    if (hour < 1 || hour > 12) return null;
    hour24 = hour === 12 ? 12 : hour + 12;
  } else if (hour < 0 || hour > 23) {
    return null;
  }

  const displayHour = meridiem ? hour : hour24;
  const hourBundle = convertSmallNumberBundle(displayHour);
  const minuteBundle = convertSmallNumberBundle(minute);
  const meridiemWord = meridiem ? TIME_WORDS[meridiem] : null;
  const phraseScript = `${meridiemWord ? `${meridiemWord.script}` : ""}${hourBundle.script}${TIME_WORDS.clock.script}${minute ? `${minuteBundle.script}${TIME_WORDS.minute.script}` : ""}`;
  const phraseLatin = `${meridiemWord ? `${meridiemWord.latin} ` : ""}${hourBundle.latin} ${TIME_WORDS.clock.latin}${minute ? ` ${minuteBundle.latin} ${TIME_WORDS.minute.latin}` : ""}`.trim();
  const phraseKo = `${meridiemWord ? `${meridiemWord.ko} ` : ""}${hourBundle.ko} ${TIME_WORDS.clock.ko}${minute ? ` ${minuteBundle.ko} ${TIME_WORDS.minute.ko}` : ""}`.trim();
  const digital = `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const thaiDigital = toThaiNumeralDigits(digital);
  const canonicalKorean = `${meridiemWord ? `${meridiemWord.korean} ` : ""}${displayHour}시${minute ? ` ${minute}분` : ""}`;
  const halfKorean = minute === 30 ? `${meridiemWord ? `${meridiemWord.korean} ` : ""}${displayHour}시 반` : "";
  const extraKeywords = unique([
    query,
    extracted,
    canonicalKorean,
    canonicalKorean.replace(/\s+/g, ""),
    halfKorean,
    halfKorean.replace(/\s+/g, ""),
    digital,
    thaiDigital,
    `${displayHour}시`,
    minute ? `${minute}분` : "",
    usedHalf ? `${displayHour}시반` : "",
    "시간",
  ]);

  return {
    extracted,
    canonicalKorean,
    digital,
    thaiDigital,
    phraseScript,
    phraseLatin,
    phraseKo,
    minute,
    usedHalf,
    halfKorean,
    keywords: extraKeywords,
  };
}

function buildGeneratedTimeEntries(query) {
  const parsed = parseTimeQuery(query);
  if (!parsed) return { vocab: [], sentences: [] };

  const ambiguityNote = !normalizeText(parsed.extracted).startsWith("오전") && !normalizeText(parsed.extracted).startsWith("오후")
    ? "오전/오후 없이 검색해서 문맥에 따라 달라질 수 있습니다"
    : "";
  const noteSuffix = ambiguityNote ? ` · ${ambiguityNote}` : "";

  const vocabEntries = [
    hydrateEntry(
      {
        id: `generated-time-read-${parsed.digital}`,
        kind: "vocab",
        source: "generated",
        sheet: "시간 변환",
        thai: parsed.phraseKo,
        thaiScript: parsed.phraseScript,
        korean: parsed.canonicalKorean,
        note: `시간을 문장형으로 풀어쓴 표현 · 영문 표기: ${parsed.phraseLatin}${noteSuffix}`,
        tags: ["숫자·시간"],
        keywords: parsed.keywords,
      },
      "vocab"
    ),
    hydrateEntry(
      {
        id: `generated-time-digital-${parsed.digital}`,
        kind: "vocab",
        source: "generated",
        sheet: "시간 변환",
        thai: `${parsed.digital} 너`,
        thaiScript: `${parsed.thaiDigital} น.`,
        korean: `${parsed.canonicalKorean} 숫자 표기`,
        note: `시간을 숫자로 바로 보여주기${noteSuffix}`,
        tags: ["숫자·시간"],
        keywords: [...parsed.keywords, "숫자 시간", "시간 표기"],
      },
      "vocab"
    ),
  ];

  const sentenceEntries = [
    hydrateEntry(
      {
        id: `generated-time-now-${parsed.digital}`,
        kind: "sentence",
        source: "generated",
        sheet: "시간 변환",
        thai: `${TIME_WORDS.now.ko} ${parsed.digital} 너`,
        thaiScript: `${TIME_WORDS.now.script} ${parsed.thaiDigital} น.`,
        korean: `지금은 ${parsed.canonicalKorean}예요`,
        note: `검색한 시간을 그대로 넣은 시간 문장${noteSuffix}`,
        tags: ["숫자·시간"],
        keywords: parsed.keywords,
      },
      "sentence"
    ),
    hydrateEntry(
      {
        id: `generated-time-meet-${parsed.digital}`,
        kind: "sentence",
        source: "generated",
        sheet: "시간 변환",
        thai: `${TIME_WORDS.meet.ko} ${parsed.digital} 너`,
        thaiScript: `${TIME_WORDS.meet.script} ${parsed.thaiDigital} น.`,
        korean: `${parsed.canonicalKorean}에 만나요`,
        note: "약속 시간을 말할 때",
        tags: ["숫자·시간", "기본회화"],
        keywords: parsed.keywords,
      },
      "sentence"
    ),
    hydrateEntry(
      {
        id: `generated-time-go-${parsed.digital}`,
        kind: "sentence",
        source: "generated",
        sheet: "시간 변환",
        thai: `${TIME_WORDS.go.ko} ${parsed.digital} 너`,
        thaiScript: `${TIME_WORDS.go.script} ${parsed.thaiDigital} น.`,
        korean: `${parsed.canonicalKorean}에 가요`,
        note: "출발 시간을 말할 때",
        tags: ["숫자·시간", "이동"],
        keywords: parsed.keywords,
      },
      "sentence"
    ),
  ];

  if (parsed.minute === 30) {
    sentenceEntries.push(
      hydrateEntry(
        {
          id: `generated-time-half-${parsed.digital}`,
          kind: "sentence",
          source: "generated",
          sheet: "시간 변환",
          thai: `${parsed.phraseKo} (반)`,
          thaiScript: `${parsed.phraseScript}`,
          korean: parsed.halfKorean || `${parsed.canonicalKorean} 반`,
          note: "반 시각으로 기억하기 쉽게 한 번 더 보여줍니다",
          tags: ["숫자·시간"],
          keywords: [...parsed.keywords, "반"],
        },
        "sentence"
      )
    );
  }

  return {
    vocab: vocabEntries,
    sentences: sentenceEntries,
  };
}

function isTimeQuestionQuery(query) {
  return TIME_QUESTION_REGEX.test(compactText(query));
}

function buildGeneratedTimeQuestionEntries(query) {
  if (!isTimeQuestionQuery(query)) return { vocab: [], sentences: [] };

  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const nowTime = parseTimeQuery(`${hour}:${String(minute).padStart(2, "0")}`);
  if (!nowTime) return { vocab: [], sentences: [] };

  const keywords = unique([
    query,
    "몇 시",
    "몇시",
    "지금 몇 시예요",
    "현재 시간",
    nowTime.canonicalKorean,
    nowTime.digital,
    "시간",
  ]);

  return {
    vocab: [
      hydrateEntry(
        {
          id: `generated-time-question-word-${nowTime.digital}`,
          kind: "vocab",
          source: "generated",
          sheet: "시간 질문",
          thai: TIME_WORDS.whatTime.ko,
          thaiScript: TIME_WORDS.whatTime.script,
          korean: "몇 시",
          note: `시간을 물을 때 쓰는 핵심 표현 · 현재 기기 시간: ${nowTime.canonicalKorean}`,
          tags: ["숫자·시간"],
          keywords,
        },
        "vocab"
      ),
      hydrateEntry(
        {
          id: `generated-time-question-now-${nowTime.digital}`,
          kind: "vocab",
          source: "generated",
          sheet: "시간 질문",
          thai: nowTime.phraseKo,
          thaiScript: nowTime.phraseScript,
          korean: `현재 시간 ${nowTime.canonicalKorean}`,
          note: `현재 기기 시간을 태국어로 바로 보여줍니다 · 영문 표기: ${nowTime.phraseLatin}`,
          tags: ["숫자·시간"],
          keywords,
        },
        "vocab"
      ),
    ],
    sentences: [
      hydrateEntry(
        {
          id: `generated-time-question-ask-${nowTime.digital}`,
          kind: "sentence",
          source: "generated",
          sheet: "시간 질문",
          thai: TIME_WORDS.nowQuestion.ko,
          thaiScript: TIME_WORDS.nowQuestion.script,
          korean: "지금 몇 시예요?",
          note: "현재 시간을 물을 때 바로 보여주기",
          tags: ["숫자·시간", "기본회화"],
          keywords,
        },
        "sentence"
      ),
      hydrateEntry(
        {
          id: `generated-time-question-answer-${nowTime.digital}`,
          kind: "sentence",
          source: "generated",
          sheet: "시간 질문",
          thai: `${TIME_WORDS.now.ko} ${nowTime.digital} 너`,
          thaiScript: `${TIME_WORDS.now.script} ${nowTime.thaiDigital} น.`,
          korean: `지금은 ${nowTime.canonicalKorean}예요`,
          note: "현재 기기 시간을 그대로 답변형으로 보여줍니다",
          tags: ["숫자·시간"],
          keywords,
        },
        "sentence"
      ),
      hydrateEntry(
        {
          id: `generated-time-question-meet-${nowTime.digital}`,
          kind: "sentence",
          source: "generated",
          sheet: "시간 질문",
          thai: "너 약 쩌 깐 끼 몽 캅",
          thaiScript: "นัดเจอกันกี่โมงครับ",
          korean: "몇 시에 만나요?",
          note: "약속 시간을 물을 때",
          tags: ["숫자·시간", "기본회화"],
          keywords,
        },
        "sentence"
      ),
    ],
  };
}

function collectSeedEntries(entries, compactQuery, intentHints = null) {
  if (!compactQuery) return [];

  const objectTerms = unique((intentHints?.objectTerms || []).map((item) => compactText(item)).filter(Boolean));
  const actionTerms = unique((intentHints?.actionTerms || []).map((item) => compactText(item)).filter(Boolean));
  const templateTerms = unique((intentHints?.templateTerms || []).map((item) => compactText(item)).filter(Boolean));
  const seedProfile = {
    query: compactQuery,
    compact: compactQuery,
    directTerms: [compactQuery],
    primaryTerms: unique([compactQuery, ...objectTerms, ...actionTerms, ...templateTerms]),
    relatedTerms: [],
    objectTerms,
    actionTerms,
    templateTerms,
    anchorTerms: [compactQuery],
  };
  const candidateEntries = collectCandidateEntries(entries, seedProfile);

  return candidateEntries
    .filter((entry) => entry.source !== "generated-bulk")
    .map((entry) => {
      const index = buildSearchIndex(entry);
      const fields = [index.korean, index.thai, index.thaiScript, index.note, ...index.keywords, ...index.tokens];
      let score = getEntrySourceScore(entry, entry.kind);
      let lexicalHits = 0;

      fields.forEach((field) => {
        if (!field) return;
        if (field === compactQuery) {
          lexicalHits += 3;
          score += 240;
          return;
        }
        if (field.startsWith(compactQuery) || compactQuery.startsWith(field)) {
          lexicalHits += 2;
          score += 110;
          return;
        }
        if (compactQuery.length >= 2 && field.includes(compactQuery)) {
          lexicalHits += 1;
          score += 90;
        }
      });

      const objectHits = objectTerms.filter((term) => matchesIndexTerm(index, term)).length;
      const actionHits = actionTerms.filter((term) => matchesIndexTerm(index, term)).length;
      const templateHits = templateTerms.filter((term) => matchesTemplateTerm(index, term)).length;

      score += objectHits * 170 + actionHits * 115 + templateHits * 260;

      if (objectTerms.length && !objectHits && !templateHits) {
        score -= 140;
      }
      if (actionTerms.length && !actionHits && !templateHits) {
        score -= 70;
      }
      if (isGeneratedBulkTemplateEntry(entry) && !templateHits) {
        score -= 85;
      }

      const lengthDelta = Math.max(0, index.korean.length - compactQuery.length - 2);
      score -= Math.min(lengthDelta * 9, 135);

      return { entry, score, lexicalHits, objectHits, actionHits, templateHits };
    })
    .filter(
      (item) =>
        item.score > 0 &&
        (item.lexicalHits > 0 || item.objectHits > 0 || item.actionHits > 0 || item.templateHits > 0)
    )
    .sort((left, right) => {
      if (right.templateHits !== left.templateHits) return right.templateHits - left.templateHits;
      if (right.objectHits !== left.objectHits) return right.objectHits - left.objectHits;
      if (right.actionHits !== left.actionHits) return right.actionHits - left.actionHits;
      if (right.lexicalHits !== left.lexicalHits) return right.lexicalHits - left.lexicalHits;
      if (right.score !== left.score) return right.score - left.score;
      return left.entry.korean.length - right.entry.korean.length;
    })
    .slice(0, RESULT_LIMITS.seedEntries)
    .map((item) => item.entry);
}

function getSeedExpansionTerms(entry, compactQuery) {
  const index = buildSearchIndex(entry);
  return unique([entry.korean, ...(entry.keywords || []), ...index.tokens])
    .map((item) => normalizeText(item))
    .filter(Boolean)
    .filter((item) => {
      const compactItem = compactText(item);
      if (!compactItem) return false;
      if ((compactItem.length <= 1 && !SINGLE_SYLLABLE_ANCHORS.has(compactItem)) || GENERIC_SEARCH_TERMS.has(compactItem)) {
        return false;
      }
      return compactItem === compactQuery || compactItem.includes(compactQuery) || compactQuery.includes(compactItem);
    });
}

function buildSearchProfile(query, entries = []) {
  const trimmedQuery = String(query || "").trim();
  const normalized = normalizeText(trimmedQuery);
  const queryDirection = detectQueryDirection(trimmedQuery);
  const thaiOnlyQuery = queryDirection === "thai";
  const compact = compactText(trimmedQuery);
  const rawTokens = tokenize(trimmedQuery);
  const compactPhraseRoots = thaiOnlyQuery ? [] : extractCompactPhraseRoots(trimmedQuery);
  const expandedVariants = thaiOnlyQuery ? rawTokens : expandQueryVariants(trimmedQuery, rawTokens);
  const expandedCompacts = expandedVariants.map((item) => compactText(item)).filter(Boolean);
  const patternTexts = unique([trimmedQuery, normalized, compact, ...expandedVariants, ...expandedCompacts]);
  const intentHints = thaiOnlyQuery
    ? {
        objectIds: [],
        actionIds: [],
        objectTerms: [],
        actionTerms: [],
        primaryTerms: [],
        relatedTerms: [],
        templateTerms: [],
        displayTerms: [],
        tags: [],
        preferredTags: [],
        avoidTags: [],
        blockedTerms: [],
      }
    : buildIntentHints(trimmedQuery, patternTexts);
  const predicateHints = thaiOnlyQuery ? null : buildPredicateIntentHints(trimmedQuery);
  const thaiMeaningHints =
    queryDirection === "thai" || queryDirection === "mixed" ? buildThaiMeaningHints(trimmedQuery, entries) : null;
  const hasStrongIntent = Boolean(
    (intentHints.objectTerms && intentHints.objectTerms.length) ||
      (intentHints.actionTerms && intentHints.actionTerms.length) ||
      (intentHints.templateTerms && intentHints.templateTerms.length) ||
      (predicateHints?.primaryTerms && predicateHints.primaryTerms.length) ||
      (thaiMeaningHints?.objectTerms && thaiMeaningHints.objectTerms.length) ||
      (thaiMeaningHints?.actionTerms && thaiMeaningHints.actionTerms.length) ||
      (thaiMeaningHints?.templateTerms && thaiMeaningHints.templateTerms.length)
  );
  const preferredTags = unique((intentHints.preferredTags || []).filter(Boolean));
  const avoidTags = unique(
    (intentHints.avoidTags || []).filter((tag) => tag && !preferredTags.includes(tag))
  );
  const aliasTexts = unique([compact, ...expandedCompacts]);
  const endingTexts = unique([compact, ...rawTokens.map((item) => compactText(item)).filter(Boolean)]);
  const primaryTerms = [...rawTokens, ...expandedVariants];
  const relatedTerms = [];
  const displayTerms = [];
  const tags = [];
  const objectIds = [];
  const actionIds = [];

  primaryTerms.push(...(intentHints.primaryTerms || []));
  primaryTerms.push(...compactPhraseRoots);
  relatedTerms.push(...(intentHints.relatedTerms || []));
  displayTerms.push(...compactPhraseRoots);
  displayTerms.push(...(intentHints.displayTerms || []));
  tags.push(...(intentHints.tags || []));
  objectIds.push(...(intentHints.objectIds || []));
  actionIds.push(...(intentHints.actionIds || []));
  if (predicateHints) {
    primaryTerms.push(...(predicateHints.primaryTerms || []));
    relatedTerms.push(...(predicateHints.relatedTerms || []));
    displayTerms.push(...(predicateHints.displayTerms || []));
    tags.push(...(predicateHints.tags || []));
  }
  if (thaiMeaningHints) {
    primaryTerms.push(...(thaiMeaningHints.primaryTerms || []));
    relatedTerms.push(...(thaiMeaningHints.relatedTerms || []));
    displayTerms.push(...(thaiMeaningHints.displayTerms || []));
    tags.push(...(thaiMeaningHints.tags || []));
  }

  if (!thaiOnlyQuery) {
    QUERY_BUNDLES.forEach((rule) => {
      if (rule.patterns.some((pattern) => patternTexts.some((text) => pattern.test(text)))) {
        primaryTerms.push(...(rule.primary || []));
        relatedTerms.push(...(rule.related || []));
        displayTerms.push(...(rule.display || []));
        tags.push(...(rule.tags || []));
      }
    });

    QUERY_PARTS.forEach((rule) => {
      if (rule.patterns.some((pattern) => patternTexts.some((text) => pattern.test(text)))) {
        primaryTerms.push(...(rule.primary || []));
        relatedTerms.push(...(rule.related || []));
        displayTerms.push(...(rule.display || []));
        tags.push(...(rule.tags || []));
      }
    });

    QUERY_ALIASES.forEach((rule) => {
      if (rule.matches.some((item) => aliasTexts.some((text) => text.includes(compactText(item))))) {
        primaryTerms.push(...(rule.primary || []));
        relatedTerms.push(...(rule.related || []));
        displayTerms.push(...(rule.display || []));
        tags.push(...(rule.tags || []));
      }
    });

    QUERY_ENDINGS.forEach((rule) => {
      if (endingTexts.some((text) => text.endsWith(compactText(rule.suffix)))) {
        primaryTerms.push(...(rule.primary || []));
        relatedTerms.push(...(rule.related || []));
        displayTerms.push(...(rule.display || []));
      }
    });

    if (!hasStrongIntent && !isTimeQuestionQuery(trimmedQuery)) {
      collectSeedEntries(entries, compact, intentHints).forEach((entry) => {
        const seedTerms = getSeedExpansionTerms(entry, compact);
        primaryTerms.push(...seedTerms);
        relatedTerms.push(...seedTerms);
        displayTerms.push(entry.korean);
        tags.push(...(entry.tags || []));
      });
    }
  }

  const intentBlockedTerms = unique((intentHints.blockedTerms || []).map((item) => compactText(item)).filter(Boolean));
  const primaryCompacts = dropGenericTermsWhenSpecific(
    primaryTerms
      .map((item) => compactText(item))
      .filter(Boolean)
      .filter((item) => item.length > 1 || !STOPWORDS.has(item))
  );
  const relatedCompacts = dropGenericTermsWhenSpecific(
    relatedTerms
      .map((item) => compactText(item))
      .filter(Boolean)
      .filter((item) => item.length > 1 || !STOPWORDS.has(item))
      .filter((item) => !primaryCompacts.includes(item))
  );
  const hungerQuery = /배고프|허기|시장해/.test(compact);
  const hungerBlockedTerms = new Set(["배", "보트", "복부", "아프다", "병원", "약"]);
  const blockedTerms = new Set([
    ...intentBlockedTerms,
    ...(hungerQuery ? Array.from(hungerBlockedTerms) : []),
  ]);
  const filteredPrimaryCompacts = primaryCompacts.filter((item) => !blockedTerms.has(item));
  const filteredRelatedCompacts = relatedCompacts.filter((item) => !blockedTerms.has(item));
  const explicitRequestQuery =
    /(?:주세요|주세여|부탁|있어요|있나요|필요해요|없어요|없나요|어디예요|어디에요|어디야)/.test(compact) ||
    Boolean(thaiMeaningHints?.actionTerms?.length);
  const genericActionTerms = new Set(["주세요", "부탁", "있어요", "있나요", "필요해요"]);
  const whereActionIntent = actionIds.includes("where");
  const objectTerms = unique(
    [...(intentHints.objectTerms || []), ...(thaiMeaningHints?.objectTerms || []), ...compactPhraseRoots]
      .map((item) => compactText(item))
      .filter(Boolean)
      .filter((item) => !blockedTerms.has(item))
      .filter((item) => !(whereActionIntent && ["어디", "어디예요", "어디에요", "어디로"].includes(item)))
  );
  const actionTerms = unique(
    [...(intentHints.actionTerms || []), ...(thaiMeaningHints?.actionTerms || [])]
      .map((item) => compactText(item))
      .filter(Boolean)
      .filter((item) => !blockedTerms.has(item))
      .filter((item) => explicitRequestQuery || !genericActionTerms.has(item))
  );
  const templateTerms = unique(
    [...(intentHints.templateTerms || []), ...(thaiMeaningHints?.templateTerms || [])]
      .map((item) => compactText(item))
      .filter(Boolean)
      .filter((item) => !blockedTerms.has(item))
      .filter((item) => explicitRequestQuery || !genericActionTerms.has(item))
  ).slice(0, 18);
  const rawAnchorTerms = unique(rawTokens.map((item) => compactText(item)).filter(isStrongAnchorTerm));
  const intentAnchorTerms = unique(
    [...(intentHints.displayTerms || []), ...(intentHints.objectTerms || [])]
      .map((item) => compactText(item))
      .filter((item) => isStrongAnchorTerm(item))
  );
  const fallbackAnchorTerms = rawAnchorTerms.length
    ? []
    : unique(
        displayTerms
          .map((item) => compactText(item))
          .filter((item) => isStrongAnchorTerm(item) && compact.includes(item))
      );
  const highlightTerms = dropGenericTermsWhenSpecific([
    compact,
    ...rawTokens,
    ...displayTerms,
    ...filteredPrimaryCompacts,
    ...objectTerms,
    ...actionTerms,
    ...templateTerms,
  ])
    .filter((item) => item.length >= 2)
    .sort((left, right) => right.length - left.length)
    .slice(0, 14);

  return {
    query: trimmedQuery,
    normalized,
    compact,
    queryDirection,
    directTerms: unique([compact, ...rawTokens.map((item) => compactText(item)), ...expandedCompacts].filter(Boolean)),
    primaryTerms: filteredPrimaryCompacts,
    relatedTerms: filteredRelatedCompacts,
    objectTerms,
    objectIds: unique(objectIds),
    actionTerms,
    actionIds: unique(actionIds),
    templateTerms,
    anchorTerms: unique([...rawAnchorTerms, ...intentAnchorTerms, ...fallbackAnchorTerms]).slice(0, 4),
    displayTerms: unique(displayTerms.length ? displayTerms : rawTokens)
      .filter((item) => !blockedTerms.has(compactText(item)))
      .slice(0, 6),
    tags: sortTags(unique(tags)),
    preferredTags,
    avoidTags,
    minimumPrimaryHits: filteredPrimaryCompacts.length >= 3 ? 2 : filteredPrimaryCompacts.length ? 1 : 0,
    highlightTerms,
  };
}

function matchesCompactField(field, term) {
  if (!field || !term) return false;
  if (field === term) return true;
  if (term.length === 1) return field.startsWith(term);
  return field.startsWith(term) || field.includes(term);
}

function matchesExactCoreField(index, term) {
  if (!term) return false;
  if ([index.korean, index.thai, index.thaiScript].some((field) => field && field === term)) {
    return true;
  }
  return index.coreTokens.some((token) => token === term);
}

function getExactFieldPriority(index, term) {
  if (!term) return 0;
  if ([index.korean, index.thai, index.thaiScript].some((field) => field === term)) return 2;
  if ([...index.koreanTokens, ...index.thaiTokens, ...index.thaiScriptTokens].includes(term)) return 1;
  return 0;
}

function matchesCoreField(index, term) {
  if (!term) return false;
  if ([index.korean, index.thai, index.thaiScript].some((field) => matchesCompactField(field, term))) {
    return true;
  }
  return index.coreTokens.some((token) => token === term || token.includes(term));
}

function matchesIndexTerm(index, term) {
  if (!term) return false;
  if (term.length === 1) {
    if ([index.korean, index.thai, index.thaiScript].some((field) => field && (field === term || field.startsWith(term)))) {
      return true;
    }
    return index.tokens.some((token) => token === term || token.startsWith(term));
  }
  if ([index.korean, index.thai, index.thaiScript, index.note, ...index.keywords].some((field) => matchesCompactField(field, term))) {
    return true;
  }
  return index.tokens.some((token) => {
    return token === term || token.includes(term);
  });
}

function matchesThaiField(index, term) {
  if (!term) return false;
  if ([index.thai, index.thaiScript].some((field) => field && matchesCompactField(field, term))) {
    return true;
  }
  return (
    index.thaiTokens.some((token) => token === term || token.includes(term)) ||
    index.thaiScriptTokens.some((token) => token === term || token.includes(term))
  );
}

const GENERIC_TEMPLATE_TERMS = new Set(["문제가있어요", "고장났어요", "수리해주세요"]);

function matchesTemplateTerm(index, term) {
  if (!term) return false;
  if ([index.korean, index.thai, index.thaiScript].some((field) => field && (field === term || field.startsWith(term)))) {
    return true;
  }
  if (GENERIC_TEMPLATE_TERMS.has(term)) {
    return false;
  }
  return getStructuredFieldMatchStrength(index, term) >= 4;
}

function prioritizeRankedItems(...groups) {
  const prioritized = [];
  const seen = new Set();

  groups.forEach((group) => {
    (group || []).forEach((item) => {
      if (!item?.entry?.id || seen.has(item.entry.id)) return;
      seen.add(item.entry.id);
      prioritized.push(item);
    });
  });

  return prioritized;
}

function scoreEntry(entry, searchProfile, kind) {
  if (!searchProfile.query) {
    return {
      matched: true,
      score: 0,
      directMatch: false,
      directHits: 0,
      primaryHits: 0,
      relatedHits: 0,
      objectHits: 0,
      actionHits: 0,
      templateHits: 0,
    };
  }

  const index = buildSearchIndex(entry);
  const searchableFields = [index.korean, index.thai, index.thaiScript, index.note, ...index.keywords];
  const hasThaiScript = Boolean(getThaiScriptText(entry));
  const queryNegative = hasNegativeMeaning(searchProfile.query);
  const entryNegative = hasNegativeMeaning(entry.korean) || hasNegativeMeaning(entry.note);
  const exactCoreHit = matchesExactCoreField(index, searchProfile.compact);
  const exactDirectHits = searchProfile.directTerms.filter((term) => matchesExactCoreField(index, term));
  const exactVariantHits = exactDirectHits.filter((term) => term !== searchProfile.compact);
  const exactObjectHits = searchProfile.objectTerms.filter((term) => matchesCoreField(index, term));
  const singleObjectQuery =
    kind === "sentence" &&
    searchProfile.objectTerms.length >= 1 &&
    !searchProfile.actionTerms.length &&
    tokenize(searchProfile.query).length <= 2;
  const strictObjectPhraseQuery =
    kind === "sentence" &&
    searchProfile.objectTerms.some((term) => term.length >= 2) &&
    (searchProfile.actionTerms.length >= 1 || searchProfile.templateTerms.length >= 1);
  let score = 0;
  let directMatch = false;
  const directHits = new Set();
  const primaryHits = new Set();
  const relatedHits = new Set();
  const anchorHits = new Set();
  const objectHits = new Set();
  const actionHits = new Set();
  const templateHits = new Set();

  searchProfile.directTerms.forEach((term) => {
    const bestMatchLevel = getStructuredFieldMatchStrength(index, term, { allowSupportContains: true });

    if (!bestMatchLevel) return;
    directMatch = true;
    directHits.add(term);
    if (bestMatchLevel >= 6) {
      score += term.length === 1 ? 150 : 540;
      return;
    }
    if (bestMatchLevel === 5) {
      score += term.length === 1 ? 110 : 380;
      return;
    }
    if (bestMatchLevel === 4) {
      score += term.length === 1 ? 90 : 280;
      return;
    }
    if (bestMatchLevel === 3) {
      score += term.length === 1 ? 95 : 320;
      return;
    }
    if (bestMatchLevel === 2) {
      score += term.length === 1 ? 60 : 160;
      return;
    }
    score += 85;
  });

  if (directHits.size >= 2) {
    score += 180 + directHits.size * 40;
  }

  searchProfile.primaryTerms.forEach((term) => {
    if (!matchesIndexTerm(index, term)) return;
    primaryHits.add(term);
    score += term.length === 1 ? 170 : 220;
  });

  searchProfile.relatedTerms.forEach((term) => {
    if (!matchesIndexTerm(index, term)) return;
    relatedHits.add(term);
    score += term.length <= 2 ? 70 : 95;
  });
  searchProfile.anchorTerms.forEach((term) => {
    if (!matchesIndexTerm(index, term)) return;
    anchorHits.add(term);
    score += 260;
  });
  searchProfile.objectTerms.forEach((term) => {
    if (!matchesIndexTerm(index, term)) return;
    objectHits.add(term);
    score += term.length === 1 ? 170 : 225;
  });
  searchProfile.actionTerms.forEach((term) => {
    if (!matchesIndexTerm(index, term)) return;
    actionHits.add(term);
    score += term.length <= 2 ? 95 : 135;
  });
  searchProfile.templateTerms.forEach((term) => {
    if (!matchesTemplateTerm(index, term)) return;
    templateHits.add(term);
    score += term.length <= 4 ? 170 : 315;
  });

  if (state.scenario === "all" && searchProfile.tags.some((tag) => entry.tags.includes(tag))) {
    score += 60;
  }
  if (searchProfile.preferredTags?.length && searchProfile.preferredTags.some((tag) => entry.tags.includes(tag))) {
    score += 120;
  }
  if (searchProfile.avoidTags?.length && searchProfile.avoidTags.some((tag) => entry.tags.includes(tag))) {
    score -= kind === "sentence" ? 320 : 260;
  }
  if (primaryHits.size >= searchProfile.minimumPrimaryHits && searchProfile.minimumPrimaryHits > 0) {
    score += 110;
  }
  if (kind === "sentence" && primaryHits.size) {
    score += 40;
  }
  if (kind === "vocab" && exactCoreHit) {
    score += 260;
  }
  if (kind === "sentence" && exactCoreHit) {
    score += 240;
  }
  if (kind === "vocab" && exactVariantHits.length) {
    score += 190 + exactVariantHits.length * 25;
  }
  if (kind === "sentence" && exactVariantHits.length) {
    score += 280 + exactVariantHits.length * 35;
  }
  if (objectHits.size) {
    score += 110 + objectHits.size * 35;
  }
  if (kind === "sentence" && exactObjectHits.length) {
    score += 180 + exactObjectHits.length * 35;
  }
  if (actionHits.size) {
    score += 75 + actionHits.size * 20;
  }
  if (objectHits.size && actionHits.size) {
    score += kind === "sentence" ? 260 : 185;
  }
  if (templateHits.size) {
    score += kind === "sentence" ? 340 : 210;
  }
  score += getEntrySourceScore(entry, kind);
  if (/모르|몰라/.test(searchProfile.normalized)) {
    if (/모르|몰라/.test(index.korean) || /모르|몰라/.test(index.note)) {
      score += kind === "sentence" ? 240 : 180;
    }
    if (/이해합니다|이해해요|이해했어요/.test(entry.korean)) {
      score -= kind === "sentence" ? 260 : 180;
    }
  }
  if (kind === "vocab" && searchProfile.compact) {
    const exactObjectHit = searchProfile.objectTerms.some(
      (term) => index.korean === term || index.tokens.includes(term)
    );
    const exactActionHit = searchProfile.actionTerms.some(
      (term) => index.korean === term || index.tokens.includes(term)
    );
    if (exactObjectHit) {
      score += 160;
    }
    if (exactActionHit) {
      score += 110;
    }
    const lengthDelta = Math.max(0, index.korean.length - searchProfile.compact.length);
    score -= Math.min(lengthDelta * 18, 220);
    if (isSentenceLikeVocabEntry(entry)) {
      score -= 240;
    }
    if (isUtilityLabelVocabEntry(entry)) {
      score -= 170;
    }
  }
  if (hasThaiScript) {
    score += 35;
  } else {
    score -= 90;
  }
  const hasSpecificObjectIntent = searchProfile.objectTerms.some((term) => term.length >= 2);
  if (searchProfile.anchorTerms.length && !anchorHits.size) {
    score -= kind === "vocab" ? 120 : 90;
  }
  if (singleObjectQuery && !exactObjectHits.length && !templateHits.size) {
    score -= 220;
  }
  if (hasSpecificObjectIntent && !objectHits.size && !anchorHits.size && !templateHits.size) {
    score -= kind === "sentence" ? 260 : 220;
  }
  if (!queryNegative && entryNegative) {
    score -= 180;
  } else if (queryNegative && !entryNegative) {
    score -= 70;
  }
  if (searchProfile.objectTerms.length && !objectHits.size && !templateHits.size) {
    score -= kind === "sentence" ? 180 : 120;
  }
  if (searchProfile.actionTerms.length && !actionHits.size && !templateHits.size) {
    score -= kind === "sentence" ? 110 : 60;
  }
  if (isGeneratedBulkTemplateEntry(entry) && !templateHits.size) {
    score -= kind === "sentence" ? 140 : 90;
  }
  const strongIntentQuery =
    searchProfile.objectTerms.length ||
    searchProfile.actionTerms.length ||
    searchProfile.templateTerms.length ||
    searchProfile.anchorTerms.length;
  if (entry.source === "generated-bulk" && strongIntentQuery) {
    score -= kind === "sentence" ? 180 : 120;
    if (!objectHits.size && !templateHits.size && directHits.size < 2) {
      score -= kind === "sentence" ? 220 : 160;
    }
  }

  const hasPrimaryPlan = searchProfile.minimumPrimaryHits > 0;
  const vocabPrimaryThreshold = searchProfile.minimumPrimaryHits > 1 ? 1 : searchProfile.minimumPrimaryHits;
  const hasIntentTerms =
    searchProfile.objectTerms.length || searchProfile.actionTerms.length || searchProfile.templateTerms.length;
  const matchedBase =
    directMatch ||
    templateHits.size >= 1 ||
    (kind === "sentence" && objectHits.size >= 1 && (actionHits.size >= 1 || templateHits.size >= 1) && score >= 220) ||
    (kind === "vocab" && objectHits.size >= 1 && score >= 160) ||
    (kind === "vocab" && anchorHits.size >= 1 && score >= 120) ||
    (kind === "sentence" && anchorHits.size >= 1 && score >= 180) ||
    (kind === "vocab" && hasPrimaryPlan && primaryHits.size >= vocabPrimaryThreshold && score >= 170) ||
    (kind === "vocab" && !hasPrimaryPlan && (!hasIntentTerms ? score >= 280 : score >= 180)) ||
    (kind === "sentence" &&
      hasPrimaryPlan &&
      (primaryHits.size >= searchProfile.minimumPrimaryHits || (primaryHits.size >= 1 && relatedHits.size >= 1)) &&
      score >= 220) ||
    (kind === "sentence" && !hasPrimaryPlan && (!hasIntentTerms ? score >= 340 : score >= 220));
  const matched =
    matchedBase &&
    (!strictObjectPhraseQuery || templateHits.size >= 1 || objectHits.size >= 1 || exactObjectHits.length >= 1);

  return {
    matched,
    score,
    directMatch,
    directHits: directHits.size,
    primaryHits: primaryHits.size,
    relatedHits: relatedHits.size,
    objectHits: objectHits.size,
    actionHits: actionHits.size,
    templateHits: templateHits.size,
  };
}

function isGenericWhereOnlyQuery(searchProfile) {
  if (!searchProfile?.query) return false;
  return ["어디", "어디예요", "어디에요", "어디야"].includes(searchProfile.compact);
}

function getVocabResults(entries, searchProfile) {
  const candidateEntries = collectCandidateEntries(entries, searchProfile);
  const thaiOnlySearch = isThaiOnlySearch(searchProfile);
  const ranked = candidateEntries
    .filter(matchesScenario)
    .map((entry) => {
      const index = buildSearchIndex(entry);
      return {
        entry,
        match: scoreEntry(entry, searchProfile, "vocab"),
        compactKoreanExact: Boolean(searchProfile.compact && index.korean === searchProfile.compact),
        exactCoreHit: matchesExactCoreField(index, searchProfile.compact),
        exactVariantHits: searchProfile.directTerms.filter(
          (term) => term !== searchProfile.compact && matchesExactCoreField(index, term)
        ),
        termHits: searchProfile.primaryTerms.filter((term) => matchesIndexTerm(index, term)),
        anchorHits: searchProfile.anchorTerms.filter((term) => matchesIndexTerm(index, term)),
        objectHits: searchProfile.objectTerms.filter((term) => matchesIndexTerm(index, term)),
        actionHits: searchProfile.actionTerms.filter((term) => matchesIndexTerm(index, term)),
        templateHits: searchProfile.templateTerms.filter((term) => matchesTemplateTerm(index, term)),
        thaiCoreHits: thaiOnlySearch ? searchProfile.directTerms.filter((term) => matchesThaiField(index, term)) : [],
      };
    })
    .filter(({ match }) => match.matched)
    .sort((left, right) => {
      if (thaiOnlySearch && right.thaiCoreHits.length !== left.thaiCoreHits.length) {
        return right.thaiCoreHits.length - left.thaiCoreHits.length;
      }
      if (right.compactKoreanExact !== left.compactKoreanExact) {
        return Number(right.compactKoreanExact) - Number(left.compactKoreanExact);
      }
      if (right.exactCoreHit !== left.exactCoreHit) return Number(right.exactCoreHit) - Number(left.exactCoreHit);
      if (right.exactVariantHits.length !== left.exactVariantHits.length) {
        return right.exactVariantHits.length - left.exactVariantHits.length;
      }
      if (right.templateHits.length !== left.templateHits.length) return right.templateHits.length - left.templateHits.length;
      if (right.objectHits.length !== left.objectHits.length) return right.objectHits.length - left.objectHits.length;
      if (right.actionHits.length !== left.actionHits.length) return right.actionHits.length - left.actionHits.length;
      if (right.anchorHits.length !== left.anchorHits.length) return right.anchorHits.length - left.anchorHits.length;
      if ((left.entry.source === "generated-bulk") !== (right.entry.source === "generated-bulk")) {
        return Number(left.entry.source === "generated-bulk") - Number(right.entry.source === "generated-bulk");
      }
      if (right.match.score !== left.match.score) return right.match.score - left.match.score;
      if (right.match.directHits !== left.match.directHits) return right.match.directHits - left.match.directHits;
      if (right.match.primaryHits !== left.match.primaryHits) return right.match.primaryHits - left.match.primaryHits;
      const leftThai = Boolean(getThaiScriptText(left.entry));
      const rightThai = Boolean(getThaiScriptText(right.entry));
      if (leftThai !== rightThai) return Number(rightThai) - Number(leftThai);
      if (left.entry.korean.length !== right.entry.korean.length) {
        return left.entry.korean.length - right.entry.korean.length;
      }
      return left.entry.korean.localeCompare(right.entry.korean, "ko");
    });
  const curatedFocused = ranked.filter(
      (item) =>
        item.entry.source !== "generated-bulk" &&
        (item.objectHits.length || item.templateHits.length || item.match.directHits >= 1)
  );
  const genericWhereOnlyQuery = isGenericWhereOnlyQuery(searchProfile);
  const sourceFiltered =
    genericWhereOnlyQuery
      ? ranked.filter((item) => item.entry.source !== "generated-bulk")
      : curatedFocused.length && (searchProfile.objectTerms.length || searchProfile.anchorTerms.length)
      ? ranked.filter((item) => item.entry.source !== "generated-bulk")
      : curatedFocused.length
        ? ranked.filter(
            (item) =>
              item.entry.source !== "generated-bulk" ||
              item.templateHits.length ||
              (item.objectHits.length >= 2 && item.match.primaryHits >= 2)
          )
    : ranked;
  const intentFocused =
    searchProfile.objectTerms.length || searchProfile.templateTerms.length
      ? sourceFiltered.filter((item) => item.objectHits.length || item.templateHits.length)
      : [];
  const anchorFocused = searchProfile.anchorTerms.length ? sourceFiltered.filter((item) => item.anchorHits.length) : [];
  const thaiFocused = thaiOnlySearch ? sourceFiltered.filter((item) => item.thaiCoreHits.length) : [];
  const whereIntent = searchProfile.actionIds?.includes("where");
  const tightIntentVocab =
    searchProfile.objectTerms.length && (searchProfile.actionTerms.length || searchProfile.templateTerms.length)
      ? sourceFiltered.filter(
          (item) =>
            !isSentenceLikeVocabEntry(item.entry) &&
            !isUtilityLabelVocabEntry(item.entry) &&
            (item.exactCoreHit ||
              item.templateHits.length ||
              (item.objectHits.length && (item.actionHits.length || whereIntent)))
        )
      : [];
  const preferredRanked =
    thaiFocused.length
      ? thaiFocused
      : tightIntentVocab.length
        ? whereIntent
          ? tightIntentVocab
          : prioritizeRankedItems(tightIntentVocab, intentFocused, sourceFiltered)
        : intentFocused.length
          ? intentFocused
          : anchorFocused.length >= 2
            ? anchorFocused
            : sourceFiltered;

  if (
    !searchProfile.query ||
    searchProfile.primaryTerms.length < 2 ||
    searchProfile.objectTerms.length ||
    searchProfile.templateTerms.length
  ) {
    return preferredRanked.map(({ entry }) => entry);
  }

  const diversified = [];
  const seen = new Set();
  searchProfile.primaryTerms.forEach((term) => {
    const candidate = preferredRanked.find((item) => !seen.has(item.entry.id) && item.termHits.includes(term));
    if (!candidate) return;
    seen.add(candidate.entry.id);
    diversified.push(candidate.entry);
  });

  preferredRanked.forEach(({ entry }) => {
    if (seen.has(entry.id)) return;
    seen.add(entry.id);
    diversified.push(entry);
  });

  return diversified;
}

function getSentenceResults(entries, searchProfile, vocabSeeds) {
  const candidateEntries = collectCandidateEntries(entries, searchProfile);
  const thaiOnlySearch = isThaiOnlySearch(searchProfile);
  const seedTerms = [];
  vocabSeeds.slice(0, 4).forEach((entry) => {
    const index = buildSearchIndex(entry);
    seedTerms.push(...index.tokens);
    seedTerms.push(...(entry.keywords || []));
  });

  const seedTokens = unique(
    [
      ...searchProfile.primaryTerms,
      ...searchProfile.relatedTerms.slice(0, 6),
      ...seedTerms.map((item) => compactText(item)),
    ].filter((item) => item.length >= 1)
  );

  const direct = candidateEntries
    .filter(matchesScenario)
    .map((entry) => {
      const index = buildSearchIndex(entry);
      return {
        entry,
        match: scoreEntry(entry, searchProfile, "sentence"),
        compactKoreanExact: Boolean(searchProfile.compact && index.korean === searchProfile.compact),
        exactCoreHit: matchesExactCoreField(index, searchProfile.compact),
        exactVariantHits: searchProfile.directTerms.filter(
          (term) => term !== searchProfile.compact && matchesExactCoreField(index, term)
        ),
        exactObjectHits: searchProfile.objectTerms.filter((term) => matchesCoreField(index, term)),
        anchorHits: searchProfile.anchorTerms.filter((term) => matchesIndexTerm(index, term)),
        objectHits: searchProfile.objectTerms.filter((term) => matchesIndexTerm(index, term)),
        actionHits: searchProfile.actionTerms.filter((term) => matchesIndexTerm(index, term)),
        templateHits: searchProfile.templateTerms.filter((term) => matchesTemplateTerm(index, term)),
        thaiCoreHits: thaiOnlySearch ? searchProfile.directTerms.filter((term) => matchesThaiField(index, term)) : [],
      };
    })
    .filter(({ match }) => match.matched)
    .sort((left, right) => {
      if (thaiOnlySearch && right.thaiCoreHits.length !== left.thaiCoreHits.length) {
        return right.thaiCoreHits.length - left.thaiCoreHits.length;
      }
      if (right.compactKoreanExact !== left.compactKoreanExact) {
        return Number(right.compactKoreanExact) - Number(left.compactKoreanExact);
      }
      if (right.exactCoreHit !== left.exactCoreHit) return Number(right.exactCoreHit) - Number(left.exactCoreHit);
      if (right.exactVariantHits.length !== left.exactVariantHits.length) {
        return right.exactVariantHits.length - left.exactVariantHits.length;
      }
      if (right.exactObjectHits.length !== left.exactObjectHits.length) return right.exactObjectHits.length - left.exactObjectHits.length;
      if (right.templateHits.length !== left.templateHits.length) return right.templateHits.length - left.templateHits.length;
      if (right.objectHits.length !== left.objectHits.length) return right.objectHits.length - left.objectHits.length;
      if (right.actionHits.length !== left.actionHits.length) return right.actionHits.length - left.actionHits.length;
      if (right.anchorHits.length !== left.anchorHits.length) return right.anchorHits.length - left.anchorHits.length;
      if ((left.entry.source === "generated-bulk") !== (right.entry.source === "generated-bulk")) {
        return Number(left.entry.source === "generated-bulk") - Number(right.entry.source === "generated-bulk");
      }
      if (right.match.score !== left.match.score) return right.match.score - left.match.score;
      if (right.match.directHits !== left.match.directHits) return right.match.directHits - left.match.directHits;
      const leftThai = Boolean(getThaiScriptText(left.entry));
      const rightThai = Boolean(getThaiScriptText(right.entry));
      if (leftThai !== rightThai) return Number(rightThai) - Number(leftThai);
      return right.match.primaryHits - left.match.primaryHits;
    });

  const curatedDirect = direct.filter(
    (item) =>
      item.entry.source !== "generated-bulk" &&
      (item.objectHits.length || item.templateHits.length || item.match.directHits >= 1)
  );
  const nounLikeLookup = isSimpleCompactLookup(searchProfile);
  const exactVariantDirect = direct.filter(
    (item) => item.entry.source !== "generated-bulk" && item.exactVariantHits.length
  );
  const curatedCompactDirect = direct.filter(
    (item) =>
      item.entry.source !== "generated-bulk" &&
      (compactText(item.entry.korean).includes(searchProfile.compact) || item.exactVariantHits.length)
  );
  const visibleDirect = curatedDirect.length
    ? direct.filter(
        (item) =>
          item.entry.source !== "generated-bulk" ||
          item.templateHits.length ||
          item.exactObjectHits.length ||
          (item.objectHits.length >= 2 && item.match.primaryHits >= 2)
      )
    : direct;
  const strictExactDirect =
    searchProfile.objectTerms.length && !searchProfile.actionTerms.length
      ? visibleDirect.filter((item) => item.exactCoreHit || item.exactObjectHits.length)
      : [];
  const intentFilteredDirect =
    searchProfile.objectTerms.length || searchProfile.templateTerms.length
      ? visibleDirect.filter(
          (item) =>
            item.objectHits.length ||
            item.templateHits.length ||
            item.actionHits.length ||
            item.match.directHits >= 2 ||
            item.match.primaryHits >= 1
        )
      : visibleDirect;
  const thaiFocusedDirect = thaiOnlySearch ? visibleDirect.filter((item) => item.thaiCoreHits.length) : [];
  const tightIntentDirect =
    searchProfile.objectTerms.length && (searchProfile.actionTerms.length || searchProfile.templateTerms.length)
      ? visibleDirect.filter(
          (item) =>
            item.objectHits.length &&
            (item.templateHits.length ||
              item.actionHits.length ||
              (searchProfile.actionIds?.includes("where") &&
                /어디(?:예요|에요)?/.test(normalizeText(item.entry.korean))))
        )
      : [];
  const whereFocusedDirect = searchProfile.actionIds?.includes("where") && tightIntentDirect.length ? tightIntentDirect : [];
  const prioritizedDirect =
    thaiFocusedDirect.length
      ? thaiFocusedDirect
      : whereFocusedDirect.length
        ? whereFocusedDirect
      : tightIntentDirect.length
        ? prioritizeRankedItems(tightIntentDirect, intentFilteredDirect, visibleDirect)
      : strictExactDirect.length >= 2
        ? strictExactDirect
        : intentFilteredDirect.length >= 3
          ? intentFilteredDirect
          : visibleDirect;

  if (
    curatedDirect.length >= 2 &&
    !searchProfile.objectTerms.length &&
    !searchProfile.actionTerms.length &&
    !searchProfile.templateTerms.length
  ) {
    return curatedDirect.map(({ entry }) => entry).slice(0, RESULT_LIMITS.sentences + 2);
  }

  if (nounLikeLookup && curatedCompactDirect.length) {
    return uniqueById([
      ...exactVariantDirect.map(({ entry }) => entry),
      ...curatedCompactDirect.map(({ entry }) => entry),
      ...prioritizedDirect.map(({ entry }) => entry),
    ]).slice(0, RESULT_LIMITS.sentences + 3);
  }

  if (whereFocusedDirect.length) {
    return whereFocusedDirect.map(({ entry }) => entry).slice(0, RESULT_LIMITS.sentences);
  }

  if (prioritizedDirect.length >= 3) {
    return prioritizedDirect.map(({ entry }) => entry).slice(0, RESULT_LIMITS.sentences + 4);
  }

  if (
    prioritizedDirect.length >= 2 &&
    (searchProfile.objectTerms.length || searchProfile.templateTerms.length || searchProfile.actionTerms.length)
  ) {
    return prioritizedDirect.map(({ entry }) => entry).slice(0, RESULT_LIMITS.sentences + 2);
  }

  const directIds = new Set(prioritizedDirect.map(({ entry }) => entry.id));
  const related = candidateEntries
    .filter(matchesScenario)
    .filter((entry) => !directIds.has(entry.id))
    .map((entry) => {
      const index = buildSearchIndex(entry);
      const sharedPrimary = searchProfile.primaryTerms.filter((term) => matchesIndexTerm(index, term)).length;
      const shared = seedTokens.filter((term) => matchesIndexTerm(index, term)).length;
      const objectHits = searchProfile.objectTerms.filter((term) => matchesIndexTerm(index, term)).length;
      const actionHits = searchProfile.actionTerms.filter((term) => matchesIndexTerm(index, term)).length;
      const templateHits = searchProfile.templateTerms.filter((term) => matchesTemplateTerm(index, term)).length;
      const thaiCoreHits = thaiOnlySearch ? searchProfile.directTerms.filter((term) => matchesThaiField(index, term)).length : 0;
      let score =
        sharedPrimary * 180 +
        shared * 45 +
        objectHits * 170 +
        actionHits * 110 +
        templateHits * 300 +
        thaiCoreHits * 260 +
        getEntrySourceScore(entry, "sentence");

      if (searchProfile.objectTerms.length && !objectHits && !templateHits) {
        score -= 170;
      }
      if (searchProfile.actionTerms.length && !actionHits && !templateHits) {
        score -= 100;
      }
      if (isGeneratedBulkTemplateEntry(entry) && !templateHits) {
        score -= 130;
      }

      return {
        entry,
        score,
        shared,
        sharedPrimary,
        objectHits,
        actionHits,
        templateHits,
        thaiCoreHits,
      };
    })
    .filter(
      ({ score, shared, sharedPrimary, objectHits, templateHits, thaiCoreHits }) =>
        thaiCoreHits >= 1 ||
        templateHits >= 1 ||
        objectHits >= 1 ||
        sharedPrimary >= 1 ||
        (shared >= 1 && score >= (searchProfile.minimumPrimaryHits > 1 ? 220 : 160))
    )
    .sort((left, right) => {
      if (thaiOnlySearch && right.thaiCoreHits !== left.thaiCoreHits) return right.thaiCoreHits - left.thaiCoreHits;
      if (right.templateHits !== left.templateHits) return right.templateHits - left.templateHits;
      if (right.objectHits !== left.objectHits) return right.objectHits - left.objectHits;
      if (right.actionHits !== left.actionHits) return right.actionHits - left.actionHits;
      if ((left.entry.source === "generated-bulk") !== (right.entry.source === "generated-bulk")) {
        return Number(left.entry.source === "generated-bulk") - Number(right.entry.source === "generated-bulk");
      }
      if (right.score !== left.score) return right.score - left.score;
      const leftThai = Boolean(getThaiScriptText(left.entry));
      const rightThai = Boolean(getThaiScriptText(right.entry));
      if (leftThai !== rightThai) return Number(rightThai) - Number(leftThai);
      return right.sharedPrimary - left.sharedPrimary;
    });

  return uniqueById([
    ...prioritizedDirect.map(({ entry }) => entry),
    ...related.map(({ entry }) => entry),
  ]).slice(0, RESULT_LIMITS.sentences + 4);
}

function uniqueById(entries) {
  const seen = new Set();
  return entries.filter((entry) => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  });
}

function uniqueByMeaning(entries) {
  const seen = new Set();
  return entries.filter((entry) => {
    const meaningKey = [
      entry.kind || "",
      compactText(entry.korean),
      compactText(getThaiScriptText(entry) || entry.thai),
    ].join("::");
    if (seen.has(meaningKey)) return false;
    seen.add(meaningKey);
    return true;
  });
}

function mergeGeneratedEntrySets(...groups) {
  const vocab = [];
  const sentences = [];
  let suppressFallbackSentences = false;

  groups.forEach((group) => {
    if (!group) return;
    if (Array.isArray(group.vocab)) vocab.push(...group.vocab);
    if (Array.isArray(group.sentences)) sentences.push(...group.sentences);
    if (group.suppressFallbackSentences) suppressFallbackSentences = true;
  });

  return {
    vocab: uniqueByMeaning(uniqueById(vocab)),
    sentences: uniqueByMeaning(uniqueById(sentences)),
    suppressFallbackSentences,
  };
}

function findExactEntry(entries, searchProfile, options = {}) {
  if (!searchProfile.query) return null;
  const includeSupport = options.includeSupport ?? false;
  const includeTemplates = options.includeTemplates ?? false;
  const strictKoreanExact = entries.find((entry) => compactText(entry.korean) === searchProfile.compact);
  if (strictKoreanExact) {
    return strictKoreanExact;
  }
  const templateTerms = includeTemplates ? unique((searchProfile.templateTerms || []).slice(0, 8).filter(Boolean)) : [];
  const templateTermSet = new Set(templateTerms);
  const exactTerms = unique([searchProfile.compact, ...(searchProfile.directTerms || []), ...templateTerms].filter(Boolean));
  const exactCoreCandidates = entries
    .map((entry) => {
      const index = buildSearchIndex(entry);
      const matchedTerms = exactTerms.filter((term) => matchesExactCoreField(index, term));
      if (!matchedTerms.length) return null;
      const exactFieldTerms = matchedTerms.filter((term) => getExactFieldPriority(index, term) > 0);
      const compactFieldPriority = getExactFieldPriority(index, searchProfile.compact);
      const templateFieldPriority = Math.max(
        0,
        ...matchedTerms.filter((term) => templateTermSet.has(term)).map((term) => getExactFieldPriority(index, term))
      );
      const bestFieldPriority = Math.max(0, ...matchedTerms.map((term) => getExactFieldPriority(index, term)));
      return {
        entry,
        matchedTerms,
        exactFieldTerms,
        compactFieldPriority,
        templateFieldPriority,
        compactExactField: compactFieldPriority >= 2,
        templateExactField: templateFieldPriority >= 2,
        intentFieldPriority: Math.max(compactFieldPriority, templateFieldPriority),
        bestFieldPriority,
        koreanContainsCompact: Boolean(searchProfile.compact && index.korean.includes(searchProfile.compact)),
        hasObjectIntentHit: (searchProfile.objectTerms || []).some(
          (term) => matchesCoreField(index, term) || matchesIndexTerm(index, term)
        ),
        koreanNormalized: normalizeText(entry.korean),
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (left.compactExactField !== right.compactExactField) {
        return Number(right.compactExactField) - Number(left.compactExactField);
      }
      if (left.templateExactField !== right.templateExactField) {
        return Number(right.templateExactField) - Number(left.templateExactField);
      }
      if (left.intentFieldPriority !== right.intentFieldPriority) {
        return right.intentFieldPriority - left.intentFieldPriority;
      }
      if (left.templateFieldPriority !== right.templateFieldPriority) {
        return right.templateFieldPriority - left.templateFieldPriority;
      }
      if (left.compactFieldPriority !== right.compactFieldPriority) {
        return right.compactFieldPriority - left.compactFieldPriority;
      }
      if (left.bestFieldPriority !== right.bestFieldPriority) {
        return right.bestFieldPriority - left.bestFieldPriority;
      }

      if ((left.entry.source === "generated-bulk") !== (right.entry.source === "generated-bulk")) {
        return Number(left.entry.source === "generated-bulk") - Number(right.entry.source === "generated-bulk");
      }

      const leftCompactMatch = left.matchedTerms.includes(searchProfile.compact);
      const rightCompactMatch = right.matchedTerms.includes(searchProfile.compact);
      if (leftCompactMatch !== rightCompactMatch) return Number(rightCompactMatch) - Number(leftCompactMatch);

      if (left.koreanContainsCompact !== right.koreanContainsCompact) {
        return Number(right.koreanContainsCompact) - Number(left.koreanContainsCompact);
      }

      const leftLongest = Math.max(...left.matchedTerms.map((term) => term.length));
      const rightLongest = Math.max(...right.matchedTerms.map((term) => term.length));
      if (leftLongest !== rightLongest) return rightLongest - leftLongest;

      return left.entry.korean.length - right.entry.korean.length;
    });

  const simpleCompactLookup = isSimpleCompactLookup(searchProfile);
  const phraseLikeExactQuery = isPhraseLikeExactQuery(searchProfile);
  const filteredExactCandidates = exactCoreCandidates.filter((item) => {
    const hasTightIntent = Boolean(
      searchProfile.objectTerms.length && (searchProfile.actionTerms.length || searchProfile.templateTerms.length)
    );
    if (
      includeTemplates &&
      simpleCompactLookup &&
      item.entry.source === "generated-bulk" &&
      !item.compactExactField &&
      !item.templateExactField
    ) {
      return false;
    }

    if (
      phraseLikeExactQuery &&
      !item.compactExactField &&
      !item.templateExactField &&
      item.bestFieldPriority < 2
    ) {
      return false;
    }

    if (phraseLikeExactQuery && item.bestFieldPriority >= 2 && !item.compactExactField && !item.templateExactField) {
      const meaningfulExactTerms = item.exactFieldTerms.filter(
        (term) => !GENERIC_ANCHOR_TERMS.has(term) && !GENERIC_SEARCH_TERMS.has(term) && !GENERIC_TEMPLATE_TERMS.has(term)
      );
      if (!meaningfulExactTerms.length) {
        return false;
      }
    }

    if (hasTightIntent && !item.hasObjectIntentHit && !item.templateExactField) {
      return false;
    }

    if (
      hasTightIntent &&
      searchProfile.actionIds?.includes("where") &&
      item.hasObjectIntentHit &&
      !item.templateExactField &&
      !/어디(?:예요|에요)?/.test(item.koreanNormalized)
    ) {
      return false;
    }

    return true;
  });

  if (filteredExactCandidates.length || !includeSupport) {
    return filteredExactCandidates.length ? filteredExactCandidates[0].entry : null;
  }
  return (
    entries.find((entry) => {
      const index = buildSearchIndex(entry);
      return [index.note, ...index.keywords].some((field) => field && field === searchProfile.compact);
    }) || null
  );
}

function isSimpleCompactLookup(searchProfile) {
  if (!searchProfile?.query || !searchProfile?.compact) return false;
  return (
    !/\s/.test(searchProfile.query) &&
    searchProfile.compact.length >= 2 &&
    !searchProfile.actionTerms.length &&
    !searchProfile.templateTerms.length &&
    !searchProfile.anchorTerms.length
  );
}

function shouldKeepExactSentenceMatch(entry, searchProfile) {
  if (!entry || !searchProfile?.query) return false;
  const hasTightIntent = Boolean(
    searchProfile.objectTerms?.length && (searchProfile.actionTerms?.length || searchProfile.templateTerms?.length)
  );
  if (!hasTightIntent) return true;

  const index = buildSearchIndex(entry);
  const hasObjectHit = searchProfile.objectTerms.some(
    (term) => matchesCoreField(index, term) || matchesIndexTerm(index, term)
  );
  if (!hasObjectHit) return false;

  if (searchProfile.actionIds?.includes("where")) {
    return (
      /어디(?:예요|에요)?/.test(normalizeText(entry.korean)) ||
      searchProfile.templateTerms.some((term) => matchesTemplateTerm(index, term))
    );
  }

  return true;
}

function isPhraseLikeExactQuery(searchProfile) {
  if (!searchProfile?.query) return false;
  const normalized = normalizeText(searchProfile.query);
  return Boolean(
    /\s/.test(searchProfile.query) ||
      searchProfile.actionTerms.length ||
      searchProfile.templateTerms.length ||
      searchProfile.anchorTerms.length ||
      (normalized.length >= 4 &&
        /(?:요|다|니|나|까|죠|줘|해|해요|했어요|주세요|돼요|되요|안돼요|안되요|있어요|없어요)$/.test(
          normalized
        ))
  );
}

function isActionPhraseQuery(searchProfile) {
  if (!searchProfile.query) return false;
  return /\s/.test(searchProfile.query) || searchProfile.directTerms.length >= 2;
}

function renderScenarioChips() {
  elements.scenarioChips.innerHTML = "";
  baseData.scenarios.forEach((scenario) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip${state.scenario === scenario.id ? " active" : ""}`;
    button.textContent = scenario.label;
    button.title = scenario.description;
    wirePressFeedback(button);
    button.addEventListener("click", () => {
      state.scenario = scenario.id;
      render();
      if (state.menuOpen && window.innerWidth <= 900) {
        closeMenu();
      }
    });
    elements.scenarioChips.appendChild(button);
  });
}

function requestNextFrame(callback) {
  if (typeof window.requestAnimationFrame === "function") {
    return window.requestAnimationFrame(callback);
  }
  return window.setTimeout(callback, 16);
}

function cancelNextFrame(handle) {
  if (!handle) return;
  if (typeof window.cancelAnimationFrame === "function") {
    window.cancelAnimationFrame(handle);
    return;
  }
  window.clearTimeout(handle);
}

function setSearchButtonBusy(isBusy) {
  const button = elements.searchButton;
  if (!button) return;

  const idleLabel = button.dataset.idleLabel || button.textContent || "검색";
  button.dataset.idleLabel = idleLabel;
  button.classList.toggle("busy", isBusy);
  button.setAttribute("aria-busy", isBusy ? "true" : "false");
  button.textContent = isBusy ? "검색 중..." : idleLabel;
}

function wirePressFeedback(button) {
  if (!button || button.dataset.pressFeedback === "true") return;
  button.dataset.pressFeedback = "true";

  const release = () => button.classList.remove("is-pressed");
  button.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    button.classList.add("is-pressed");
  });
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
  button.addEventListener("blur", release);
}

function performSearch(nextQuery = elements.searchInput.value.trim(), options = {}) {
  state.query = nextQuery;
  state.selectedVocabId = null;
  state.revealedThaiIds = new Set();
  render();
  if (options.scrollResults && !isBrowsingState()) {
    elements.resultStack.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function queueSearch(nextQuery = elements.searchInput.value.trim(), options = {}) {
  const query = String(nextQuery || "").trim();
  elements.searchInput.value = query;

  if (state.searchFrame) {
    cancelNextFrame(state.searchFrame);
  }

  setSearchButtonBusy(true);
  state.searchFrame = requestNextFrame(() => {
    state.searchFrame = 0;
    try {
      performSearch(query, options);
    } finally {
      setSearchButtonBusy(false);
    }
  });
}

function applyQuickSearch(query) {
  elements.searchInput.value = query;
  queueSearch(query, { scrollResults: true });
}

function jumpToSection(section) {
  if (!state.query) {
    performSearch(elements.searchInput.value.trim(), { scrollResults: true });
  }

  window.setTimeout(() => {
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 40);
}

function renderQuickSearches() {
  elements.quickSearchChips.innerHTML = "";
  QUICK_SEARCHES.forEach((query) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.textContent = query;
    wirePressFeedback(button);
    button.addEventListener("click", () => applyQuickSearch(query));
    elements.quickSearchChips.appendChild(button);
  });
}

function renderGuideCards() {
  return;
}

function createTag(tag) {
  const element = document.createElement("span");
  element.className = "tag";
  element.textContent = tag;
  return element;
}

function createEmptyState(message) {
  const element = document.createElement("div");
  element.className = "empty-state";
  element.textContent = message;
  return element;
}

function getThaiScriptText(entry) {
  const explicit = String(entry.thaiScript || "").trim();
  if (explicit) return explicit;
  const override = getThaiScriptOverride(entry);
  if (override) return override;
  return THAI_SCRIPT_REGEX.test(String(entry.thai || "")) ? String(entry.thai || "").trim() : "";
}

const LATIN_PRONUNCIATION_OVERRIDES = {
  aircon: "에어컨",
  arai: "아라이",
  atm: "에이티엠",
  baht: "밧",
  bpai: "빠이",
  bts: "비티에스",
  chai: "차이",
  chuea: "츠아",
  dai: "다이",
  duai: "두아이",
  grab: "그랩",
  hongnam: "홍남",
  kap: "캅",
  khanom: "카놈",
  khrap: "캅",
  khrua: "크루아",
  krub: "캅",
  line: "라인",
  mai: "마이",
  mak: "막",
  makmak: "막막",
  mrt: "엠알티",
  nai: "나이",
  nid: "닛",
  noi: "너이",
  ok: "오케이",
  okay: "오케이",
  pai: "빠이",
  phan: "판",
  phrachao: "프라차오",
  phom: "폼",
  pom: "폼",
  sawatdee: "사왓디",
  sawatdi: "사왓디",
  swatdi: "사왓디",
  suksan: "숙산",
  thuk: "툭",
  thukwan: "툭완",
  tonbai: "톤바이",
  wai: "와이",
  wan: "완",
  wifi: "와이파이",
  yuu: "유",
  yu: "유",
};

const LATIN_ACRONYM_PRONUNCIATION_MAP = {
  A: "에이",
  B: "비",
  C: "씨",
  D: "디",
  E: "이",
  F: "에프",
  G: "지",
  H: "에이치",
  I: "아이",
  J: "제이",
  K: "케이",
  L: "엘",
  M: "엠",
  N: "엔",
  O: "오",
  P: "피",
  Q: "큐",
  R: "알",
  S: "에스",
  T: "티",
  U: "유",
  V: "브이",
  W: "더블유",
  X: "엑스",
  Y: "와이",
  Z: "지",
};

const LATIN_CLUSTER_FALLBACK_MAP = {
  b: "브",
  bp: "브",
  c: "크",
  ch: "치",
  d: "드",
  f: "프",
  g: "그",
  h: "흐",
  j: "지",
  k: "크",
  kh: "크",
  l: "를",
  m: "음",
  n: "느",
  ng: "응",
  p: "프",
  ph: "프",
  q: "쿠",
  r: "르",
  s: "스",
  sh: "시",
  t: "트",
  th: "트",
  tm: "팀",
  tn: "튼",
  tt: "트",
  w: "우",
  x: "엑스",
  y: "이",
  z: "즈",
};

const ROMAN_INITIAL_INDEX = {
  "": 11,
  b: 7,
  bp: 7,
  c: 12,
  ch: 14,
  d: 3,
  f: 17,
  g: 0,
  h: 18,
  j: 12,
  k: 15,
  kh: 15,
  l: 5,
  m: 6,
  n: 2,
  ng: 11,
  p: 17,
  ph: 17,
  q: 15,
  r: 5,
  s: 9,
  sh: 10,
  t: 16,
  th: 16,
  v: 17,
  w: 11,
  x: 9,
  y: 11,
  z: 12,
};

const ROMAN_MEDIAL_MAP = {
  a: { index: 0, tail: "" },
  aa: { index: 0, tail: "" },
  ae: { index: 1, tail: "" },
  ai: { index: 0, tail: "이" },
  ao: { index: 0, tail: "오" },
  au: { index: 0, tail: "우" },
  aw: { index: 0, tail: "우" },
  e: { index: 5, tail: "" },
  ee: { index: 20, tail: "" },
  i: { index: 20, tail: "" },
  ia: { index: 20, tail: "아" },
  ie: { index: 20, tail: "에" },
  o: { index: 8, tail: "" },
  oe: { index: 18, tail: "" },
  oi: { index: 8, tail: "이" },
  oo: { index: 13, tail: "" },
  u: { index: 13, tail: "" },
  ua: { index: 13, tail: "아" },
  ue: { index: 18, tail: "" },
  ui: { index: 19, tail: "" },
  y: { index: 20, tail: "" },
  ya: { index: 2, tail: "" },
  ye: { index: 7, tail: "" },
  yo: { index: 12, tail: "" },
  yu: { index: 17, tail: "" },
  wa: { index: 9, tail: "" },
  we: { index: 15, tail: "" },
  wi: { index: 16, tail: "" },
  wo: { index: 14, tail: "" },
};

const ROMAN_FINAL_INDEX = {
  "": 0,
  b: 17,
  c: 1,
  ch: 23,
  d: 7,
  f: 26,
  g: 1,
  h: 27,
  k: 1,
  l: 8,
  m: 16,
  n: 4,
  ng: 21,
  p: 17,
  r: 8,
  s: 19,
  sh: 19,
  t: 7,
  th: 25,
  x: 19,
  z: 22,
};

const ROMAN_ONSET_PATTERNS = ["ng", "kh", "ph", "th", "ch", "sh", "bp"];
const ROMAN_VOWEL_PATTERNS = [
  "ya",
  "ye",
  "yo",
  "yu",
  "wa",
  "we",
  "wi",
  "wo",
  "aa",
  "ae",
  "ai",
  "ao",
  "au",
  "aw",
  "ee",
  "ia",
  "ie",
  "oe",
  "oi",
  "oo",
  "ua",
  "ue",
  "ui",
  "a",
  "e",
  "i",
  "o",
  "u",
  "y",
];

function composeHangulSyllable(initialIndex, medialIndex, finalIndex = 0) {
  return String.fromCharCode(0xac00 + (initialIndex * 21 + medialIndex) * 28 + finalIndex);
}

function matchRomanPattern(patterns, text, startIndex) {
  return patterns.find((pattern) => text.startsWith(pattern, startIndex)) || "";
}

function splitRomanCoda(run) {
  const value = String(run || "").toLowerCase();
  if (!value) return { coda: "", rest: "" };
  const matched = matchRomanPattern(["ng", "sh", "th", "ch"], value, 0);
  if (matched) {
    return { coda: matched, rest: value.slice(matched.length) };
  }
  return { coda: value[0], rest: value.slice(1) };
}

function convertRomanAcronym(token) {
  if (!/^[A-Z]{2,5}$/.test(token)) return "";
  return token
    .split("")
    .map((letter) => LATIN_ACRONYM_PRONUNCIATION_MAP[letter] || letter)
    .join("");
}

function convertRomanClusterFallback(token) {
  const normalized = String(token || "").toLowerCase().replace(/[^a-z]/g, "");
  if (!normalized) return "";
  if (LATIN_CLUSTER_FALLBACK_MAP[normalized]) return LATIN_CLUSTER_FALLBACK_MAP[normalized];
  return normalized
    .replace(/ng/g, "응 ")
    .replace(/ph/g, "프 ")
    .replace(/kh/g, "크 ")
    .replace(/th/g, "트 ")
    .replace(/ch/g, "치 ")
    .replace(/sh/g, "시 ")
    .replace(/([bcdfghjklmnpqrstvwxyz])/g, (char) => LATIN_CLUSTER_FALLBACK_MAP[char] || char)
    .replace(/\s+/g, "")
    .trim();
}

function convertRomanTokenToKorean(token) {
  const original = String(token || "").trim();
  if (!original) return "";
  const acronym = convertRomanAcronym(original);
  if (acronym) return acronym;

  const normalized = original.toLowerCase().replace(/[^a-z]/g, "");
  if (!normalized) return original;
  if (LATIN_PRONUNCIATION_OVERRIDES[normalized]) {
    return LATIN_PRONUNCIATION_OVERRIDES[normalized];
  }

  let cursor = 0;
  let result = "";

  while (cursor < normalized.length) {
    let onset = "";
    const vowelAtCursor = matchRomanPattern(ROMAN_VOWEL_PATTERNS, normalized, cursor);
    if (!vowelAtCursor) {
      onset = matchRomanPattern(ROMAN_ONSET_PATTERNS, normalized, cursor) || normalized[cursor];
      cursor += onset.length;
    }

    const vowel = matchRomanPattern(ROMAN_VOWEL_PATTERNS, normalized, cursor);
    if (!vowel) {
      result += LATIN_PRONUNCIATION_OVERRIDES[onset] || convertRomanClusterFallback(onset);
      continue;
    }
    cursor += vowel.length;

    const runStart = cursor;
    while (cursor < normalized.length && !matchRomanPattern(ROMAN_VOWEL_PATTERNS, normalized, cursor)) {
      cursor += 1;
    }

    let coda = "";
    if (runStart < normalized.length) {
      const consonantRun = normalized.slice(runStart, cursor);
      if (consonantRun) {
        if (cursor < normalized.length) {
          const split = splitRomanCoda(consonantRun);
          coda = split.coda;
          cursor = runStart + split.coda.length;
        } else {
          coda = consonantRun;
        }
      }
    }

    const initialIndex = ROMAN_INITIAL_INDEX[onset] ?? 11;
    const medial = ROMAN_MEDIAL_MAP[vowel] || ROMAN_MEDIAL_MAP.a;
    const finalIndex = ROMAN_FINAL_INDEX[coda] ?? 0;
    result += composeHangulSyllable(initialIndex, medial.index, finalIndex) + (medial.tail || "");
  }

  return result || original;
}

function normalizePronunciationForDisplay(text) {
  const raw = String(text || "").trim();
  if (!/[A-Za-z]/.test(raw)) return raw;
  return raw.replace(/[A-Za-z][A-Za-z-]*/g, (token) => convertRomanTokenToKorean(token));
}

function getDisplayPronunciationText(entry) {
  return normalizePronunciationForDisplay(String(entry?.thai || "").trim());
}

function isExternalCorpusEntry(entry) {
  return entry?.source === "external-corpus" || /외부 코퍼스/i.test(String(entry?.sheet || ""));
}

function getDisplayNoteText(entry) {
  const raw = String(entry?.note || "").trim();
  if (!raw) return "";

  const withoutSource = raw.replace(/\s*\|\s*출처\s*[^|]+/gi, "").trim();
  if (!isExternalCorpusEntry(entry)) {
    return withoutSource || raw;
  }

  const sourceText = `${entry?.sheet || ""} ${raw}`;
  if (/tatoeba|opus/i.test(sourceText)) {
    return "외부 예문 보강";
  }
  if (/wiktionary|kaikki/i.test(sourceText)) {
    return "외부 사전 보강";
  }

  const simplified = withoutSource
    .replace(/Tatoeba English pivot:\s*[^|]+/gi, "")
    .replace(/Tatoeba direct Korean-Thai sentence pair/gi, "")
    .replace(/OPUS English pivot:\s*[^|]+/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!simplified || /[A-Za-z]{4,}/.test(simplified) || /pivot/i.test(raw)) {
    return "외부 보강";
  }
  return simplified;
}

function hasNegativeMeaning(text) {
  return /(안|못|없|말고|잘못|틀리|실수|오류|오타|아니)/.test(normalizeText(text));
}

function isTimeLikeQuery(query) {
  return Boolean(isTimeQuestionQuery(query) || extractStandaloneTimeQuery(query) || TIME_QUERY_REGEX.test(normalizeText(query)));
}

function isTimeFocusedEntry(entry) {
  const text = normalizeText(`${entry.korean || ""} ${(entry.keywords || []).join(" ")} ${entry.note || ""}`);
  return /(?:오전|오후)?\s*\d{1,2}\s*시(?:\s*(?:\d{1,2}\s*분|반))?|\d{1,2}:\d{2}|몇\s*시|시간|시예요|시에|분/.test(text);
}

function openMenu() {
  state.menuOpen = true;
  document.body.classList.add("menu-open");
  elements.menuSheet.hidden = false;
  elements.menuOverlay.hidden = false;
  elements.menuButton.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  state.menuOpen = false;
  document.body.classList.remove("menu-open");
  elements.menuSheet.hidden = true;
  elements.menuOverlay.hidden = true;
  elements.menuButton.setAttribute("aria-expanded", "false");
}

function renderQueryInsights(searchProfile) {
  const insights = unique(searchProfile.displayTerms).slice(0, 6);
  elements.queryInsights.innerHTML = "";
  insights.forEach((item) => {
    const chip = document.createElement("span");
    chip.className = "chip insight-chip";
    chip.textContent = item;
    elements.queryInsights.appendChild(chip);
  });
  elements.queryInsightsPanel.hidden = !searchProfile.query || !insights.length;
}

function escapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildCompactPositionMap(text) {
  const chars = Array.from(String(text || ""));
  const positions = [];
  let compact = "";

  chars.forEach((char, index) => {
    if (/[0-9a-zA-Z가-힣\u0E00-\u0E7F]/u.test(char)) {
      compact += char.toLowerCase();
      positions.push(index);
    }
  });

  return { chars, compact, positions };
}

function getHighlightRanges(text, searchProfile) {
  const terms = (searchProfile?.highlightTerms || []).filter(Boolean);
  if (!terms.length) return [];

  const mapped = buildCompactPositionMap(text);
  if (!mapped.compact) return [];

  const ranges = [];
  terms.forEach((term) => {
    const compactTerm = compactText(term);
    if (!compactTerm || compactTerm.length < 2) return;

    let startIndex = mapped.compact.indexOf(compactTerm);
    while (startIndex !== -1) {
      const start = mapped.positions[startIndex];
      const end = mapped.positions[startIndex + compactTerm.length - 1] + 1;
      const overlaps = ranges.some((range) => start < range.end && end > range.start);
      if (!overlaps) {
        ranges.push({ start, end });
        break;
      }
      startIndex = mapped.compact.indexOf(compactTerm, startIndex + 1);
    }
  });

  return ranges.sort((left, right) => left.start - right.start);
}

function renderHighlightedText(element, text, searchProfile) {
  const content = String(text || "");
  const ranges = getHighlightRanges(content, searchProfile);
  if (!ranges.length) {
    element.textContent = content;
    return;
  }

  const chars = Array.from(content);
  let cursor = 0;
  let html = "";
  ranges.forEach((range) => {
    html += escapeHtml(chars.slice(cursor, range.start).join(""));
    html += `<mark class="match-mark">${escapeHtml(chars.slice(range.start, range.end).join(""))}</mark>`;
    cursor = range.end;
  });
  html += escapeHtml(chars.slice(cursor).join(""));
  element.innerHTML = html;
}

function createEntryCard(entry, searchProfile = null) {
  const card = document.createElement("article");
  card.className = "entry-card";

  const korean = document.createElement("p");
  korean.className = "entry-korean entry-korean-main";
  renderHighlightedText(korean, entry.korean, searchProfile);

  const thai = document.createElement("p");
  thai.className = "entry-thai";
  thai.textContent = getDisplayPronunciationText(entry) || entry.thai;

  card.append(korean, thai);

  const displayNote = getDisplayNoteText(entry);
  if (displayNote) {
    const note = document.createElement("p");
    note.className = "entry-note";
    renderHighlightedText(note, displayNote, searchProfile);
    card.appendChild(note);
  }

  const footer = document.createElement("div");
  footer.className = "entry-footer";
  let hasFooterAction = false;

  const thaiScriptText = getThaiScriptText(entry);
  if (thaiScriptText && compactText(thaiScriptText) !== compactText(entry.thai)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `mini-button${state.revealedThaiIds.has(entry.id) ? " active" : ""}`;
    button.textContent = state.revealedThaiIds.has(entry.id) ? "태국어 숨기기" : "태국어 보기";
    wirePressFeedback(button);

    const panel = document.createElement("div");
    panel.className = "thai-script-panel";
    panel.hidden = !state.revealedThaiIds.has(entry.id);

    const label = document.createElement("span");
    label.className = "thai-script-label";
    label.textContent = "현지인에게 보여주기";

    const script = document.createElement("p");
    script.className = "thai-script-text";
    script.textContent = thaiScriptText;

    panel.append(label, script);
    button.addEventListener("click", () => {
      if (state.revealedThaiIds.has(entry.id)) {
        state.revealedThaiIds.delete(entry.id);
      } else {
        state.revealedThaiIds.add(entry.id);
      }
      const visible = state.revealedThaiIds.has(entry.id);
      button.classList.toggle("active", visible);
      button.textContent = visible ? "태국어 숨기기" : "태국어 보기";
      panel.hidden = !visible;
    });

    footer.appendChild(button);
    hasFooterAction = true;
    card.appendChild(panel);
  } else if (!thaiScriptText) {
    const missingNote = document.createElement("p");
    missingNote.className = "entry-note";
    missingNote.textContent = "태국 문자 미보강 · 위 발음 표기만 있어요";
    card.appendChild(missingNote);
  }

  if (hasFooterAction) {
    card.appendChild(footer);
  }

  return card;
}

function createAiSummaryCard(result, searchProfile) {
  const card = document.createElement("article");
  card.className = "entry-card ai-summary-card";

  const title = document.createElement("p");
  title.className = "ai-summary-title";
  title.textContent = result.normalizedQuery || state.query || "AI 보강";

  if (result.confidence !== null) {
    const badge = document.createElement("span");
    badge.className = "ai-summary-badge";
    badge.textContent = `신뢰도 ${Math.round(Math.max(0, Math.min(1, result.confidence)) * 100)}%`;
    title.appendChild(badge);
  }

  card.appendChild(title);

  if (result.intent) {
    const intent = document.createElement("p");
    intent.className = "entry-note";
    renderHighlightedText(intent, `AI 해석: ${result.intent}`, searchProfile);
    card.appendChild(intent);
  }

  if (result.hints.length) {
    const hints = document.createElement("p");
    hints.className = "entry-note";
    hints.textContent = `확장 키워드: ${result.hints.join(", ")}`;
    card.appendChild(hints);
  }

  if (result.caution) {
    const caution = document.createElement("p");
    caution.className = "entry-note";
    caution.textContent = `참고: ${result.caution}`;
    card.appendChild(caution);
  }

  return card;
}

function renderAiAssist(context) {
  if (!elements.aiAssistButton || !elements.aiAssistPanel) return;

  const query = String(context?.query || state.query || "").trim();
  const configured = hasConfiguredAiAssist();
  const sameQuery = Boolean(query && state.aiAssist.query === query);
  const isLoading = sameQuery && state.aiAssist.status === "loading";

  elements.aiAssistButton.disabled = !query || isLoading;
  elements.aiAssistButton.textContent = isLoading ? "AI 보는 중..." : "AI 보강";
  elements.aiAssistButton.title = configured
    ? "로컬 검색이 애매할 때 AI가 뜻을 다시 풀어줍니다."
    : "메뉴에서 AI 프록시 URL을 저장하면 사용할 수 있습니다.";

  if (!query || (!configured && !isLoading) || (!sameQuery && state.aiAssist.status !== "loading")) {
    elements.aiAssistPanel.hidden = true;
    elements.aiAssistResults.innerHTML = "";
    elements.aiAssistMeta.textContent = "";
    elements.aiAssistStatus.hidden = true;
    elements.aiAssistStatus.textContent = "";
    return;
  }

  elements.aiAssistPanel.hidden = false;
  elements.aiAssistResults.innerHTML = "";
  elements.aiAssistMeta.textContent = "";
  elements.aiAssistStatus.hidden = true;
  elements.aiAssistStatus.textContent = "";

  if (state.aiAssist.status === "loading" && sameQuery) {
    elements.aiAssistMeta.textContent = state.aiAssist.trigger === "auto" ? "자동 보강" : "수동 보강";
    elements.aiAssistStatus.hidden = false;
    elements.aiAssistStatus.textContent = "AI가 검색어를 다시 해석하고 있어요.";
    return;
  }

  if (state.aiAssist.status === "error" && sameQuery) {
    elements.aiAssistMeta.textContent = "AI 보강 실패";
    elements.aiAssistStatus.hidden = false;
    elements.aiAssistStatus.textContent = state.aiAssist.error || "AI 보강 요청에 실패했습니다.";
    return;
  }

  if (state.aiAssist.status !== "done" || !sameQuery || !state.aiAssist.result) {
    elements.aiAssistPanel.hidden = true;
    return;
  }

  const result = state.aiAssist.result;
  const totalCount = result.vocab.length + result.sentences.length;
  if (!totalCount) {
    elements.aiAssistMeta.textContent = "AI가 확실한 보강 표현을 찾지 못했습니다.";
    elements.aiAssistStatus.hidden = false;
    elements.aiAssistStatus.textContent = "로컬 결과를 먼저 쓰고, 더 구체적인 검색어로 다시 시도해 주세요.";
    return;
  }

  elements.aiAssistMeta.textContent =
    result.model ? `${state.aiAssist.trigger === "auto" ? "자동 보강" : "수동 보강"} · ${result.model}` : state.aiAssist.trigger === "auto" ? "자동 보강" : "수동 보강";
  elements.aiAssistResults.appendChild(createAiSummaryCard(result, context?.searchProfile || null));
  result.vocab.forEach((entry) => {
    elements.aiAssistResults.appendChild(createEntryCard(entry, context?.searchProfile || null));
  });
  result.sentences.forEach((entry) => {
    elements.aiAssistResults.appendChild(createEntryCard(entry, context?.searchProfile || null));
  });
}

function renderEntryStack(container, entries, emptyMessage, searchProfile = null) {
  container.innerHTML = "";
  if (!entries.length) {
    container.appendChild(createEmptyState(emptyMessage));
    return;
  }
  entries.forEach((entry) => {
    container.appendChild(createEntryCard(entry, searchProfile));
  });
}

function renderStats(merged) {
  const totalCustom = state.custom.vocab.length + state.custom.sentences.length;
  const activeScenario = baseData.scenarios.find((item) => item.id === state.scenario);
  const items = [
    { label: "전체 단어", value: merged.vocab.length },
    { label: "전체 문장", value: merged.sentences.length },
    { label: "내가 추가", value: totalCustom },
    { label: "현재 필터", value: activeScenario ? activeScenario.label : "전체" },
  ];

  elements.statsGrid.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "stat-card";
    const label = document.createElement("span");
    label.textContent = item.label;
    const value = document.createElement("strong");
    value.textContent = String(item.value);
    card.append(label, value);
    elements.statsGrid.appendChild(card);
  });
}

function renderCustomEntries() {
  const customEntries = [...state.custom.vocab, ...state.custom.sentences].sort((left, right) =>
    String(right.createdAt || "").localeCompare(String(left.createdAt || ""))
  );

  elements.customSummary.textContent = `직접 추가한 항목 ${customEntries.length}개입니다. JSON으로 백업하면 다른 폰에서도 다시 가져올 수 있습니다.`;

  elements.customEntries.innerHTML = "";
  if (!customEntries.length) {
    elements.customEntries.appendChild(createEmptyState("직접 추가한 항목이 아직 없습니다."));
    return;
  }

  customEntries.slice(0, 12).forEach((entry) => {
    const row = document.createElement("article");
    row.className = "entry-card";

    const wrap = document.createElement("div");
    wrap.className = "custom-row";

    const info = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = `${entry.kind === "vocab" ? "단어" : "문장"} · ${entry.korean}`;
    const description = document.createElement("p");
    description.className = "entry-note";
    description.textContent = entry.thai;
    info.append(title, description);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "mini-button";
    button.textContent = "삭제";
    wirePressFeedback(button);
    button.addEventListener("click", () => removeCustomEntry(entry.id, entry.kind));

    wrap.append(info, button);
    row.appendChild(wrap);
    elements.customEntries.appendChild(row);
  });
}

function removeCustomEntry(id, kind) {
  const key = kind === "vocab" ? "vocab" : "sentences";
  state.custom[key] = state.custom[key].filter((entry) => entry.id !== id);
  saveCustomData();
  if (state.selectedVocabId === id) {
    state.selectedVocabId = null;
  }
  render();
}

function isBrowsingState() {
  return !state.query;
}

function computeSearchComputation(query = state.query) {
  const merged = getMergedData();
  const generated = buildGeneratedNumberEntries(query);
  const numberMode = generated.vocab.length > 0;
  const generatedTimeQuestion = !numberMode ? buildGeneratedTimeQuestionEntries(query) : { vocab: [], sentences: [] };
  const timeQuestionMode = !numberMode && generatedTimeQuestion.vocab.length > 0;
  const generatedTime = !numberMode && !timeQuestionMode ? buildGeneratedTimeEntries(query) : { vocab: [], sentences: [] };
  const timeMode = !numberMode && !timeQuestionMode && generatedTime.vocab.length > 0;
  const vocabSource = merged.vocab;
  const sentenceSource = merged.sentences;
  const searchProfile = buildSearchProfile(query, numberMode || timeQuestionMode || timeMode ? [] : vocabSource);
  const exactVocabMatch = numberMode ? null : findExactEntry(merged.vocab, searchProfile);
  const exactSentenceMatch = numberMode ? null : findExactEntry(merged.sentences, searchProfile, { includeTemplates: true });
  const preliminaryVocabResults =
    numberMode || timeQuestionMode || timeMode
      ? []
      : uniqueById([...(exactVocabMatch ? [exactVocabMatch] : []), ...getVocabResults(vocabSource, searchProfile)]);
  const generatedComposed =
    !numberMode && !timeQuestionMode && !timeMode
      ? buildGeneratedComposedEntries(query, searchProfile, vocabSource)
      : { vocab: [], sentences: [], suppressFallbackSentences: false };
  const generatedWhereQuestion =
    !numberMode && !timeQuestionMode && !timeMode
      ? buildGeneratedWhereQuestionEntries(query, searchProfile, vocabSource)
      : { vocab: [], sentences: [], suppressFallbackSentences: false };
  const generatedWhatQuestion =
    !numberMode && !timeQuestionMode && !timeMode
      ? buildGeneratedWhatQuestionEntries(query, searchProfile, vocabSource)
      : { vocab: [], sentences: [], suppressFallbackSentences: false };
  const generatedPredicate =
    !numberMode && !timeQuestionMode && !timeMode
      ? buildGeneratedPredicateEntries(query)
      : { vocab: [], sentences: [], suppressFallbackSentences: false };
  const generatedThaiMeaning =
    !numberMode && !timeQuestionMode && !timeMode
      ? buildGeneratedThaiMeaningEntries(query, searchProfile, vocabSource)
      : { vocab: [], sentences: [], suppressFallbackSentences: false };
  const generatedAssist = mergeGeneratedEntrySets(
    generatedComposed,
    generatedWhereQuestion,
    generatedWhatQuestion,
    generatedPredicate,
    generatedThaiMeaning
  );
  const composedMode = Boolean(generatedAssist.vocab.length || generatedAssist.sentences.length);
  const strictPhraseMode = Boolean(
    searchProfile.templateTerms.length || (searchProfile.objectTerms.length && searchProfile.actionTerms.length)
  );
  const safeExactSentenceMatch =
    exactSentenceMatch &&
    ((strictPhraseMode && exactSentenceMatch.source === "generated-bulk") ||
      generatedWhereQuestion.suppressFallbackSentences ||
      !shouldKeepExactSentenceMatch(exactSentenceMatch, searchProfile))
      ? null
      : exactSentenceMatch;
  const refinedVocabResults = composedMode
    ? preliminaryVocabResults.filter((entry) => entry.source !== "generated-bulk")
    : preliminaryVocabResults;
  const refinedSentenceCandidates =
    generatedAssist.suppressFallbackSentences
      ? []
      : (composedMode || strictPhraseMode) && !numberMode && !timeQuestionMode && !timeMode
        ? getSentenceResults(
            sentenceSource,
            searchProfile,
            uniqueByMeaning([...generatedAssist.vocab, ...refinedVocabResults])
          ).filter((entry) => entry.source !== "generated-bulk")
        : !numberMode && !timeQuestionMode && !timeMode
          ? getSentenceResults(sentenceSource, searchProfile, uniqueByMeaning([...generatedAssist.vocab, ...refinedVocabResults]))
          : [];
  const allVocabResults = numberMode
    ? generated.vocab
    : timeQuestionMode
      ? generatedTimeQuestion.vocab
      : timeMode
        ? generatedTime.vocab
        : uniqueByMeaning(uniqueById([...generatedAssist.vocab, ...refinedVocabResults]));
  const vocabResults = query ? allVocabResults.slice(0, RESULT_LIMITS.vocab) : [];
  const sentenceResults = query
    ? (numberMode
        ? generated.sentences
        : timeQuestionMode
          ? uniqueById([...(safeExactSentenceMatch ? [safeExactSentenceMatch] : []), ...generatedTimeQuestion.sentences]).slice(
              0,
              RESULT_LIMITS.sentences
            )
          : timeMode
            ? generatedTime.sentences
            : uniqueByMeaning(
                uniqueById([
                  ...(safeExactSentenceMatch ? [safeExactSentenceMatch] : []),
                  ...generated.sentences,
                  ...generatedAssist.sentences,
                  ...refinedSentenceCandidates,
                ])
              ).slice(0, RESULT_LIMITS.sentences))
    : [];
  const thaiOnlySearch = isThaiOnlySearch(searchProfile);

  return {
    merged,
    searchProfile,
    exactVocabMatch,
    safeExactSentenceMatch,
    numberMode,
    timeQuestionMode,
    timeMode,
    composedMode,
    thaiOnlySearch,
    vocabResults,
    sentenceResults,
  };
}

function getSearchComputation(query = state.query) {
  const trimmedQuery = String(query || "").trim();
  const cacheKey = buildSearchComputationCacheKey(trimmedQuery);
  const cached = searchComputationCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const computed = computeSearchComputation(trimmedQuery);
  searchComputationCache.set(cacheKey, computed);
  if (searchComputationCache.size > 32) {
    const oldestKey = searchComputationCache.keys().next().value;
    if (oldestKey) searchComputationCache.delete(oldestKey);
  }
  return computed;
}

function render() {
  const {
    merged,
    searchProfile,
    exactVocabMatch,
    safeExactSentenceMatch,
    numberMode,
    timeQuestionMode,
    timeMode,
    composedMode,
    thaiOnlySearch,
    vocabResults,
    sentenceResults,
  } = getSearchComputation(state.query);
  const browsing = isBrowsingState();
  const expandedHint =
    !timeQuestionMode && searchProfile.displayTerms.length
      ? ` · 함께 찾은 핵심어: ${searchProfile.displayTerms.join(" / ")}`
      : "";
  const activeScenario = baseData.scenarios.find((item) => item.id === state.scenario);

  elements.searchInput.value = state.query;
  elements.datasetNote.textContent = baseData.note || "";
  elements.resultStack.hidden = browsing;

  elements.searchStatus.textContent = browsing
    ? "한국어와 태국어 둘 다 검색할 수 있습니다. 한국어는 바로 쓸 태국어를, 태국어는 한국어 뜻을 먼저 보여줍니다."
    : numberMode
      ? `숫자 변환: 읽기 ${vocabResults.length}개 · 활용 ${sentenceResults.length}개${expandedHint}`
      : timeQuestionMode
        ? `시간 질문: 단어 ${vocabResults.length}개 · 회화 ${sentenceResults.length}개${expandedHint}`
      : timeMode
        ? `시간 검색: 단어 ${vocabResults.length}개 · 회화 ${sentenceResults.length}개${expandedHint}`
      : thaiOnlySearch && composedMode
        ? `태국어 해석: 단어 ${vocabResults.length}개 · 회화 ${sentenceResults.length}개${expandedHint}`
      : composedMode
        ? `검색됨: 단어 ${vocabResults.length}개 · 회화 ${sentenceResults.length}개 · 자동 조합 적용${expandedHint}`
        : `검색됨: 단어 ${vocabResults.length}개 · 회화 ${sentenceResults.length}개${expandedHint}`;

  elements.filterSummary.textContent =
    state.scenario === "all"
      ? "필터: 전체 검색"
      : `필터 적용 중: ${activeScenario ? activeScenario.label : state.scenario}만 보기`;

  elements.activeSummary.textContent = browsing
    ? ""
    : thaiOnlySearch
      ? `검색어 "${state.query}"를 태국어에서 한국어 뜻 중심으로 찾고 있습니다.`
      : `검색어 "${state.query}"를 핵심 단어와 회화로 나눠서 찾고 있습니다.`;

  elements.vocabMeta.textContent = state.query
    ? numberMode
      ? "숫자는 태국어 읽기와 태국 숫자 표기를 함께 보여줍니다."
      : timeQuestionMode
        ? "현재 시간을 묻는 표현과 기기 기준 현재 시각을 먼저 보여줍니다."
      : timeMode
        ? "검색한 시간을 그대로 변형해서 읽기와 시간 표현을 먼저 보여줍니다."
      : thaiOnlySearch && composedMode
        ? "태국어 문장을 분해해서 한국어 핵심 뜻을 먼저 올렸습니다."
      : thaiOnlySearch
        ? "태국어 검색이라서 한국어 뜻과 가까운 단어를 먼저 올렸습니다."
      : composedMode
        ? "핵심 단어를 먼저 잡고, 요청 문장은 자동으로 조합해 맨 위에 올렸습니다."
      : safeExactSentenceMatch
        ? "핵심 단어를 먼저 보여주고, 아래에 정확히 맞는 회화를 맨 위에 올렸습니다."
      : searchProfile.objectTerms.length && searchProfile.actionTerms.length
        ? "문장형 검색이라도 먼저 잡아둘 단어를 위에 보여줍니다."
      : "문장을 잘게 풀어서 먼저 잡아둘 단어부터 보여줍니다."
    : "검색어를 넣으면 관련 단어가 나옵니다.";
  elements.sentenceMeta.textContent = state.query
    ? numberMode
      ? "가격이나 수량으로 바로 보여줄 수 있게 같이 만들었습니다."
      : timeQuestionMode
        ? "지금 몇 시인지 묻거나 답할 때 바로 보여줄 수 있게 만들었습니다."
      : timeMode
        ? "검색한 시간 그대로 문장에 넣어서 바로 보여줄 수 있게 만들었습니다."
      : thaiOnlySearch && composedMode
        ? "태국어 문장을 해석해서 바로 쓸 한국어 문장을 먼저 보여줍니다."
      : thaiOnlySearch
        ? "태국어 검색이라서 해당 표현이 들어간 한국어 회화를 우선해서 보여줍니다."
      : composedMode
        ? "입력한 표현에서 목적어와 동사를 나눠 바로 보여줄 문장을 먼저 만들었습니다."
      : "위 단어를 바탕으로 바로 보여주기 좋은 회화만 추렸습니다."
    : "검색어를 넣으면 관련 회화가 나옵니다.";

  const currentSearchContext = {
    query: state.query,
    searchProfile,
    vocabResults,
    sentenceResults,
    exactVocabMatch: Boolean(exactVocabMatch),
    exactSentenceMatch: Boolean(safeExactSentenceMatch),
    numberMode,
    timeMode,
    timeQuestionMode,
  };
  state.lastSearchContext = currentSearchContext;

  renderScenarioChips();
  renderQuickSearches();
  renderQueryInsights(searchProfile);
  renderAiAssist(currentSearchContext);
  renderStats(merged);
  renderEntryStack(
    elements.vocabResults,
    vocabResults,
    "맞는 단어가 아직 없습니다. 더 짧은 핵심어로 검색해 보세요.",
    searchProfile
  );
  renderEntryStack(
    elements.sentenceResults,
    sentenceResults,
    "맞는 회화가 아직 없습니다. 다른 표현으로 검색하거나 단어를 먼저 검색해 보세요.",
    searchProfile
  );
  renderCustomEntries();
  syncUrl();

  if (shouldAutoRunAiAssist(currentSearchContext)) {
    const alreadyRequested =
      state.aiAssist.query === currentSearchContext.query &&
      (state.aiAssist.status === "loading" || state.aiAssist.status === "done");
    if (!alreadyRequested) {
      window.setTimeout(() => {
        if (state.lastSearchContext?.query === currentSearchContext.query) {
          requestAiAssist(currentSearchContext, { trigger: "auto" });
        }
      }, 20);
    }
  }
}

function submitEntryForm(event) {
  event.preventDefault();
  const formData = new FormData(elements.entryForm);
  const kind = String(formData.get("kind") || "vocab");
  const entry = hydrateEntry(
    {
      kind,
      source: "custom",
      sheet: "직접 추가",
      thai: String(formData.get("thai") || "").trim(),
      korean: String(formData.get("korean") || "").trim(),
      note: String(formData.get("note") || "").trim(),
      tags: sortTags(
        unique(
          String(formData.get("tags") || "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        )
      ),
      createdAt: new Date().toISOString(),
    },
    kind
  );

  if (kind === "vocab") {
    state.custom.vocab.unshift(entry);
  } else {
    state.custom.sentences.unshift(entry);
  }

  saveCustomData();
  elements.entryForm.reset();
  elements.saveFeedback.textContent = `"${entry.korean}" 항목을 저장했습니다.`;
  render();
}

function exportCustomData() {
  const payload = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    vocab: state.custom.vocab,
    sentences: state.custom.sentences,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "thai-pocketbook-custom.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importCustomData(event) {
  const [file] = event.target.files || [];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      state.custom = {
        vocab: Array.isArray(parsed.vocab) ? parsed.vocab.map((entry) => hydrateEntry(entry, "vocab")) : [],
        sentences: Array.isArray(parsed.sentences)
          ? parsed.sentences.map((entry) => hydrateEntry(entry, "sentence"))
          : [],
      };
      saveCustomData();
      elements.saveFeedback.textContent = "JSON 데이터를 가져왔습니다.";
      render();
    } catch (error) {
      console.error("가져오기 실패", error);
      elements.saveFeedback.textContent = "JSON 파일을 읽지 못했습니다.";
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file, "utf-8");
}

function clearCustomEntries() {
  if (!window.confirm("직접 추가한 항목을 모두 비울까요?")) return;
  state.custom = { vocab: [], sentences: [] };
  saveCustomData();
  state.selectedVocabId = null;
  elements.saveFeedback.textContent = "직접 추가한 항목을 모두 지웠습니다.";
  render();
}

function registerServiceWorker() {
  if (!window.location.protocol.startsWith("http")) return;

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister().catch((error) => {
          console.error("서비스워커 해제 실패", error);
        });
      });
    });
  }

  if ("caches" in window) {
    caches.keys().then((keys) => {
      keys.forEach((key) => {
        caches.delete(key).catch((error) => {
          console.error("캐시 삭제 실패", error);
        });
      });
    });
  }
}

function scheduleSearchRuntimeWarmup() {
  if (searchRuntimeWarmupQueued || searchRuntimeWarmupDone) return;
  searchRuntimeWarmupQueued = true;

  const warmup = () => {
    if (searchRuntimeWarmupDone) return;
    searchRuntimeWarmupDone = true;
    try {
      getSearchRuntime(hydratedBaseData.vocab);
      getSearchRuntime(hydratedBaseData.sentences);
    } catch (error) {
      console.error("검색 런타임 준비 실패", error);
    }
  };

  window.setTimeout(warmup, 40);
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(warmup, { timeout: 300 });
  }
}

function wireEvents() {
  elements.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    queueSearch(elements.searchInput.value.trim(), { scrollResults: true });
  });

  elements.searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      queueSearch(elements.searchInput.value.trim(), { scrollResults: true });
    }
  });

  [
    elements.searchButton,
    elements.jumpVocabButton,
    elements.jumpSentenceButton,
    elements.aiAssistButton,
    elements.resetFiltersButton,
    elements.menuButton,
    elements.menuCloseButton,
    elements.exportButton,
    elements.importButton,
    elements.clearCustomButton,
  ].forEach(wirePressFeedback);

  elements.jumpVocabButton.addEventListener("click", () => jumpToSection(elements.vocabSection));
  elements.jumpSentenceButton.addEventListener("click", () => jumpToSection(elements.sentenceSection));
  elements.aiAssistButton.addEventListener("click", () => requestAiAssist(state.lastSearchContext, { trigger: "manual" }));

  elements.resetFiltersButton.addEventListener("click", () => {
    state.scenario = "all";
    render();
  });

  elements.menuButton.addEventListener("click", () => {
    if (state.menuOpen) closeMenu();
    else openMenu();
  });

  elements.menuCloseButton.addEventListener("click", closeMenu);
  elements.menuOverlay.addEventListener("click", closeMenu);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.menuOpen) {
      closeMenu();
    }
  });

  elements.entryForm.addEventListener("submit", submitEntryForm);
  elements.aiSettingsForm?.addEventListener("submit", submitAiSettings);
  elements.exportButton.addEventListener("click", exportCustomData);
  elements.importButton.addEventListener("click", () => elements.importInput.click());
  elements.importInput.addEventListener("change", importCustomData);
  elements.clearCustomButton.addEventListener("click", clearCustomEntries);
}

function boot() {
  wireEvents();
  syncAiSettingsForm();
  setSearchButtonBusy(false);
  const initial = readStateFromUrl();
  const scenarioIds = new Set(baseData.scenarios.map((item) => item.id));
  state.query = initial.query;
  state.scenario = scenarioIds.has(initial.scenario) ? initial.scenario : "all";
  render();
  scheduleSearchRuntimeWarmup();
  registerServiceWorker();
}

try {
  boot();
} catch (error) {
  console.error("앱 초기화 실패", error);
  if (elements.searchStatus) {
    elements.searchStatus.textContent = "앱을 다시 불러오는 중 문제가 생겼습니다. 새로고침 후 다시 시도해 주세요.";
  }
}
