export function createSearchRuntimeHelpers({
  state,
  searchIndexCache,
  searchRuntimeCache,
  unique,
  compactText,
  tokenize,
  getThaiScriptText,
  dropGenericTermsWhenSpecific,
}) {
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

  return {
    matchesScenario,
    buildSearchIndex,
    getSearchRuntime,
    collectCandidateEntries,
  };
}
