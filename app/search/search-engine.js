export function createSearchEngine({
  RESULT_LIMITS,
  state,
  unique,
  compactText,
  normalizeText,
  tokenize,
  buildSearchIndex,
  getThaiScriptText,
  hasNegativeMeaning,
  matchesExactCoreField,
  matchesCoreField,
  getStructuredFieldMatchStrength,
  matchesIndexTerm,
  matchesTemplateTerm,
  getEntrySourceScore,
  isSentenceLikeVocabEntry,
  isUtilityLabelVocabEntry,
  isGeneratedBulkTemplateEntry,
  collectCandidateEntries,
  isThaiOnlySearch,
  matchesScenario,
  matchesThaiField,
  prioritizeRankedItems,
  finalizeSearchEntries,
  isSimpleCompactLookup,
  uniqueById,
}) {
  const PARCEL_SERVICE_OBJECT_IDS = new Set([
    "parcelLocker",
    "pickupDesk",
    "pickupCode",
    "parcelPickup",
    "parcelTracking",
    "deliveryComplete",
    "deliveryDelay",
    "misdelivery",
    "damagedDelivery",
    "lostDelivery",
    "doorstepDelivery",
    "securityDeskStorage",
    "redeliveryService",
    "deliveryLocationChange",
    "exchangeService",
    "returnService",
    "refundService",
    "cancellationService",
  ]);
  const WORKSITE_PRECISION_OBJECT_IDS = new Set([
    "productionPlanWork",
    "workStandardDocument",
    "dailyWorkReport",
    "lotNumberWork",
    "quantityWork",
    "inventoryWork",
    "reworkProcess",
    "scrapProcess",
    "defectCauseWork",
    "correctiveActionWork",
    "equipmentInspection",
    "lubricantSupply",
    "coolantSupply",
    "pressureStatus",
    "temperatureStatus",
    "measuringTool",
    "vernierCaliperTool",
    "torqueWrenchTool",
    "approvalPendingWork",
    "meetingMinutesWork",
  ]);

  function hasParcelServiceIntent(searchProfile) {
    return Boolean(searchProfile?.objectIds?.some((id) => PARCEL_SERVICE_OBJECT_IDS.has(id)));
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
    if (searchProfile.objectIds?.some((id) => WORKSITE_PRECISION_OBJECT_IDS.has(id)) && !objectHits.size) {
      score -= kind === "sentence" ? 240 : 360;
    }
    if (searchProfile.objectIds?.some((id) => ["reportWork", "reportDocumentWork"].includes(id))) {
      if (/홀더|드릴|비트|엔드밀|커터|공구/.test(index.korean)) {
        score -= kind === "sentence" ? 260 : 320;
      }
    }
    if (/모르|몰라/.test(searchProfile.normalized)) {
      const unknownRelated =
        /모르|몰라|이해/.test(index.korean) ||
        /모르|몰라|이해/.test(index.note) ||
        index.keywords.some((keyword) => /모르|몰라|이해/.test(keyword));
      if (!unknownRelated) {
        score -= kind === "sentence" ? 320 : 260;
      }
    }
    if (/(?:담배\s*피우|담배피우|피워도|피워)/.test(searchProfile.normalized)) {
      if (/흡연실이\s*어디(?:예요|에요)?/.test(index.korean)) {
        score -= kind === "sentence" ? 240 : 200;
      }
      if (/담배\s*피워도\s*돼요|여기서\s*담배\s*피워도\s*돼요/.test(index.korean)) {
        score += kind === "sentence" ? 260 : 160;
      }
    }
    if (
      /(?:^|\s)물\s*(?:주세요|주세여|줘요|줘|있어요|있나요)?$|생수|차가운\s*물|따뜻한\s*물|찬물|냉수/.test(searchProfile.normalized) &&
      /누수|물\s*샘|물샘/.test(index.korean)
    ) {
      score -= kind === "sentence" ? 260 : 220;
    }
    if (
      /(?:^|\s)물\s*(?:주세요|주세여|줘요|줘|있어요|있나요)?$|생수|차가운\s*물|따뜻한\s*물|찬물|냉수/.test(searchProfile.normalized) &&
      /물\s*많이\s*마시|온수/.test(index.korean)
    ) {
      score -= kind === "sentence" ? 180 : 140;
    }
    if (/(?:태국어|한국어|영어).*(?:보여|써|적어|번역)|(?:보여|써|적어|번역).*(?:태국어|한국어|영어)/.test(searchProfile.normalized)) {
      if (/태국어로\s*보여\s*주세요|한국어로\s*보여\s*주세요|태국어로\s*써\s*주세요/.test(index.korean)) {
        score += kind === "sentence" ? 280 : 180;
      }
      if (/서류\s*보여|여기\s*보여|지도\s*보여/.test(index.korean)) {
        score -= kind === "sentence" ? 220 : 160;
      }
      if (/공부|배워/.test(index.korean)) {
        score -= kind === "sentence" ? 220 : 160;
      }
    }
    if (
      /얼마|가격|요금|비용/.test(searchProfile.normalized) &&
      !/깎|깍|할인|비싸|싸게|흥정/.test(searchProfile.normalized) &&
      /깎|할인|비싸/.test(index.korean) &&
      !/얼마|가격|요금|비용/.test(index.korean)
    ) {
      score -= kind === "sentence" ? 220 : 180;
    }
    if (/얼마|가격|요금|비용/.test(searchProfile.normalized) && !/깎|깍|할인|비싸|싸게|흥정/.test(searchProfile.normalized)) {
      const priceRelated =
        /얼마|가격|요금|비용/.test(index.korean) ||
        index.keywords.some((keyword) => /얼마|가격|요금|비용/.test(keyword));
      if (!priceRelated) {
        score -= kind === "sentence" ? 260 : 210;
      }
    }
    if (
      /기숙사비|공과금|전기세|전기요금|수도세|수도요금|관리비/.test(searchProfile.normalized) &&
      !/문제|고장|이상|불편/.test(searchProfile.normalized) &&
      /문제/.test(index.korean)
    ) {
      score -= kind === "sentence" ? 240 : 180;
    }
    if (/시끄럽|소음/.test(searchProfile.normalized) && !/(기계|장비|설비|라인|공장|방|객실|룸)/.test(searchProfile.normalized)) {
      if (/기계|장비|설비/.test(index.korean)) {
        score -= kind === "sentence" ? 180 : 140;
      }
      if (/방/.test(index.korean)) {
        score -= kind === "sentence" ? 80 : 60;
      }
    }
    if (/모르|몰라/.test(searchProfile.normalized)) {
      if (/모르|몰라/.test(index.korean) || /모르|몰라/.test(index.note)) {
        score += kind === "sentence" ? 240 : 180;
      }
      if (/이해합니다|이해해요|이해했어요/.test(entry.korean)) {
        score -= kind === "sentence" ? 260 : 180;
      }
    }
    if (kind === "vocab" && searchProfile.compact) {
      const exactObjectHit = searchProfile.objectTerms.some((term) => index.korean === term || index.tokens.includes(term));
      const exactObjectTextHit = searchProfile.objectTerms.some((term) => index.korean === term);
      const exactActionHit = searchProfile.actionTerms.some((term) => index.korean === term || index.tokens.includes(term));
      const exactActionTextHit = searchProfile.actionTerms.some((term) => index.korean === term);
      const hasSpecificObjectIntent = Boolean(searchProfile.objectIds?.length || searchProfile.objectTerms.some((term) => term.length >= 2));
      if (exactObjectHit) {
        score += 160;
      }
      if (exactObjectTextHit) {
        score += 140;
      }
      if (exactActionHit) {
        score += 110;
      }
      if (exactActionTextHit) {
        score += 80;
      }
      const lengthDelta = Math.max(0, index.korean.length - searchProfile.compact.length);
      score -= Math.min(lengthDelta * 18, 220);
      if (isSentenceLikeVocabEntry(entry)) {
        score -= 240;
        if (hasSpecificObjectIntent && !exactObjectHit && !exactObjectTextHit && !anchorHits.size) {
          score -= 260;
        }
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
    const sourceFiltered = genericWhereOnlyQuery
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
    const parcelServiceFocused =
      hasParcelServiceIntent(searchProfile) && curatedFocused.length
        ? sourceFiltered.filter(
            (item) =>
              item.entry.source !== "generated" ||
              item.objectHits.length ||
              item.templateHits.length
          )
        : sourceFiltered;
    const rankingPool = parcelServiceFocused.length ? parcelServiceFocused : sourceFiltered;
    const intentFocused =
      searchProfile.objectTerms.length || searchProfile.templateTerms.length
        ? rankingPool.filter((item) => item.objectHits.length || item.templateHits.length)
        : [];
    const anchorFocused = searchProfile.anchorTerms.length ? rankingPool.filter((item) => item.anchorHits.length) : [];
    const thaiFocused = thaiOnlySearch ? rankingPool.filter((item) => item.thaiCoreHits.length) : [];
    const whereIntent = searchProfile.actionIds?.includes("where");
    const tightIntentVocab =
      searchProfile.objectTerms.length && (searchProfile.actionTerms.length || searchProfile.templateTerms.length)
        ? rankingPool.filter(
            (item) =>
              !isSentenceLikeVocabEntry(item.entry) &&
              !isUtilityLabelVocabEntry(item.entry) &&
              (item.exactCoreHit || item.templateHits.length || (item.objectHits.length && (item.actionHits.length || whereIntent)))
          )
        : [];
    const preferredRanked = thaiFocused.length
      ? thaiFocused
      : tightIntentVocab.length
        ? whereIntent
          ? tightIntentVocab
          : prioritizeRankedItems(tightIntentVocab, intentFocused, rankingPool)
        : intentFocused.length
          ? intentFocused
          : anchorFocused.length >= 2
            ? anchorFocused
            : rankingPool;

    if (
      !searchProfile.query ||
      searchProfile.primaryTerms.length < 2 ||
      searchProfile.objectTerms.length ||
      searchProfile.templateTerms.length
    ) {
      return finalizeSearchEntries(
        preferredRanked.map(({ entry }) => entry),
        searchProfile,
        "vocab",
        RESULT_LIMITS.vocab + 6
      );
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

    return finalizeSearchEntries(diversified, searchProfile, "vocab", RESULT_LIMITS.vocab + 6);
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
              (item.objectHits.length || item.templateHits.length || item.exactCoreHit) &&
              (item.templateHits.length ||
                item.actionHits.length ||
                (searchProfile.actionIds?.includes("where") && /어디(?:예요|에요)?/.test(normalizeText(item.entry.korean))))
          )
        : [];
    const whereFocusedDirect = searchProfile.actionIds?.includes("where") && tightIntentDirect.length ? tightIntentDirect : [];
    const prioritizedDirect = thaiFocusedDirect.length
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
      return finalizeSearchEntries(
        curatedDirect.map(({ entry }) => entry),
        searchProfile,
        "sentence",
        RESULT_LIMITS.sentences + 2
      );
    }

    if (nounLikeLookup && !curatedDirect.length && !curatedCompactDirect.length && !exactVariantDirect.length) {
      return [];
    }

    if (nounLikeLookup && curatedCompactDirect.length) {
      return finalizeSearchEntries(
        uniqueById([
          ...exactVariantDirect.map(({ entry }) => entry),
          ...curatedCompactDirect.map(({ entry }) => entry),
          ...prioritizedDirect.map(({ entry }) => entry),
        ]),
        searchProfile,
        "sentence",
        RESULT_LIMITS.sentences + 3
      );
    }

    if (nounLikeLookup && curatedDirect.length) {
      return finalizeSearchEntries(
        uniqueById([
          ...exactVariantDirect.map(({ entry }) => entry),
          ...curatedDirect.map(({ entry }) => entry),
          ...curatedCompactDirect.map(({ entry }) => entry),
        ]),
        searchProfile,
        "sentence",
        RESULT_LIMITS.sentences + 3
      );
    }

    if (whereFocusedDirect.length) {
      return finalizeSearchEntries(
        whereFocusedDirect.map(({ entry }) => entry),
        searchProfile,
        "sentence",
        RESULT_LIMITS.sentences
      );
    }

    if (prioritizedDirect.length >= 3) {
      return finalizeSearchEntries(
        prioritizedDirect.map(({ entry }) => entry),
        searchProfile,
        "sentence",
        RESULT_LIMITS.sentences + 4
      );
    }

    if (
      prioritizedDirect.length >= 2 &&
      (searchProfile.objectTerms.length || searchProfile.templateTerms.length || searchProfile.actionTerms.length)
    ) {
      return finalizeSearchEntries(
        prioritizedDirect.map(({ entry }) => entry),
        searchProfile,
        "sentence",
        RESULT_LIMITS.sentences + 2
      );
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

    return finalizeSearchEntries(
      uniqueById([
        ...prioritizedDirect.map(({ entry }) => entry),
        ...related.map(({ entry }) => entry),
      ]),
      searchProfile,
      "sentence",
      RESULT_LIMITS.sentences + 4
    );
  }

  return {
    scoreEntry,
    getVocabResults,
    getSentenceResults,
  };
}
