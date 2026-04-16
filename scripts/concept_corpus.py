from __future__ import annotations


def _keywords(*items: str) -> list[str]:
    values: list[str] = []
    for item in items:
        if not item:
            continue
        text = str(item).strip()
        if not text or text in values:
            continue
        values.append(text)
    return values


OBJECT_PACKS = [
    {
        "id": "salary",
        "thai": "응언 든",
        "thaiScript": "เงินเดือน",
        "korean": "월급 / 급여",
        "display": "월급",
        "tags": ["일터", "숫자·시간"],
        "note": "급여, 월급, 임금",
        "keywords": _keywords("월급", "급여", "임금", "월급날", "페이"),
        "auto": ["exists"],
        "sentences": [
            {
                "thai": "응언 든 양 마이 카오 캅",
                "thaiScript": "เงินเดือนยังไม่เข้าครับ",
                "korean": "월급이 아직 안 들어왔어요",
                "keywords": _keywords("월급안들어왔어요", "급여안들어왔어요", "입금안됐어요"),
            },
            {
                "thai": "완 니 미 오티 마이 캅",
                "thaiScript": "วันนี้มีโอทีไหมครับ",
                "korean": "오늘 초과근무 있어요?",
                "keywords": _keywords("오티", "야근", "연장근무"),
            },
            {
                "thai": "월급 완 나이 캅",
                "thaiScript": "วันเงินเดือนวันไหนครับ",
                "korean": "월급날이 언제예요?",
                "keywords": _keywords("월급날", "급여일"),
            },
        ],
    },
    {
        "id": "payslip",
        "thai": "슬립 응언 든",
        "thaiScript": "สลิปเงินเดือน",
        "korean": "급여명세서",
        "display": "급여명세서",
        "tags": ["일터", "숫자·시간"],
        "keywords": _keywords("급여명세서", "월급명세서", "페이슬립"),
        "auto": ["show", "exists"],
        "sentences": [
            {
                "thai": "츄어이 초이 슬립 응언 든 너이 캅",
                "thaiScript": "ช่วยเช็กสลิปเงินเดือนหน่อยครับ",
                "korean": "급여명세서 확인해 주세요",
                "keywords": _keywords("급여명세서확인", "명세서확인"),
            },
            {
                "thai": "커 두 슬립 응언 든 너이 캅",
                "thaiScript": "ขอดูสลิปเงินเดือนหน่อยครับ",
                "korean": "급여명세서 보여 주세요",
                "keywords": _keywords("명세서보여주세요"),
            },
        ],
    },
    {
        "id": "overtime",
        "thai": "오티",
        "thaiScript": "โอที",
        "korean": "초과근무 / 야근 / OT",
        "display": "초과근무",
        "tags": ["일터", "숫자·시간"],
        "keywords": _keywords("초과근무", "야근", "연장근무", "오티", "OT"),
        "auto": ["exists"],
        "sentences": [
            {
                "thai": "오티 니 루암 나이 슬립 마이 캅",
                "thaiScript": "โอทีนี้รวมในสลิปไหมครับ",
                "korean": "OT 수당 포함됐어요?",
                "keywords": _keywords("오티수당", "야근수당"),
            },
            {
                "thai": "완 니 통 탐 오티 마이 캅",
                "thaiScript": "วันนี้ต้องทำโอทีไหมครับ",
                "korean": "오늘 야근해야 해요?",
                "keywords": _keywords("야근해야해요", "초과근무해야해요"),
            },
        ],
    },
    {
        "id": "breaktime",
        "thai": "웨라 팍",
        "thaiScript": "เวลาพัก",
        "korean": "휴게시간",
        "display": "휴게시간",
        "tags": ["일터", "숫자·시간"],
        "keywords": _keywords("휴게시간", "쉬는시간", "브레이크타임"),
        "auto": ["exists"],
        "sentences": [
            {
                "thai": "웨라 팍 므어라이 캅",
                "thaiScript": "เวลาพักเมื่อไรครับ",
                "korean": "휴게시간이 언제예요?",
                "keywords": _keywords("쉬는시간언제", "브레이크언제"),
            },
            {
                "thai": "팍 다이 마이 캅",
                "thaiScript": "พักได้ไหมครับ",
                "korean": "잠깐 쉬어도 돼요?",
                "keywords": _keywords("잠깐쉬어도돼요", "쉬어도돼요"),
            },
        ],
    },
    {
        "id": "dayoff",
        "thai": "완 윳",
        "thaiScript": "วันหยุด",
        "korean": "쉬는 날 / 휴무",
        "display": "쉬는 날",
        "tags": ["일터", "숫자·시간"],
        "keywords": _keywords("쉬는날", "휴무", "휴일"),
        "auto": ["exists"],
        "sentences": [
            {
                "thai": "완 니 펜 완 윳 마이 캅",
                "thaiScript": "วันนี้เป็นวันหยุดไหมครับ",
                "korean": "오늘 쉬는 날이에요?",
                "keywords": _keywords("오늘휴무예요", "오늘쉬는날"),
            },
            {
                "thai": "완 윳 콩 폼 므어라이 캅",
                "thaiScript": "วันหยุดของผมเมื่อไรครับ",
                "korean": "제 휴무가 언제예요?",
                "keywords": _keywords("제휴무", "휴무언제"),
            },
        ],
    },
    {
        "id": "clockin",
        "thai": "웨라 카오 응안",
        "thaiScript": "เวลาเข้างาน",
        "korean": "출근시간",
        "display": "출근시간",
        "tags": ["일터", "숫자·시간"],
        "keywords": _keywords("출근시간", "몇시출근", "출근"),
        "auto": ["exists"],
        "sentences": [
            {
                "thai": "끼 몽 카오 응안 캅",
                "thaiScript": "กี่โมงเข้างานครับ",
                "korean": "몇 시 출근이에요?",
                "keywords": _keywords("몇시출근", "출근몇시"),
            }
        ],
    },
    {
        "id": "clockout",
        "thai": "웨라 억 응안",
        "thaiScript": "เวลาออกงาน",
        "korean": "퇴근시간",
        "display": "퇴근시간",
        "tags": ["일터", "숫자·시간"],
        "keywords": _keywords("퇴근시간", "몇시퇴근", "퇴근"),
        "auto": ["exists"],
        "sentences": [
            {
                "thai": "끼 몽 억 응안 캅",
                "thaiScript": "กี่โมงออกงานครับ",
                "korean": "몇 시 퇴근이에요?",
                "keywords": _keywords("몇시퇴근", "퇴근몇시"),
            }
        ],
    },
    {
        "id": "hr",
        "thai": "파이 북콘",
        "thaiScript": "ฝ่ายบุคคล",
        "korean": "인사팀",
        "display": "인사팀",
        "tags": ["일터"],
        "keywords": _keywords("인사팀", "인사부", "HR"),
        "auto": ["where"],
        "sentences": [
            {
                "thai": "아약 쿵 파이 북콘 캅",
                "thaiScript": "อยากคุยฝ่ายบุคคลครับ",
                "korean": "인사팀이랑 이야기하고 싶어요",
                "keywords": _keywords("인사팀상담", "인사팀이야기"),
            }
        ],
    },
    {
        "id": "supervisor",
        "thai": "후아 나",
        "thaiScript": "หัวหน้า",
        "korean": "관리자 / 반장",
        "display": "관리자",
        "tags": ["일터"],
        "keywords": _keywords("관리자", "반장", "반장님", "팀장", "상사"),
        "auto": ["where"],
        "sentences": [
            {
                "thai": "츄어이 리악 후아 나 너이 캅",
                "thaiScript": "ช่วยเรียกหัวหน้าหน่อยครับ",
                "korean": "관리자 좀 불러 주세요",
                "keywords": _keywords("관리자불러주세요", "반장불러주세요"),
            },
            {
                "thai": "폼 자 팝 후아 나 캅",
                "thaiScript": "ผมจะพบหัวหน้าครับ",
                "korean": "반장님을 만나야 해요",
                "keywords": _keywords("반장님만나야해요"),
            },
        ],
    },
    {
        "id": "idcard",
        "thai": "밧 파낙 응안",
        "thaiScript": "บัตรพนักงาน",
        "korean": "사원증 / 직원증",
        "display": "사원증",
        "tags": ["일터"],
        "keywords": _keywords("사원증", "직원증", "ID카드"),
        "auto": ["exists"],
        "sentences": [
            {
                "thai": "폼 탐 밧 파낙 응안 하이",
                "thaiScript": "ผมทำบัตรพนักงานหาย",
                "korean": "사원증을 잃어버렸어요",
                "keywords": _keywords("사원증잃어버렸어요", "직원증분실"),
            }
        ],
    },
    {
        "id": "accesscard",
        "thai": "밧 카오 억",
        "thaiScript": "บัตรเข้าออก",
        "korean": "출입카드",
        "display": "출입카드",
        "tags": ["일터"],
        "keywords": _keywords("출입카드", "출입증", "출입배지"),
        "auto": ["exists"],
        "sentences": [
            {
                "thai": "밧 카오 억 차이 마이 다이 캅",
                "thaiScript": "บัตรเข้าออกใช้ไม่ได้ครับ",
                "korean": "출입카드가 안 돼요",
                "keywords": _keywords("출입카드안돼요", "카드안먹어요"),
            }
        ],
    },
    {
        "id": "contract",
        "thai": "산야 창",
        "thaiScript": "สัญญาจ้าง",
        "korean": "계약서",
        "display": "계약서",
        "tags": ["일터"],
        "keywords": _keywords("계약서", "근로계약서", "계약"),
        "auto": ["show"],
        "sentences": [
            {
                "thai": "커 두 산야 창 익 크랑 너이 캅",
                "thaiScript": "ขอดูสัญญาจ้างอีกครั้งหน่อยครับ",
                "korean": "계약서 다시 보여 주세요",
                "keywords": _keywords("계약서다시보여주세요"),
            }
        ],
    },
    {
        "id": "dormitory",
        "thai": "허 팍",
        "thaiScript": "หอพัก",
        "korean": "기숙사",
        "display": "기숙사",
        "tags": ["일터", "이동"],
        "keywords": _keywords("기숙사", "숙소"),
        "auto": ["where"],
        "sentences": [
            {
                "thai": "허 팍 미 판하 캅",
                "thaiScript": "หอพักมีปัญหาครับ",
                "korean": "기숙사에 문제가 있어요",
                "keywords": _keywords("기숙사문제", "숙소문제"),
            }
        ],
    },
    {
        "id": "dormFee",
        "thai": "카 허 팍",
        "thaiScript": "ค่าหอพัก",
        "korean": "기숙사비",
        "display": "기숙사비",
        "tags": ["일터", "숫자·시간"],
        "keywords": _keywords("기숙사비", "숙소비"),
        "auto": ["exists"],
        "sentences": [
            {
                "thai": "카 허 팍 타오라이 캅",
                "thaiScript": "ค่าหอพักเท่าไรครับ",
                "korean": "기숙사비 얼마예요?",
                "keywords": _keywords("기숙사비얼마", "숙소비얼마"),
            }
        ],
    },
    {
        "id": "maintenance",
        "thai": "카 수언 끌랑",
        "thaiScript": "ค่าส่วนกลาง",
        "korean": "관리비",
        "display": "관리비",
        "tags": ["일터", "숫자·시간"],
        "keywords": _keywords("관리비", "공용비"),
        "auto": ["exists"],
        "sentences": [
            {
                "thai": "카 수언 끌랑 루암 유 두이 마이 캅",
                "thaiScript": "ค่าส่วนกลางรวมอยู่ด้วยไหมครับ",
                "korean": "관리비 포함이에요?",
                "keywords": _keywords("관리비포함", "포함이에요"),
            }
        ],
    },
    {
        "id": "electricity",
        "thai": "카 파이",
        "thaiScript": "ค่าไฟ",
        "korean": "전기세",
        "display": "전기세",
        "tags": ["일터", "숫자·시간"],
        "keywords": _keywords("전기세", "전기요금"),
        "auto": ["exists"],
        "sentences": [
            {
                "thai": "카 파이 자이나이 캅",
                "thaiScript": "ค่าไฟจ่ายไหนครับ",
                "korean": "전기세는 어디서 내요?",
                "keywords": _keywords("전기세어디서내요"),
            }
        ],
    },
    {
        "id": "waterBill",
        "thai": "카 남",
        "thaiScript": "ค่าน้ำ",
        "korean": "수도세",
        "display": "수도세",
        "tags": ["일터", "숫자·시간"],
        "keywords": _keywords("수도세", "수도요금"),
        "auto": ["exists"],
        "sentences": [
            {
                "thai": "카 남 짜이 두이 깐 마이 캅",
                "thaiScript": "ค่าน้ำจ่ายด้วยกันไหมครับ",
                "korean": "수도세도 같이 내요?",
                "keywords": _keywords("수도세같이내요"),
            }
        ],
    },
    {
        "id": "utilityBill",
        "thai": "카 사타라누 빠포크",
        "thaiScript": "ค่าสาธารณูปโภค",
        "korean": "공과금",
        "display": "공과금",
        "tags": ["일터", "숫자·시간"],
        "keywords": _keywords("공과금", "고지서", "공과금고지서"),
        "auto": ["show"],
        "sentences": [
            {
                "thai": "커 두 바이 공과금 너이 캅",
                "thaiScript": "ขอดูบิลค่าสาธารณูปโภคหน่อยครับ",
                "korean": "공과금 고지서 보여 주세요",
                "keywords": _keywords("공과금고지서보여주세요"),
            }
        ],
    },
    {
        "id": "laundryRoom",
        "thai": "홍 싹 파",
        "thaiScript": "ห้องซักผ้า",
        "korean": "세탁실",
        "display": "세탁실",
        "tags": ["이동", "일터"],
        "keywords": _keywords("세탁실", "빨래방"),
        "auto": ["where"],
        "sentences": [
            {
                "thai": "차이 홍 싹 파 다이 마이 캅",
                "thaiScript": "ใช้ห้องซักผ้าได้ไหมครับ",
                "korean": "세탁실 사용해도 돼요?",
                "keywords": _keywords("세탁실사용", "빨래방사용"),
            }
        ],
    },
    {
        "id": "dryer",
        "thai": "크루엉 옵 파",
        "thaiScript": "เครื่องอบผ้า",
        "korean": "건조기",
        "display": "건조기",
        "tags": ["이동", "일터"],
        "keywords": _keywords("건조기", "드라이어기"),
        "auto": ["exists", "where"],
        "sentences": [
            {
                "thai": "차이 크루엉 옵 파 다이 마이 캅",
                "thaiScript": "ใช้เครื่องอบผ้าได้ไหมครับ",
                "korean": "건조기 사용해도 돼요?",
                "keywords": _keywords("건조기사용"),
            }
        ],
    },
    {
        "id": "detergent",
        "thai": "퐁 싹 폭",
        "thaiScript": "ผงซักฟอก",
        "korean": "세제",
        "display": "세제",
        "tags": ["이동", "일터"],
        "keywords": _keywords("세제", "빨래세제"),
        "auto": ["exists", "request"],
        "sentences": [],
    },
    {
        "id": "commuterBus",
        "thai": "롯 랍 송",
        "thaiScript": "รถรับส่ง",
        "korean": "통근버스",
        "display": "통근버스",
        "tags": ["이동", "일터", "숫자·시간"],
        "keywords": _keywords("통근버스", "셔틀버스", "회사버스"),
        "auto": ["exists"],
        "sentences": [
            {
                "thai": "롯 랍 송 마 끼 몽 캅",
                "thaiScript": "รถรับส่งมากี่โมงครับ",
                "korean": "통근버스가 몇 시에 와요?",
                "keywords": _keywords("통근버스몇시", "셔틀버스몇시"),
            }
        ],
    },
    {
        "id": "busSchedule",
        "thai": "따랑 롯 밧",
        "thaiScript": "ตารางรถบัส",
        "korean": "버스 시간표",
        "display": "버스 시간표",
        "tags": ["이동", "일터", "숫자·시간"],
        "keywords": _keywords("버스시간표", "시간표"),
        "auto": ["show"],
        "sentences": [
            {
                "thai": "첫 차 끼 몽 캅",
                "thaiScript": "เที่ยวแรกกี่โมงครับ",
                "korean": "첫차가 몇 시예요?",
                "keywords": _keywords("첫차몇시"),
            },
            {
                "thai": "막 차 끼 몽 캅",
                "thaiScript": "เที่ยวสุดท้ายกี่โมงครับ",
                "korean": "막차가 몇 시예요?",
                "keywords": _keywords("막차몇시"),
            },
        ],
    },
    {
        "id": "platform",
        "thai": "찬 차라",
        "thaiScript": "ชานชาลา",
        "korean": "승강장 / 플랫폼",
        "display": "승강장",
        "tags": ["이동", "숫자·시간"],
        "keywords": _keywords("승강장", "플랫폼"),
        "auto": ["where"],
        "sentences": [
            {
                "thai": "찬 차라 버르 톰 라이라 캅",
                "thaiScript": "ชานชาลาเบอร์เท่าไรครับ",
                "korean": "몇 번 승강장이에요?",
                "keywords": _keywords("몇번승강장", "플랫폼몇번"),
            }
        ],
    },
    {
        "id": "tool",
        "thai": "크루엉 므",
        "thaiScript": "เครื่องมือ",
        "korean": "공구",
        "display": "공구",
        "tags": ["일터"],
        "keywords": _keywords("공구", "도구"),
        "auto": ["exists", "request", "show"],
        "sentences": [],
    },
    {
        "id": "endmill",
        "thai": "엔 밀",
        "thaiScript": "เอ็นมิล",
        "korean": "엔드밀",
        "display": "엔드밀",
        "tags": ["일터"],
        "keywords": _keywords("엔드밀", "앤드밀", "endmill"),
        "auto": ["exists", "request"],
        "sentences": [
            {
                "thai": "엔 밀 니 차이 마이 다이 캅",
                "thaiScript": "เอ็นมิลนี้ใช้ไม่ได้ครับ",
                "korean": "이 엔드밀은 못 써요",
                "keywords": _keywords("엔드밀못써요", "앤드밀불량"),
            }
        ],
    },
    {
        "id": "drill",
        "thai": "사완",
        "thaiScript": "สว่าน",
        "korean": "드릴",
        "display": "드릴",
        "tags": ["일터"],
        "keywords": _keywords("드릴", "드릴비트"),
        "auto": ["exists", "request"],
        "sentences": [
            {
                "thai": "미 사완 비트 마이 캅",
                "thaiScript": "มีสว่านบิตไหมครับ",
                "korean": "드릴 비트 있어요?",
                "keywords": _keywords("드릴비트있어요"),
            }
        ],
    },
    {
        "id": "material",
        "thai": "왓사두",
        "thaiScript": "วัสดุ",
        "korean": "자재",
        "display": "자재",
        "tags": ["일터"],
        "keywords": _keywords("자재", "부자재"),
        "auto": ["exists"],
        "sentences": [
            {
                "thai": "왓사두 마이 퍼 캅",
                "thaiScript": "วัสดุไม่พอครับ",
                "korean": "자재가 부족해요",
                "keywords": _keywords("자재부족", "부족해요"),
            }
        ],
    },
    {
        "id": "defect",
        "thai": "콩 씨아",
        "thaiScript": "ของเสีย",
        "korean": "불량품",
        "display": "불량품",
        "tags": ["일터"],
        "keywords": _keywords("불량품", "불량", "NG"),
        "auto": ["show"],
        "sentences": [
            {
                "thai": "안 니 펜 콩 씨아 캅",
                "thaiScript": "อันนี้เป็นของเสียครับ",
                "korean": "이거 불량품이에요",
                "keywords": _keywords("이거불량품", "불량이에요"),
            }
        ],
    },
    {
        "id": "workwear",
        "thai": "춧 탐 응안",
        "thaiScript": "ชุดทำงาน",
        "korean": "작업복",
        "display": "작업복",
        "tags": ["일터"],
        "keywords": _keywords("작업복", "근무복"),
        "auto": ["exists", "request"],
        "sentences": [
            {
                "thai": "폼 통 차이 춧 탐 응안 캅",
                "thaiScript": "ผมต้องใช้ชุดทำงานครับ",
                "korean": "작업복이 필요해요",
                "keywords": _keywords("작업복필요해요"),
            }
        ],
    },
    {
        "id": "safetyShoes",
        "thai": "롱 타오 니라파이",
        "thaiScript": "รองเท้านิรภัย",
        "korean": "안전화",
        "display": "안전화",
        "tags": ["일터"],
        "keywords": _keywords("안전화", "안전신발"),
        "auto": ["exists", "request"],
        "sentences": [
            {
                "thai": "통 싸이 롱 타오 니라파이 캅",
                "thaiScript": "ต้องใส่รองเท้านิรภัยครับ",
                "korean": "안전화를 신어야 해요",
                "keywords": _keywords("안전화신어야해요"),
            }
        ],
    },
    {
        "id": "machineNoise",
        "thai": "씨앙 크르엉",
        "thaiScript": "เสียงเครื่อง",
        "korean": "기계 소음",
        "display": "기계 소음",
        "tags": ["일터"],
        "keywords": _keywords("기계소음", "소음", "시끄럽다"),
        "auto": ["exists"],
        "sentences": [
            {
                "thai": "씨앙 크르엉 당 므어이 캅",
                "thaiScript": "เสียงเครื่องดังมากครับ",
                "korean": "기계 소음이 너무 커요",
                "keywords": _keywords("기계시끄러워요", "소음커요"),
            },
            {
                "thai": "크르엉 쁠랏 캅",
                "thaiScript": "เครื่องแปลกครับ",
                "korean": "기계가 이상해요",
                "keywords": _keywords("기계이상해요", "장비이상"),
            },
        ],
    },
    {
        "id": "computer",
        "thai": "컴피우떠",
        "thaiScript": "คอมพิวเตอร์",
        "korean": "컴퓨터",
        "display": "컴퓨터",
        "tags": ["일터", "기본회화"],
        "keywords": _keywords("컴퓨터", "PC", "피시"),
        "auto": ["exists"],
        "sentences": [
            {
                "thai": "컴피우떠 차이 마이 다이 캅",
                "thaiScript": "คอมพิวเตอร์ใช้ไม่ได้ครับ",
                "korean": "컴퓨터가 안 돼요",
                "keywords": _keywords("컴퓨터안돼요", "피시안돼요"),
            }
        ],
    },
    {
        "id": "mouse",
        "thai": "마오",
        "thaiScript": "เมาส์",
        "korean": "마우스",
        "display": "마우스",
        "tags": ["일터", "기본회화"],
        "keywords": _keywords("마우스"),
        "auto": ["exists"],
        "sentences": [
            {
                "thai": "마오 차이 마이 다이 캅",
                "thaiScript": "เมาส์ใช้ไม่ได้ครับ",
                "korean": "마우스가 안 돼요",
                "keywords": _keywords("마우스안돼요"),
            }
        ],
    },
    {
        "id": "keyboard",
        "thai": "키 보드",
        "thaiScript": "คีย์บอร์ด",
        "korean": "키보드",
        "display": "키보드",
        "tags": ["일터", "기본회화"],
        "keywords": _keywords("키보드"),
        "auto": ["exists"],
        "sentences": [
            {
                "thai": "키 보드 차이 마이 다이 캅",
                "thaiScript": "คีย์บอร์ดใช้ไม่ได้ครับ",
                "korean": "키보드가 안 돼요",
                "keywords": _keywords("키보드안돼요"),
            }
        ],
    },
    {
        "id": "coin",
        "thai": "리얀",
        "thaiScript": "เหรียญ",
        "korean": "동전 / 잔돈",
        "display": "동전",
        "tags": ["쇼핑", "기본회화"],
        "keywords": _keywords("동전", "잔돈", "거스름돈"),
        "auto": ["exists"],
        "sentences": [
            {
                "thai": "커 펜 응언 리얀 다이 마이 캅",
                "thaiScript": "ขอเป็นเงินเหรียญได้ไหมครับ",
                "korean": "동전으로 주세요",
                "keywords": _keywords("동전으로주세요", "잔돈으로주세요"),
            },
            {
                "thai": "미 응언 톤 마이 캅",
                "thaiScript": "มีเงินทอนไหมครับ",
                "korean": "잔돈 있어요?",
                "keywords": _keywords("잔돈있어요", "거스름돈있어요"),
            },
        ],
    },
    {
        "id": "smoking",
        "thai": "수프 부리",
        "thaiScript": "สูบบุหรี่",
        "korean": "담배 피우다",
        "display": "담배",
        "tags": ["기본회화", "이동"],
        "keywords": _keywords("담배", "흡연", "담배피우다"),
        "auto": [],
        "sentences": [
            {
                "thai": "티 니 수프 부리 다이 마이 캅",
                "thaiScript": "ที่นี่สูบบุหรี่ได้ไหมครับ",
                "korean": "여기서 담배 피워도 돼요?",
                "keywords": _keywords("담배피워도돼요", "흡연가능"),
            },
            {
                "thai": "홍 수프 부리 유 나이 캅",
                "thaiScript": "ห้องสูบบุหรี่อยู่ไหนครับ",
                "korean": "흡연실이 어디예요?",
                "keywords": _keywords("흡연실", "담배실"),
            },
        ],
    },
    {
        "id": "tired",
        "thai": "느어이",
        "thaiScript": "เหนื่อย",
        "korean": "피곤하다",
        "display": "피곤하다",
        "tags": ["기본회화", "건강", "일터"],
        "keywords": _keywords("피곤하다", "피곤해", "지치다"),
        "auto": [],
        "sentences": [
            {
                "thai": "느어이 막 캅",
                "thaiScript": "เหนื่อยมากครับ",
                "korean": "너무 피곤해요",
                "keywords": _keywords("너무피곤해요", "지쳤어요"),
            }
        ],
    },
    {
        "id": "hot",
        "thai": "론",
        "thaiScript": "ร้อน",
        "korean": "덥다",
        "display": "덥다",
        "tags": ["기본회화", "건강"],
        "keywords": _keywords("덥다", "더워", "더워요"),
        "auto": [],
        "sentences": [
            {
                "thai": "론 막 캅",
                "thaiScript": "ร้อนมากครับ",
                "korean": "너무 더워요",
                "keywords": _keywords("너무더워요", "더워죽겠어요"),
            }
        ],
    },
    {
        "id": "pretty",
        "thai": "수어이",
        "thaiScript": "สวย",
        "korean": "예쁘다",
        "display": "예쁘다",
        "tags": ["기본회화"],
        "keywords": _keywords("예쁘다", "이쁘다", "예뻐", "예뻐요"),
        "auto": [],
        "sentences": [
            {
                "thai": "수어이 막 캅",
                "thaiScript": "สวยมากครับ",
                "korean": "진짜 예뻐요",
                "keywords": _keywords("진짜예뻐요", "엄청예뻐요"),
            }
        ],
    },
    {
        "id": "goodjob",
        "thai": "껭",
        "thaiScript": "เก่ง",
        "korean": "잘하다",
        "display": "잘하다",
        "tags": ["기본회화", "일터"],
        "keywords": _keywords("잘하다", "잘해", "잘하고있어", "잘했어"),
        "auto": [],
        "sentences": [
            {
                "thai": "쿤 탐 다이 디 막",
                "thaiScript": "คุณทำได้ดีมาก",
                "korean": "잘하고 있어요",
                "keywords": _keywords("잘하고있어요", "잘하고있어"),
            },
            {
                "thai": "쿤 껭 막",
                "thaiScript": "คุณเก่งมาก",
                "korean": "정말 잘했어요",
                "keywords": _keywords("정말잘했어요", "잘했어요"),
            },
        ],
    },
    {
        "id": "trouble",
        "thai": "예래오",
        "thaiScript": "แย่แล้ว",
        "korean": "큰일 났다",
        "display": "큰일",
        "tags": ["기본회화", "일터"],
        "keywords": _keywords("큰일났다", "큰일", "심각하다"),
        "auto": [],
        "sentences": [
            {
                "thai": "예래오 캅",
                "thaiScript": "แย่แล้วครับ",
                "korean": "큰일 났어요",
                "keywords": _keywords("큰일났어요", "큰일이에요"),
            },
            {
                "thai": "판하 야이 캅",
                "thaiScript": "ปัญหาใหญ่ครับ",
                "korean": "문제가 커요",
                "keywords": _keywords("문제가커요", "심각해요"),
            },
        ],
    },
]


