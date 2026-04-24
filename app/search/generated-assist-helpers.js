export function createGeneratedAssistHelpers({
  state,
  ACTION_COMPOSITION_TEMPLATES,
  ACTION_COMPOSITION_SUFFIXES,
  ACTION_COMPOSITION_PARTICLE_SUFFIXES,
  ACTION_COMPOSITION_FILLER_SUFFIXES,
  THAI_MEANING_STOPWORD_TEXTS,
  THAI_DEMONSTRATIVE_MEANINGS,
  THAI_MEANING_INTENT_RULES,
  unique,
  compactText,
  normalizeText,
  sortTags,
  hydrateEntry,
  buildSearchIndex,
  getThaiScriptText,
  matchesScenario,
  collectCandidateEntries,
  detectQueryDirection,
  getSearchCollectionCacheId,
  isSentenceLikeVocabEntry,
  isUtilityLabelVocabEntry,
  findDemonstrativeDefinition,
  getEntryPrimaryKoreanText,
  attachKoreanDirectionalParticle,
}) {
  const thaiMeaningAnalysisCache = new Map();

  function clearGeneratedAssistCaches() {
    thaiMeaningAnalysisCache.clear();
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

  function isLikelyActionMeaningEntry(entry) {
    const korean = getEntryPrimaryKoreanText(entry);
    return /(?:가져오다|가져다|보여|보다|바꾸다|변경|주세요|도와주|이해하다|이해)$/u.test(korean);
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
    const koreanText =
      actionId === "show" && /(?:태국어|한국어|영어)$/.test(objectLabel)
        ? `${attachKoreanDirectionalParticle(objectLabel)} 보여 주세요`
        : template.korean(objectLabel);

    return hydrateEntry(
      {
        id: `generated-compose-${actionId}-${compactText(query)}-${compactText(objectLabel)}`,
        kind: "sentence",
        source: "generated",
        sheet: "자동 조합",
        thai: template.thaiKo(objectThaiKo),
        thaiScript: template.thaiScript(objectThaiScript),
        korean: koreanText,
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

  return {
    clearGeneratedAssistCaches,
    detectComposableActionId,
    extractComposableObjectCompacts,
    findComposableObjectEntry,
    createGeneratedComposedSentence,
    createGeneratedDemonstrativeVocab,
    isStartComposableObjectEntry,
    getThaiMeaningAnalysis,
  };
}
