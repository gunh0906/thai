export function createSearchGenerators({
  hydrateEntry,
  compactText,
  sortTags,
  unique,
  uniqueById,
  uniqueByMeaning,
  PREDICATE_QUERY_FAMILIES,
  isWhatQuestionQuery,
  getWhatQuestionSuffix,
  findDemonstrativeDefinition,
  findComposableObjectEntry,
  detectComposableActionId,
  extractComposableObjectCompacts,
  createGeneratedComposedSentence,
  createGeneratedDemonstrativeVocab,
  getEntryPrimaryKoreanText,
  getThaiScriptText,
  attachKoreanSubjectParticle,
  attachKoreanTopicParticle,
  isStartComposableObjectEntry,
  getThaiMeaningAnalysis,
  normalizeText,
}) {
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
        const normalized = normalizeText(trimmedQuery);
        const payStyle =
          /어디서.*(?:내요|내야|낼게|납부|지불)|(?:내요|내야|낼게|납부|지불).*어디서/.test(normalized) ||
          searchProfile.actionIds?.includes("pay");
        const koreanQuestion = payStyle
          ? `${attachKoreanTopicParticle(objectLabel)} 어디서 내요?`
          : /어디에\s*있|어딨어|어디있/.test(normalized)
            ? `${attachKoreanTopicParticle(objectLabel)} 어디에 있어요?`
            : `${attachKoreanSubjectParticle(objectLabel)} 어디예요?`;
        const thaiQuestion = payStyle ? `${objectThaiKo} 통 짜이 티 나이 캅` : `${objectThaiKo} 유 티 나이 캅`;
        const thaiScriptQuestion = payStyle
          ? `${objectThaiScript}ต้องจ่ายที่ไหนครับ`
          : `${objectThaiScript}อยู่ที่ไหนครับ`;
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

  function getMatchedPredicateFamilies(text) {
    const normalized = normalizeText(text);
    if (!normalized) return [];

    const suppressWrongPredicateFamily = /오배송|잘못\s*온\s*택배|잘못\s*배송|다른\s*사람\s*택배/.test(normalized);

    return PREDICATE_QUERY_FAMILIES.filter(
      (family) =>
        !(suppressWrongPredicateFamily && family.id === "wrong") &&
        (family.patterns || []).some((pattern) => pattern.test(normalized))
    );
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

  return {
    buildPredicateIntentHints,
    buildGeneratedPredicateEntries,
    buildGeneratedComposedEntries,
    buildGeneratedWhatQuestionEntries,
    buildGeneratedWhereQuestionEntries,
    buildThaiMeaningHints,
    buildGeneratedThaiMeaningEntries,
  };
}