AUTO_BUILDERS = {
    "exists": lambda pack: {
        "thai": f"미 {pack['thai']} 마이 캅",
        "thaiScript": f"มี{pack['thaiScript']}ไหมครับ",
        "korean": f"{pack['display']} 있어요?",
        "keywords": _keywords(f"{pack['display']}있어요", f"{pack['display']}있나요"),
    },
    "request": lambda pack: {
        "thai": f"커 {pack['thai']} 너이 캅",
        "thaiScript": f"ขอ{pack['thaiScript']}หน่อยครับ",
        "korean": f"{pack['display']} 주세요",
        "keywords": _keywords(f"{pack['display']}주세요", f"{pack['display']}좀주세요"),
    },
    "show": lambda pack: {
        "thai": f"커 두 {pack['thai']} 너이 캅",
        "thaiScript": f"ขอดู{pack['thaiScript']}หน่อยครับ",
        "korean": f"{pack['display']} 보여 주세요",
        "keywords": _keywords(f"{pack['display']}보여주세요"),
    },
    "where": lambda pack: {
        "thai": f"{pack['thai']} 유 나이 캅",
        "thaiScript": f"{pack['thaiScript']}อยู่ไหนครับ",
        "korean": f"{pack['display']} 어디예요?",
        "keywords": _keywords(f"{pack['display']}어디예요", f"{pack['display']}어디에요"),
    },
}


