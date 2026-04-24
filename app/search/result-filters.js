export function createSearchResultFilters({
  compactText,
  unique,
  uniqueById,
  uniqueByMeaning,
  getThaiScriptText,
}) {
  function uniqueByCompactKorean(entries) {
    const seen = new Set();
    return entries.filter((entry) => {
      const key = compactText(entry.korean);
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function getEntryCoreSearchTexts(entry) {
    return unique([entry.korean, entry.note, getThaiScriptText(entry)].map((item) => compactText(item)).filter(Boolean));
  }

  function matchesEntryCoreSearchTexts(entry, pattern) {
    return getEntryCoreSearchTexts(entry).some((text) => pattern.test(text));
  }

  function matchesEntryKoreanText(entry, pattern) {
    const korean = compactText(entry.korean);
    return Boolean(korean && pattern.test(korean));
  }

  function filterEntriesIfEnough(entries, predicate, minimum = 1) {
    const filtered = entries.filter(predicate);
    return filtered.length >= minimum ? filtered : entries;
  }

  function prioritizeEntriesIfEnough(entries, predicate, minimum = 1) {
    const prioritized = entries.filter(predicate);
    if (prioritized.length < minimum) return entries;
    return [...prioritized, ...entries.filter((entry) => !predicate(entry))];
  }

  function hasDisplayThaiScript(entry) {
    return Boolean(getThaiScriptText(entry));
  }

  function isWaterRequestSearch(searchProfile) {
    return /(?:^|\s)물\s*(?:주세요|주세여|줘요|줘|있어요|있나요)?$|생수|차가운\s*물|따뜻한\s*물|찬물|냉수/.test(
      searchProfile.normalized
    );
  }

  function isUnknownSearch(searchProfile) {
    return /모르|몰라/.test(searchProfile.normalized);
  }

  function isGenericPriceSearch(searchProfile) {
    return (
      /얼마|가격|요금|비용/.test(searchProfile.normalized) &&
      !/깎|깍|할인|비싸|싸게|흥정/.test(searchProfile.normalized)
    );
  }

  function isDormitoryBillingSearch(searchProfile) {
    return (
      /기숙사비|공과금|전기세|전기요금|수도세|수도요금|관리비|가스비|가스요금|인터넷비|와이파이요금/.test(
        searchProfile.normalized
      ) && !/문제|고장|이상|불편/.test(searchProfile.normalized)
    );
  }

  function isDormitoryLifeSearch(searchProfile) {
    return /기숙사|숙소|기숙사비|공과금|전기세|수도세|관리비|세탁기|건조기|카드키|에어컨|온수|뜨거운물|빨래|세제/.test(
      searchProfile.normalized
    );
  }

  function isPayrollSearch(searchProfile) {
    return /급여|월급|급여명세서|임금|상여금|공제|세금|보험|휴가|병가|계약서|서명|여권|사원증|외국인등록증/.test(
      searchProfile.normalized
    );
  }

  function isWorkHoursSearch(searchProfile) {
    return /야근|초과근무|연장근무|교대근무|주간근무|야간근무|출근|퇴근|근무시간|작업지시|품질|검사|불량|자재|부품|창고|지게차/.test(
      searchProfile.normalized
    );
  }

  function isGenericDirectionQuestionSearch(searchProfile) {
    const normalized = String(searchProfile?.normalized || "");
    if (!normalized) return false;
    if (searchProfile?.objectTerms?.length) return false;
    if (/(버스|택시|지하철|기차|공장|회사|기숙사|숙소|호텔|식당|화장실|병원|약국|시장|역|정류장|매표소|공항)/.test(normalized)) {
      return false;
    }
    return /(?:어떻게\s*(?:가|오|와)|(?:가는|오는)\s*방법|어떻게\s*(?:가야|와야|오면|가면))/.test(normalized);
  }

  function getGenericDirectionMode(searchProfile) {
    const normalized = String(searchProfile?.normalized || "");
    if (/(?:어떻게\s*(?:오|와)|오는\s*방법|어떻게\s*(?:와야|오면))/.test(normalized)) {
      return "come";
    }
    if (/(?:어떻게\s*가|가는\s*방법|어떻게\s*(?:가야|가면))/.test(normalized)) {
      return "go";
    }
    return "";
  }

  function isLanguageDisplaySearch(searchProfile) {
    return /(?:태국어|한국어|영어).*(?:보여|써|적어|번역)|(?:보여|써|적어|번역).*(?:태국어|한국어|영어)/.test(
      searchProfile.normalized
    );
  }

  function isGenericNoiseSearch(searchProfile) {
    return /시끄럽|소음/.test(searchProfile.normalized) && !/(기계|장비|설비|라인|공장|방|객실|룸)/.test(searchProfile.normalized);
  }

  function isHealthStateSearch(searchProfile) {
    return /건강하|건강해|건강한상태|튼튼하|멀쩡하/.test(searchProfile.normalized);
  }

  function isEntryUnknownRelated(entry) {
    return matchesEntryKoreanText(entry, /모르|몰라|모르겠|이해못|이해안/);
  }

  function isEntryWaterRequestRelated(entry) {
    if (matchesEntryKoreanText(entry, /누수|물샘|물많이마시|온수|물티슈|물수건|식물|화분|나무|꽃/)) {
      return false;
    }
    return matchesEntryKoreanText(entry, /물|생수|차가운물|따뜻한물|찬물|냉수/);
  }

  function isEntryPriceRelated(entry) {
    return matchesEntryKoreanText(entry, /얼마|가격|요금|비용|계산|영수증|바트|원|결제/);
  }

  function isEntryDormitoryBillingRelated(entry) {
    if (matchesEntryKoreanText(entry, /문제|고장|이상|불편/)) {
      return false;
    }
    return matchesEntryKoreanText(entry, /기숙사비|공과금|전기세|전기요금|수도세|수도요금|관리비|가스비|가스요금|인터넷비|와이파이요금|납부|내요/);
  }

  function isEntryLanguageDisplayRelated(entry, kind) {
    if (
      matchesEntryKoreanText(entry, /(?:태국어|한국어|영어).*(?:보여|써|적어|번역)|(?:보여|써|적어|번역).*(?:태국어|한국어|영어)/)
    ) {
      return true;
    }
    return kind === "vocab" && matchesEntryKoreanText(entry, /태국어|한국어|영어|번역|해석/);
  }

  function isEntryGenericNoiseRelated(entry) {
    return (
      matchesEntryKoreanText(entry, /시끄럽|시끄러워|소음/) &&
      !matchesEntryKoreanText(entry, /기계|장비|설비|라인|공장|방|객실|룸/)
    );
  }

  function isEntryHealthStateRelated(entry) {
    return matchesEntryCoreSearchTexts(entry, /건강|튼튼|아프지않|몸상태가좋|แข็งแรง|สุขภาพดี|สบายดี/);
  }

  function isEntryPayrollRelated(entry) {
    return matchesEntryKoreanText(entry, /급여|월급|급여명세서|임금|상여금|공제|세금|보험|휴가|병가|계약서|서명|여권|사원증|외국인등록증/);
  }

  function isEntryWorkHoursRelated(entry, searchProfile) {
    if (!/휴무|휴가|병가/.test(searchProfile.normalized) && matchesEntryKoreanText(entry, /휴무|휴가|병가/)) {
      return false;
    }
    return matchesEntryKoreanText(entry, /야근|초과근무|연장근무|근무시간|출근|퇴근|교대근무|주간근무|야간근무|작업지시|작업 지시|품질|검사|불량|자재|부품|창고|지게차/);
  }

  function isEntryGenericDirectionRelated(entry, searchProfile = null) {
    if (
      matchesEntryKoreanText(entry, /버스|택시|지하철|기차|공장|회사|기숙사|숙소|호텔|식당|화장실|병원|약국|시장|역|정류장|매표소|공항/)
    ) {
      return false;
    }
    const baseMatch = matchesEntryCoreSearchTexts(
      entry,
      /어떻게가요|어떻게가야해요|어떻게가면돼요|가는방법|어떻게와요|어떻게와야해요|어떻게오면돼요|오는방법|ไปยังไง|ต้องไปยังไง|มายังไง|ต้องมายังไง/
    );
    if (!baseMatch) return false;

    const directionMode = getGenericDirectionMode(searchProfile);
    if (!directionMode) return true;
    if (directionMode === "go") {
      return !matchesEntryCoreSearchTexts(entry, /어떻게와요|어떻게와야해요|어떻게오면돼요|오는방법|มายังไง|ต้องมายังไง/);
    }
    if (directionMode === "come") {
      return !matchesEntryCoreSearchTexts(entry, /어떻게가요|어떻게가야해요|어떻게가면돼요|가는방법|ไปยังไง|ต้องไปยังไง/);
    }
    return true;
  }

  function prependExactSentenceMatches(entries, searchProfile) {
    const target = compactText(searchProfile?.query || "");
    if (!target) return entries;
    const exactEntries = entries.filter(
      (entry) => entry?.source !== "generated-bulk" && compactText(entry?.korean || "") === target
    );
    if (!exactEntries.length) return entries;
    const exactIds = new Set(exactEntries.map((entry) => entry.id));
    return [...exactEntries, ...entries.filter((entry) => !exactIds.has(entry.id))];
  }

  function finalizeSearchEntries(entries, searchProfile, kind, limit) {
    let result = uniqueByMeaning(uniqueById(entries));

    if (kind === "sentence" || isLanguageDisplaySearch(searchProfile)) {
      result = uniqueByCompactKorean(result);
    }
    if (isWaterRequestSearch(searchProfile)) {
      result = filterEntriesIfEnough(result, isEntryWaterRequestRelated, 1);
    }
    if (isUnknownSearch(searchProfile)) {
      result = filterEntriesIfEnough(result, isEntryUnknownRelated, 1);
    }
    if (isGenericPriceSearch(searchProfile)) {
      result = filterEntriesIfEnough(result, isEntryPriceRelated, kind === "vocab" ? 2 : 1);
    }
    if (isDormitoryBillingSearch(searchProfile)) {
      result = filterEntriesIfEnough(result, isEntryDormitoryBillingRelated, 1);
    }
    if (isLanguageDisplaySearch(searchProfile)) {
      result =
        kind === "sentence"
          ? filterEntriesIfEnough(result, (entry) => isEntryLanguageDisplayRelated(entry, kind), 1)
          : prioritizeEntriesIfEnough(result, (entry) => isEntryLanguageDisplayRelated(entry, kind), 1);
    }
    if (isGenericNoiseSearch(searchProfile)) {
      result =
        kind === "sentence"
          ? filterEntriesIfEnough(result, isEntryGenericNoiseRelated, 2)
          : prioritizeEntriesIfEnough(result, isEntryGenericNoiseRelated, 1);
    }
    if (isHealthStateSearch(searchProfile)) {
      result =
        kind === "sentence"
          ? filterEntriesIfEnough(result, isEntryHealthStateRelated, 1)
          : filterEntriesIfEnough(result, isEntryHealthStateRelated, 1);
    }
    if (isPayrollSearch(searchProfile)) {
      result =
        kind === "sentence"
          ? filterEntriesIfEnough(result, isEntryPayrollRelated, 1)
          : prioritizeEntriesIfEnough(result, isEntryPayrollRelated, 1);
    }
    if (isWorkHoursSearch(searchProfile)) {
      result =
        kind === "sentence"
          ? filterEntriesIfEnough(result, (entry) => isEntryWorkHoursRelated(entry, searchProfile), 1)
          : prioritizeEntriesIfEnough(result, (entry) => isEntryWorkHoursRelated(entry, searchProfile), 1);
    }
    if (isGenericDirectionQuestionSearch(searchProfile)) {
      result =
        kind === "sentence"
          ? filterEntriesIfEnough(result, (entry) => isEntryGenericDirectionRelated(entry, searchProfile), 1)
          : prioritizeEntriesIfEnough(result, (entry) => isEntryGenericDirectionRelated(entry, searchProfile), 1);
    }
    result = prioritizeEntriesIfEnough(result, hasDisplayThaiScript, 1);
    if (kind === "sentence") {
      result = prependExactSentenceMatches(result, searchProfile);
    }

    return result.slice(0, limit);
  }

  return {
    finalizeSearchEntries,
    isDormitoryLifeSearch,
    isPayrollSearch,
    isWorkHoursSearch,
    isGenericDirectionQuestionSearch,
  };
}
