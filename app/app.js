const STORAGE_KEY = "thai-pocketbook-custom-v1";
const EXPORT_VERSION = 1;
const APP_VERSION = "20260413c";

const baseData = window.BASE_DATA || {
  appTitle: "태국어 포켓북",
  note: "",
  scenarios: [],
  vocab: [],
  sentences: [],
  stats: {},
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

const STOPWORDS = new Set(["이", "그", "저", "것", "거", "좀", "더", "요", "은", "는", "이거"]);
const GENERIC_ANCHOR_TERMS = new Set(["주세요", "주세여", "부탁", "좀", "지금", "현재", "시간", "몇시", "공구", "기계", "문제"]);
const THAI_SCRIPT_REGEX = /[\u0E00-\u0E7F]/;
const NUMBER_QUERY_REGEX = /^[+-]?(?:(?:\d+(?:\.\d+)?)|(?:\.\d+))$/;
const TIME_QUERY_REGEX = /^(?:(오전|오후)\s*)?\d{1,2}\s*시(?:\s*\d{1,2}\s*분)?$|^(?:(오전|오후)\s*)?\d{1,2}:\d{2}$/;
const TIME_EXTRACT_REGEX = /(?:(오전|오후)\s*)?\d{1,2}\s*시(?:\s*\d{1,2}\s*분)?|(?:(오전|오후)\s*)?\d{1,2}:\d{2}/;
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

const QUERY_BUNDLES = [
  {
    patterns: [/(방|객실|룸).*(바꿔|바꾸|변경|교체)/, /(다른|새).*(방|객실)/],
    primary: ["방", "객실", "바꾸다", "변경"],
    related: [
      "방 바꿔주세요",
      "방을 좀 바꿔주실 수 있나요",
      "다른 방",
      "다른 방 있나요",
      "이 방은 너무 시끄러워요",
      "에어컨이 안 시원해요",
      "화장실에 문제가 있어요",
      "온수가 안 나와요",
      "오늘 밤 빈 방 있나요",
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
  { patterns: [/방|객실|룸/], primary: ["방", "객실"], related: ["다른 방"], display: ["방"], tags: ["이동"] },
  { patterns: [/바꿔|바꾸|변경|교체/], primary: ["바꾸다", "변경"], related: ["방 바꿔주세요"], display: ["바꾸다"], tags: ["이동"] },
  { patterns: [/주세요|부탁|도와|해줘/], related: ["주세요", "부탁"], display: ["부탁"], tags: ["기본회화"] },
  { patterns: [/얼마|가격|비싸|깎/], primary: ["얼마", "가격"], related: ["비싸다", "깎아주세요"], display: ["가격"], tags: ["쇼핑"] },
  { patterns: [/계산|결제|영수증|카드/], primary: ["계산"], related: ["결제", "영수증", "카드"], display: ["계산"], tags: ["식당", "쇼핑"] },
  { patterns: [/물|생수/], primary: ["물", "생수"], related: ["차가운 물", "따뜻한 물"], display: ["물"], tags: ["식당", "건강"] },
  { patterns: [/화장실|욕실|변기/], primary: ["화장실"], related: ["욕실", "어디", "가다"], display: ["화장실"], tags: ["이동", "건강"] },
  { patterns: [/가다|간다|가요|갑니다|갈게|갈래|가고|갔다/], primary: ["가다"], related: ["어디", "화장실", "공항"], display: ["가다"], tags: ["이동", "기본회화"] },
  { patterns: [/오다|온다|와요|옵니다|올게|오고|왔다/], primary: ["오다"], related: ["여기로 오세요"], display: ["오다"], tags: ["이동", "기본회화"] },
  { patterns: [/먹다|먹어요|먹는다|먹고/], primary: ["먹다"], related: ["메뉴", "음식"], display: ["먹다"], tags: ["식당", "기본회화"] },
  { patterns: [/마시다|마셔|마신다/], primary: ["마시다"], related: ["물", "음료"], display: ["마시다"], tags: ["식당", "기본회화"] },
  { patterns: [/주스|쥬스|음료/], primary: ["주스", "음료"], related: ["과일", "수박", "오렌지"], display: ["주스"], tags: ["식당", "쇼핑"] },
  { patterns: [/보다|봐요|본다/], primary: ["보다"], related: ["여기", "보여주세요"], display: ["보다"], tags: ["기본회화"] },
  { patterns: [/말하다|말해|말해요|말한다/], primary: ["말하다"], related: ["천천히", "다시"], display: ["말하다"], tags: ["기본회화"] },
  { patterns: [/이해|알겠|알겠습니다|알겠어/], primary: ["이해"], related: ["이해해요", "이해하나요", "이해합니다", "알겠습니다"], display: ["이해"], tags: ["기본회화"] },
  { patterns: [/급해|급하다|서둘러|급합니다|빨리좀|빨리 해/], primary: ["급하다", "빨리"], related: ["서둘러", "지금", "바로"], display: ["급하다"], tags: ["기본회화"] },
  { patterns: [/빨래|세탁|세탁기|세탁실|건조기|세제/], primary: ["빨래", "세탁"], related: ["세탁기", "세탁실", "건조기", "세제"], display: ["빨래"], tags: ["기본회화", "이동"] },
  { patterns: [/병원|약국|약|아파|두통|열/], primary: ["병원", "약"], related: ["아프다", "두통", "열"], display: ["병원"], tags: ["건강"] },
  { patterns: [/머리|배|복통|두통|기침|콧물|어지러|멀미|설사|구토|토할|상처|허리|다리|무릎|숨쉬기/], primary: ["아프다", "병원"], related: ["약국", "의사", "약", "도와주세요"], display: ["건강"], tags: ["건강"] },
  { patterns: [/티셔츠|셔츠|바지|치마|원피스|드레스|자켓|재킷|점퍼|속옷|양말|신발|모자|우산|수영복/], primary: ["옷"], related: ["사이즈", "색", "보여주세요"], display: ["옷"], tags: ["쇼핑"] },
  { patterns: [/엔드밀|드릴|커터|공구|공구함|비트|홀더/], primary: ["엔드밀", "공구"], related: ["드릴", "커터", "홀더", "가져와 주세요"], display: ["공구"], tags: ["일터"] },
  { patterns: [/기계|장비|라인|공장|작업|현장/], primary: ["기계", "작업"], related: ["가동", "작동", "시작하다", "멈추다", "공장"], display: ["기계"], tags: ["일터"] },
  { patterns: [/가동|작동|켜|끄|멈춰|멈추|정지|중지|시작/], primary: ["작동", "시작하다"], related: ["기계", "가동", "멈추다", "켜다", "끄다"], display: ["작동"], tags: ["일터"] },
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
    related: ["다른 방", "빈 방", "방 바꿔주세요", "객실 변경", "조용한 방", "깨끗한 방"],
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
    related: ["화장실 어디예요", "화장실 가고 싶어요", "가다", "샤워기", "온수"],
    display: ["화장실"],
    tags: ["이동", "건강"],
  },
  {
    matches: ["화장실간다", "화장실가고싶어", "화장실가고싶어요", "화장실가", "화장실가야해", "화장실어디에요", "화장실어디예요", "화장실이어디예요"],
    primary: ["화장실", "가다"],
    related: ["화장실 가고 싶어요", "화장실 어디예요", "화장실", "어디"],
    display: ["화장실", "가다"],
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
    matches: ["빨래", "세탁", "세탁기", "세탁실", "건조기", "세제", "빨래해주세요", "세탁해주세요", "빨래맡기고싶어요"],
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
    matches: ["잘못된방법", "그건잘못된방법이야", "틀린방법", "그방법틀렸어"],
    primary: ["잘못", "틀리다", "방법"],
    related: ["그건 잘못된 방법이야", "다르게 해야 해요", "이건 맞는 방법이에요"],
    display: ["잘못된 방법"],
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
];

const QUERY_ENDINGS = [
  { suffix: "해주세요", primary: ["하다"], related: ["부탁", "주세요"], display: ["부탁"] },
  { suffix: "해줘요", primary: ["하다"], related: ["부탁", "주세요"], display: ["부탁"] },
  { suffix: "해라", primary: ["하다"], related: ["시작하다", "부탁"], display: ["하다"] },
  { suffix: "하자", primary: ["하다"], related: ["같이"], display: ["같이"] },
  { suffix: "가자", primary: ["가다"], related: ["같이"], display: ["같이"] },
  { suffix: "먹자", primary: ["먹다"], related: ["같이"], display: ["같이"] },
  { suffix: "주세요", related: ["주다", "부탁"], display: ["주세요"] },
  { suffix: "있나요", related: ["있다"], display: ["있다"] },
  { suffix: "있어요", related: ["있다"], display: ["있다"] },
  { suffix: "돼요", related: ["되다", "가능"], display: ["가능"] },
  { suffix: "되나요", related: ["되다", "가능"], display: ["가능"] },
];

const searchIndexCache = new WeakMap();
const hydratedBaseData = createHydratedBaseData();

const state = {
  query: "",
  scenario: "all",
  selectedVocabId: null,
  revealedThaiIds: new Set(),
  menuOpen: false,
  searchFrame: 0,
  custom: loadCustomData(),
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
  resetFiltersButton: document.querySelector("#resetFiltersButton"),
  scenarioChips: document.querySelector("#scenarioChips"),
  quickSearchChips: document.querySelector("#quickSearchChips"),
  activeSummary: document.querySelector("#activeSummary"),
  searchStatus: document.querySelector("#searchStatus"),
  filterSummary: document.querySelector("#filterSummary"),
  queryInsightsPanel: document.querySelector("#queryInsightsPanel"),
  queryInsights: document.querySelector("#queryInsights"),
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
};

function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    query: String(params.get("q") || "").trim(),
    scenario: String(params.get("scenario") || "all").trim(),
  };
}

function syncUrl() {
  if (!window.location.protocol.startsWith("http")) return;
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
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
    .replace(/뭐에요/g, "뭐예요")
    .replace(/[“”"'`’]/g, "")
    .replace(/\s+/g, " ");
}

function compactText(text) {
  return normalizeText(text).replace(/[^0-9a-zA-Z가-힣\u0E00-\u0E7F]+/g, "");
}

function tokenize(text) {
  return normalizeText(text)
    .split(/[\s,./()!?+\-:;]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => token.length > 1 || !STOPWORDS.has(token));
}

function isStrongAnchorTerm(term) {
  const compact = compactText(term);
  if (!compact || compact.length < 2) return false;
  if (GENERIC_ANCHOR_TERMS.has(compact)) return false;
  return !/(?:해주세요|해주세여|해줘요|해줘|해요|했어요|했어|하자|가자|먹자|갈래|볼래|주세요|주세여|줘요|줘|있어요|있나요|없어요|없나요|어디예요|어디에요|어디야|몇시예요|몇시에요|몇시야|예요|에요|인가요|나요|니|냐|하다)$/u.test(
    compact
  );
}

function expandQueryVariants(query, rawTokens = []) {
  const variants = [];
  const candidates = [query, ...rawTokens].map((item) => normalizeText(item)).filter(Boolean);
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
    if (item.includes("세탁")) variants.push(item.replace(/세탁/g, "빨래"));
    if (item.includes("빨래")) variants.push(item.replace(/빨래/g, "세탁"));
    if (item.includes("주스")) variants.push(item.replace(/주스/g, "쥬스"));
    if (item.includes("먹으로")) variants.push(item.replace(/먹으로/g, "먹으러"));
    if (/급해|급해요|급합니다|급한데|급하니까/.test(item)) {
      variants.push("급하다", "급해요", "빨리", "서둘러");
    }
    if (/빨래|세탁/.test(item)) {
      variants.push("세탁기", "세탁실", "건조기", "세제");
    }
    if (/주스|쥬스/.test(item)) {
      variants.push("음료", "과일", "물");
    }
    if (/기계|장비|라인|공장|작업/.test(item)) {
      variants.push("기계", "작동", "가동", "시작하다", "멈추다");
    }
    if (/가동|작동|켜|시작/.test(item)) {
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

  return unique(variants.map((item) => normalizeText(item)).filter(Boolean));
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
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

function saveCustomData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.custom));
}

function createHydratedBaseData() {
  return {
    vocab: (baseData.vocab || []).map((entry) => hydrateEntry(entry, "vocab")),
    sentences: (baseData.sentences || []).map((entry) => hydrateEntry(entry, "sentence")),
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

function matchesScenario(entry) {
  return state.scenario === "all" || entry.tags.includes(state.scenario);
}

function buildSearchIndex(entry) {
  const cached = searchIndexCache.get(entry);
  if (cached) return cached;

  const korean = compactText(entry.korean);
  const thai = compactText(entry.thai);
  const thaiScript = compactText(entry.thaiScript);
  const note = compactText(entry.note);
  const keywords = unique((entry.keywords || []).map((item) => compactText(item)));
  const tokens = unique(
    [
      ...tokenize(entry.korean),
      ...tokenize(entry.thai),
      ...tokenize(entry.thaiScript),
      ...tokenize(entry.note),
      ...(entry.keywords || []),
    ].map((item) => compactText(item))
  );
  const index = { korean, thai, thaiScript, note, keywords, tokens };
  searchIndexCache.set(entry, index);
  return index;
}

function normalizeNumberQuery(query) {
  const cleaned = String(query || "").trim().replace(/,/g, "");
  if (!NUMBER_QUERY_REGEX.test(cleaned)) return "";
  if (cleaned.startsWith("+")) return cleaned.slice(1);
  if (cleaned.startsWith(".")) return `0${cleaned}`;
  if (cleaned.startsWith("-.")) return `-0${cleaned.slice(1)}`;
  return cleaned;
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
  const converted = convertNumberToThai(query);
  if (!converted) {
    return { vocab: [], sentences: [] };
  }

  const notePieces = ["한국어식 발음"];
  if (converted.isDecimal) notePieces.push("소수점은 뒤 숫자를 하나씩 읽습니다");
  if (converted.isNegative) notePieces.push("음수는 앞에 ลบ를 붙입니다");

  const baseEntry = hydrateEntry(
    {
      id: `generated-number-read-${converted.normalized}`,
      kind: "vocab",
      source: "generated",
      sheet: "숫자 변환",
      thai: converted.thaiKo,
      thaiScript: converted.thaiScript,
      korean: query,
      note: `${notePieces.join(" · ")} · 영문 표기: ${converted.thaiLatin}`,
      tags: ["숫자·시간", "쇼핑"],
      keywords: [query, converted.normalized, converted.thaiDigits, converted.thaiKo, "숫자", "가격", "수량"],
    },
    "vocab"
  );

  const digitEntry = hydrateEntry(
    {
      id: `generated-number-digits-${converted.normalized}`,
      kind: "vocab",
      source: "generated",
      sheet: "숫자 변환",
      thai: converted.thaiDigits,
      thaiScript: converted.thaiDigits,
      korean: `${query} 태국 숫자`,
      note: "태국 숫자 표기",
      tags: ["숫자·시간"],
      keywords: [query, converted.normalized, converted.thaiDigits, "태국 숫자", "숫자 표기"],
    },
    "vocab"
  );

  const sentenceEntries = [
    hydrateEntry(
      {
        id: `generated-number-say-${converted.normalized}`,
        kind: "sentence",
        source: "generated",
        sheet: "숫자 변환",
        thai: converted.thaiKo,
        thaiScript: converted.thaiScript,
        korean: `${query} 읽기`,
        note: `숫자를 그대로 읽을 때 · 영문 표기: ${converted.thaiLatin}`,
        tags: ["숫자·시간"],
        keywords: [query, converted.normalized, converted.thaiDigits, converted.thaiKo, "숫자 읽기"],
      },
      "sentence"
    ),
    hydrateEntry(
      {
        id: `generated-number-price-${converted.normalized}`,
        kind: "sentence",
        source: "generated",
        sheet: "숫자 변환",
        thai: `${converted.thaiKo} 밧`,
        thaiScript: `${converted.thaiScript}บาท`,
        korean: `${query} 바트`,
        note: `가격으로 바로 보여주기 · 영문 표기: ${converted.thaiLatin} baht`,
        tags: ["쇼핑", "숫자·시간"],
        keywords: [query, converted.normalized, converted.thaiDigits, converted.thaiKo, "바트", "가격", "금액"],
      },
      "sentence"
    ),
  ];

  return {
    vocab: [baseEntry, digitEntry],
    sentences: sentenceEntries,
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
  let matched = body.match(/^(\d{1,2}):(\d{2})$/);
  if (matched) {
    hour = Number(matched[1]);
    minute = Number(matched[2]);
  } else {
    matched = body.match(/^(\d{1,2})\s*시(?:\s*(\d{1,2})\s*분)?$/);
    if (!matched) return null;
    hour = Number(matched[1]);
    minute = matched[2] ? Number(matched[2]) : 0;
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
  const extraKeywords = unique([
    query,
    extracted,
    canonicalKorean,
    canonicalKorean.replace(/\s+/g, ""),
    digital,
    thaiDigital,
    `${displayHour}시`,
    minute ? `${minute}분` : "",
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
          korean: `${parsed.canonicalKorean} 반`,
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

function collectSeedEntries(entries, compactQuery) {
  if (!compactQuery) return [];

  return entries
    .map((entry) => {
      const index = buildSearchIndex(entry);
      const fields = [index.korean, index.thai, index.thaiScript, index.note, ...index.keywords, ...index.tokens];
      let score = 0;

      fields.forEach((field) => {
        if (!field) return;
        if (field === compactQuery) {
          score += 240;
          return;
        }
        if (field.startsWith(compactQuery) || compactQuery.startsWith(field)) {
          score += 110;
          return;
        }
        if (compactQuery.length >= 2 && field.includes(compactQuery)) {
          score += 90;
        }
      });

      return { entry, score };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, RESULT_LIMITS.seedEntries)
    .map((item) => item.entry);
}

function buildSearchProfile(query, entries = []) {
  const trimmedQuery = String(query || "").trim();
  const normalized = normalizeText(trimmedQuery);
  const compact = compactText(trimmedQuery);
  const rawTokens = tokenize(trimmedQuery);
  const expandedVariants = expandQueryVariants(trimmedQuery, rawTokens);
  const expandedCompacts = expandedVariants.map((item) => compactText(item)).filter(Boolean);
  const patternTexts = unique([trimmedQuery, normalized, compact, ...expandedVariants, ...expandedCompacts]);
  const aliasTexts = unique([compact, ...expandedCompacts]);
  const primaryTerms = [...rawTokens, ...expandedVariants];
  const relatedTerms = [];
  const displayTerms = [];
  const tags = [];

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
    if (aliasTexts.some((text) => text.endsWith(compactText(rule.suffix)))) {
      primaryTerms.push(...(rule.primary || []));
      relatedTerms.push(...(rule.related || []));
      displayTerms.push(...(rule.display || []));
    }
  });

  collectSeedEntries(entries, compact).forEach((entry) => {
    const index = buildSearchIndex(entry);
    primaryTerms.push(...tokenize(entry.korean));
    relatedTerms.push(...(entry.keywords || []).slice(0, 8));
    relatedTerms.push(...index.tokens.slice(0, 6));
    displayTerms.push(entry.korean);
    tags.push(...(entry.tags || []));
  });

  const primaryCompacts = unique(
    primaryTerms
      .map((item) => compactText(item))
      .filter(Boolean)
      .filter((item) => item.length > 1 || !STOPWORDS.has(item))
  );
  const relatedCompacts = unique(
    relatedTerms
      .map((item) => compactText(item))
      .filter(Boolean)
      .filter((item) => item.length > 1 || !STOPWORDS.has(item))
      .filter((item) => !primaryCompacts.includes(item))
  );
  const rawAnchorTerms = unique(rawTokens.map((item) => compactText(item)).filter(isStrongAnchorTerm));
  const fallbackAnchorTerms = rawAnchorTerms.length
    ? []
    : unique(
        displayTerms
          .map((item) => compactText(item))
          .filter((item) => isStrongAnchorTerm(item) && compact.includes(item))
      );

  return {
    query: trimmedQuery,
    normalized,
    compact,
    directTerms: unique([compact, ...rawTokens.map((item) => compactText(item)), ...expandedCompacts].filter(Boolean)),
    primaryTerms: primaryCompacts,
    relatedTerms: relatedCompacts,
    anchorTerms: unique([...rawAnchorTerms, ...fallbackAnchorTerms]).slice(0, 3),
    displayTerms: unique(displayTerms.length ? displayTerms : rawTokens).slice(0, 4),
    tags: sortTags(unique(tags)),
    minimumPrimaryHits: primaryCompacts.length >= 3 ? 2 : primaryCompacts.length ? 1 : 0,
  };
}

function matchesCompactField(field, term) {
  if (!field || !term) return false;
  if (field === term) return true;
  if (term.length === 1) return field.includes(term);
  return field.startsWith(term) || field.includes(term);
}

function matchesIndexTerm(index, term) {
  if (!term) return false;
  if ([index.korean, index.thai, index.thaiScript, index.note, ...index.keywords].some((field) => matchesCompactField(field, term))) {
    return true;
  }
  return index.tokens.some(
    (token) => token === term || token.includes(term) || (token.length >= 2 && term.length >= 3 && term.includes(token))
  );
}

function scoreEntry(entry, searchProfile, kind) {
  if (!searchProfile.query) return { matched: true, score: 0, directMatch: false, directHits: 0, primaryHits: 0, relatedHits: 0 };

  const index = buildSearchIndex(entry);
  const searchableFields = [index.korean, index.thai, index.thaiScript, index.note, ...index.keywords];
  const hasThaiScript = Boolean(getThaiScriptText(entry));
  const queryNegative = hasNegativeMeaning(searchProfile.query);
  const entryNegative = hasNegativeMeaning(entry.korean) || hasNegativeMeaning(entry.note);
  let score = 0;
  let directMatch = false;
  const directHits = new Set();
  const primaryHits = new Set();
  const relatedHits = new Set();
  const anchorHits = new Set();

  searchProfile.directTerms.forEach((term) => {
    let bestMatchLevel = 0;
    searchableFields.forEach((field) => {
      if (!field || !term) return;
      if (field === term) {
        bestMatchLevel = Math.max(bestMatchLevel, 4);
        return;
      }
      if (term.length === 1 && field.includes(term)) {
        bestMatchLevel = Math.max(bestMatchLevel, 1);
        return;
      }
      if (term.length >= 2 && field.startsWith(term)) {
        bestMatchLevel = Math.max(bestMatchLevel, 3);
        return;
      }
      if (term.length >= 2 && field.includes(term)) {
        bestMatchLevel = Math.max(bestMatchLevel, 2);
      }
    });

    if (!bestMatchLevel) return;
    directMatch = true;
    directHits.add(term);
    if (bestMatchLevel === 4) {
      score += term.length === 1 ? 120 : 430;
      return;
    }
    if (bestMatchLevel === 3) {
      score += term.length === 1 ? 95 : 320;
      return;
    }
    if (bestMatchLevel === 2) {
      score += term.length === 1 ? 70 : 240;
      return;
    }
    score += 110;
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

  if (state.scenario === "all" && searchProfile.tags.some((tag) => entry.tags.includes(tag))) {
    score += 60;
  }
  if (primaryHits.size >= searchProfile.minimumPrimaryHits && searchProfile.minimumPrimaryHits > 0) {
    score += 110;
  }
  if (kind === "sentence" && primaryHits.size) {
    score += 40;
  }
  if (hasThaiScript) {
    score += 35;
  } else {
    score -= 90;
  }
  if (searchProfile.anchorTerms.length && !anchorHits.size) {
    score -= kind === "vocab" ? 120 : 90;
  }
  if (!queryNegative && entryNegative) {
    score -= 180;
  } else if (queryNegative && !entryNegative) {
    score -= 70;
  }

  const hasPrimaryPlan = searchProfile.minimumPrimaryHits > 0;
  const vocabPrimaryThreshold = searchProfile.minimumPrimaryHits > 1 ? 1 : searchProfile.minimumPrimaryHits;
  const matched =
    directMatch ||
    (kind === "vocab" && anchorHits.size >= 1 && score >= 120) ||
    (kind === "sentence" && anchorHits.size >= 1 && score >= 180) ||
    (kind === "vocab" && hasPrimaryPlan && primaryHits.size >= vocabPrimaryThreshold && score >= 170) ||
    (kind === "vocab" && !hasPrimaryPlan && score >= 280) ||
    (kind === "sentence" &&
      hasPrimaryPlan &&
      (primaryHits.size >= searchProfile.minimumPrimaryHits || (primaryHits.size >= 1 && relatedHits.size >= 1)) &&
      score >= 220) ||
    (kind === "sentence" && !hasPrimaryPlan && score >= 340);

  return { matched, score, directMatch, directHits: directHits.size, primaryHits: primaryHits.size, relatedHits: relatedHits.size };
}

function getVocabResults(entries, searchProfile) {
  const ranked = entries
    .filter(matchesScenario)
    .map((entry) => {
      const index = buildSearchIndex(entry);
      return {
        entry,
        match: scoreEntry(entry, searchProfile, "vocab"),
        termHits: searchProfile.primaryTerms.filter((term) => matchesIndexTerm(index, term)),
        anchorHits: searchProfile.anchorTerms.filter((term) => matchesIndexTerm(index, term)),
      };
    })
    .filter(({ match }) => match.matched)
    .sort((left, right) => {
      if (right.anchorHits.length !== left.anchorHits.length) return right.anchorHits.length - left.anchorHits.length;
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
  const anchorFocused = searchProfile.anchorTerms.length ? ranked.filter((item) => item.anchorHits.length) : [];
  const preferredRanked = anchorFocused.length >= 3 ? anchorFocused : ranked;

  if (!searchProfile.query || searchProfile.primaryTerms.length < 2) {
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

  const direct = entries
    .filter(matchesScenario)
    .map((entry) => {
      const index = buildSearchIndex(entry);
      return {
        entry,
        match: scoreEntry(entry, searchProfile, "sentence"),
        anchorHits: searchProfile.anchorTerms.filter((term) => matchesIndexTerm(index, term)),
      };
    })
    .filter(({ match }) => match.matched)
    .sort((left, right) => {
      if (right.anchorHits.length !== left.anchorHits.length) return right.anchorHits.length - left.anchorHits.length;
      if (right.match.score !== left.match.score) return right.match.score - left.match.score;
      if (right.match.directHits !== left.match.directHits) return right.match.directHits - left.match.directHits;
      const leftThai = Boolean(getThaiScriptText(left.entry));
      const rightThai = Boolean(getThaiScriptText(right.entry));
      if (leftThai !== rightThai) return Number(rightThai) - Number(leftThai);
      return right.match.primaryHits - left.match.primaryHits;
    });

  const directIds = new Set(direct.map(({ entry }) => entry.id));
  const related = entries
    .filter(matchesScenario)
    .filter((entry) => !directIds.has(entry.id))
    .map((entry) => {
      const index = buildSearchIndex(entry);
      const sharedPrimary = searchProfile.primaryTerms.filter((term) => matchesIndexTerm(index, term)).length;
      const shared = seedTokens.filter((term) => matchesIndexTerm(index, term)).length;
      return {
        entry,
        score: sharedPrimary * 180 + shared * 55,
        sharedPrimary,
      };
    })
    .filter(({ score, sharedPrimary }) => sharedPrimary >= 1 || score >= (searchProfile.minimumPrimaryHits > 1 ? 220 : 150))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      const leftThai = Boolean(getThaiScriptText(left.entry));
      const rightThai = Boolean(getThaiScriptText(right.entry));
      if (leftThai !== rightThai) return Number(rightThai) - Number(leftThai);
      return right.sharedPrimary - left.sharedPrimary;
    });

  return uniqueById([
    ...direct.map(({ entry }) => entry),
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

function findExactEntry(entries, searchProfile) {
  if (!searchProfile.query) return null;
  return entries.find((entry) => {
    const index = buildSearchIndex(entry);
    return [index.korean, index.thai, index.thaiScript].some(
      (field) => field && field === searchProfile.compact
    );
  }) || null;
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
  return THAI_SCRIPT_REGEX.test(String(entry.thai || "")) ? String(entry.thai || "").trim() : "";
}

function hasNegativeMeaning(text) {
  return /(안|못|없|말고|잘못|틀리|아니)/.test(normalizeText(text));
}

function isTimeLikeQuery(query) {
  return Boolean(isTimeQuestionQuery(query) || extractStandaloneTimeQuery(query) || TIME_QUERY_REGEX.test(normalizeText(query)));
}

function isTimeFocusedEntry(entry) {
  const text = normalizeText(`${entry.korean || ""} ${(entry.keywords || []).join(" ")} ${entry.note || ""}`);
  return /(?:오전|오후)?\s*\d{1,2}\s*시(?:\s*\d{1,2}\s*분)?|\d{1,2}:\d{2}|몇\s*시|시간|시예요|시에|분/.test(text);
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

function createEntryCard(entry) {
  const card = document.createElement("article");
  card.className = "entry-card";

  const korean = document.createElement("p");
  korean.className = "entry-korean entry-korean-main";
  korean.textContent = entry.korean;

  const thai = document.createElement("p");
  thai.className = "entry-thai";
  thai.textContent = entry.thai;

  card.append(korean, thai);

  if (entry.note) {
    const note = document.createElement("p");
    note.className = "entry-note";
    note.textContent = entry.note;
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
    missingNote.textContent = "태국 문자 보강중";
    card.appendChild(missingNote);
  }

  if (hasFooterAction) {
    card.appendChild(footer);
  }

  return card;
}

function renderEntryStack(container, entries, emptyMessage) {
  container.innerHTML = "";
  if (!entries.length) {
    container.appendChild(createEmptyState(emptyMessage));
    return;
  }
  entries.forEach((entry) => {
    container.appendChild(createEntryCard(entry));
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

function render() {
  const merged = getMergedData();
  const mergedEntries = !state.query ? [] : [...merged.vocab, ...merged.sentences];
  const generated = buildGeneratedNumberEntries(state.query);
  const numberMode = generated.vocab.length > 0;
  const generatedTimeQuestion = !numberMode ? buildGeneratedTimeQuestionEntries(state.query) : { vocab: [], sentences: [] };
  const timeQuestionMode = !numberMode && generatedTimeQuestion.vocab.length > 0;
  const generatedTime = !numberMode && !timeQuestionMode ? buildGeneratedTimeEntries(state.query) : { vocab: [], sentences: [] };
  const timeMode = !numberMode && !timeQuestionMode && generatedTime.vocab.length > 0;
  const searchProfile = buildSearchProfile(
    state.query,
    numberMode || timeQuestionMode || timeMode ? [] : mergedEntries
  );
  const exactSentenceMatch = numberMode ? null : findExactEntry(merged.sentences, searchProfile);
  const actionPhraseMode = !numberMode && isActionPhraseQuery(searchProfile);
  const vocabSource = merged.vocab;
  const sentenceSource = merged.sentences;
  const allVocabResults = numberMode
    ? generated.vocab
    : timeQuestionMode
      ? generatedTimeQuestion.vocab
    : timeMode
      ? generatedTime.vocab
      : uniqueById([...generated.vocab, ...getVocabResults(vocabSource, searchProfile)]);
  const vocabSeeds = allVocabResults;
  const vocabResults = state.query
    ? allVocabResults.slice(0, RESULT_LIMITS.vocab)
    : [];
  const sentenceResults = state.query
    ? (numberMode
        ? generated.sentences
        : timeQuestionMode
          ? generatedTimeQuestion.sentences
        : timeMode
          ? generatedTime.sentences
        : uniqueById([
            ...(exactSentenceMatch ? [exactSentenceMatch] : []),
            ...generated.sentences,
            ...getSentenceResults(sentenceSource, searchProfile, vocabSeeds),
          ]).slice(0, RESULT_LIMITS.sentences))
    : [];
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
    ? "한국어로 검색하면 단어를 먼저, 바로 쓸 회화를 그 아래에 보여줍니다."
    : numberMode
      ? `숫자 변환: 읽기 ${vocabResults.length}개 · 활용 ${sentenceResults.length}개${expandedHint}`
      : timeQuestionMode
        ? `시간 질문: 단어 ${vocabResults.length}개 · 회화 ${sentenceResults.length}개${expandedHint}`
      : timeMode
        ? `시간 검색: 단어 ${vocabResults.length}개 · 회화 ${sentenceResults.length}개${expandedHint}`
      : `검색됨: 단어 ${vocabResults.length}개 · 회화 ${sentenceResults.length}개${expandedHint}`;

  elements.filterSummary.textContent =
    state.scenario === "all"
      ? "필터: 전체 검색"
      : `필터 적용 중: ${activeScenario ? activeScenario.label : state.scenario}만 보기`;

  elements.activeSummary.textContent = browsing
    ? ""
    : `검색어 "${state.query}"를 핵심 단어와 회화로 나눠서 찾고 있습니다.`;

  elements.vocabMeta.textContent = state.query
    ? numberMode
      ? "숫자는 태국어 읽기와 태국 숫자 표기를 함께 보여줍니다."
      : timeQuestionMode
        ? "현재 시간을 묻는 표현과 기기 기준 현재 시각을 먼저 보여줍니다."
      : timeMode
        ? "검색한 시간을 그대로 변형해서 읽기와 시간 표현을 먼저 보여줍니다."
      : exactSentenceMatch
        ? "핵심 단어를 먼저 보여주고, 아래에 정확히 맞는 회화를 맨 위에 올렸습니다."
      : actionPhraseMode
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
      : "위 단어를 바탕으로 바로 보여주기 좋은 회화만 추렸습니다."
    : "검색어를 넣으면 관련 회화가 나옵니다.";

  renderScenarioChips();
  renderQuickSearches();
  renderQueryInsights(searchProfile);
  renderStats(merged);
  renderEntryStack(
    elements.vocabResults,
    vocabResults,
    "맞는 단어가 아직 없습니다. 더 짧은 핵심어로 검색해 보세요."
  );
  renderEntryStack(
    elements.sentenceResults,
    sentenceResults,
    "맞는 회화가 아직 없습니다. 다른 표현으로 검색하거나 단어를 먼저 검색해 보세요."
  );
  renderCustomEntries();
  syncUrl();
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
    elements.resetFiltersButton,
    elements.menuButton,
    elements.menuCloseButton,
    elements.exportButton,
    elements.importButton,
    elements.clearCustomButton,
  ].forEach(wirePressFeedback);

  elements.jumpVocabButton.addEventListener("click", () => jumpToSection(elements.vocabSection));
  elements.jumpSentenceButton.addEventListener("click", () => jumpToSection(elements.sentenceSection));

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
  elements.exportButton.addEventListener("click", exportCustomData);
  elements.importButton.addEventListener("click", () => elements.importInput.click());
  elements.importInput.addEventListener("change", importCustomData);
  elements.clearCustomButton.addEventListener("click", clearCustomEntries);
}

function boot() {
  wireEvents();
  setSearchButtonBusy(false);
  const initial = readStateFromUrl();
  const scenarioIds = new Set(baseData.scenarios.map((item) => item.id));
  state.query = initial.query;
  state.scenario = scenarioIds.has(initial.scenario) ? initial.scenario : "all";
  render();
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