def build_concept_corpus_entries() -> tuple[list[dict], list[dict]]:
    vocab: list[dict] = []
    sentences: list[dict] = []

    for pack in OBJECT_PACKS:
        vocab.append(
            {
                "thai": pack["thai"],
                "thaiScript": pack["thaiScript"],
                "korean": pack["korean"],
                "tags": list(pack["tags"]),
                "note": pack.get("note", ""),
                "keywords": _keywords(*pack.get("keywords", []), pack["display"]),
            }
        )

        for auto_id in pack.get("auto", []):
            builder = AUTO_BUILDERS.get(auto_id)
            if not builder:
                continue
            built = builder(pack)
            sentences.append(
                {
                    "thai": built["thai"],
                    "thaiScript": built["thaiScript"],
                    "korean": built["korean"],
                    "tags": list(pack["tags"]),
                    "keywords": _keywords(*pack.get("keywords", []), *built.get("keywords", [])),
                }
            )

        for item in pack.get("sentences", []):
            sentences.append(
                {
                    "thai": item["thai"],
                    "thaiScript": item["thaiScript"],
                    "korean": item["korean"],
                    "tags": list(item.get("tags", pack["tags"])),
                    "keywords": _keywords(*pack.get("keywords", []), *item.get("keywords", [])),
                }
            )

    return vocab, sentences
