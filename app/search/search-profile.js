export function createSearchProfileBuilder({
  QUERY_BUNDLES,
  QUERY_PARTS,
  QUERY_ALIASES,
  QUERY_ENDINGS,
  STOPWORDS,
  unique,
  compactText,
  normalizeText,
  tokenize,
  sortTags,
  buildIntentHints,
  detectQueryDirection,
  extractCompactPhraseRoots,
  expandQueryVariants,
  buildPredicateIntentHints,
  buildThaiMeaningHints,
  isTimeQuestionQuery,
  collectSeedEntries,
  getSeedExpansionTerms,
  dropGenericTermsWhenSpecific,
  isStrongAnchorTerm,
  cleanProfileDisplayTerms,
}) {
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

      const shouldSuppressPriceHints =
        !/얼마|가격|요금|비용|비싸|깎|깍|할인/.test(normalized) &&
        objectIds.some((id) => ["ticketOffice", "exchangeOffice"].includes(id));
      if (shouldSuppressPriceHints) {
        const blockedPriceTerms = new Set(
          ["얼마", "가격", "얼마예요", "이거 얼마예요?", "비용", "요금"].map((item) => compactText(item))
        );
        const filterPriceTerms = (items) => items.filter((item) => !blockedPriceTerms.has(compactText(item)));
        primaryTerms.splice(0, primaryTerms.length, ...filterPriceTerms(primaryTerms));
        relatedTerms.splice(0, relatedTerms.length, ...filterPriceTerms(relatedTerms));
        displayTerms.splice(0, displayTerms.length, ...filterPriceTerms(displayTerms));
      }

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
    const searchProfileSeed = { normalized };
    const resolvedDisplayTerms = cleanProfileDisplayTerms(
      searchProfileSeed,
      unique(displayTerms.length ? displayTerms : rawTokens)
        .filter((item) => !blockedTerms.has(compactText(item)))
        .slice(0, 6)
    );
    const directTerms = unique([compact, ...rawTokens.map((item) => compactText(item)), ...expandedCompacts].filter(Boolean)).filter(
      (item) => !blockedTerms.has(item)
    );

    return {
      query: trimmedQuery,
      normalized,
      compact,
      queryDirection,
      directTerms,
      primaryTerms: filteredPrimaryCompacts,
      relatedTerms: filteredRelatedCompacts,
      objectTerms,
      objectIds: unique(objectIds),
      actionTerms,
      actionIds: unique(actionIds),
      templateTerms,
      anchorTerms: unique([...rawAnchorTerms, ...intentAnchorTerms, ...fallbackAnchorTerms]).slice(0, 4),
      displayTerms: resolvedDisplayTerms.slice(0, 6),
      tags: sortTags(unique(tags)),
      preferredTags,
      avoidTags,
      minimumPrimaryHits: filteredPrimaryCompacts.length >= 3 ? 2 : filteredPrimaryCompacts.length ? 1 : 0,
      highlightTerms,
    };
  }

  return { buildSearchProfile };
}
