const fs = require("fs");
const path = require("path");
const vm = require("vm");

function makeElement() {
  return {
    value: "",
    innerHTML: "",
    textContent: "",
    hidden: false,
    dataset: {},
    style: {},
    children: [],
    className: "",
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    appendChild(node) {
      this.children.push(node);
      return node;
    },
    append(...nodes) {
      this.children.push(...nodes);
    },
    replaceChildren(...nodes) {
      this.children = nodes;
    },
    addEventListener() {},
    removeEventListener() {},
    setAttribute() {},
    removeAttribute() {},
    querySelector() {
      return makeElement();
    },
    querySelectorAll() {
      return [];
    },
    scrollIntoView() {},
    focus() {},
    click() {},
    reset() {},
  };
}

function readTextFile(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

function stripImportSuffix(specifier) {
  return String(specifier || "").replace(/[?#].*$/, "");
}

function collectModuleFiles(entryFile, seen = new Set(), ordered = []) {
  const resolved = path.resolve(entryFile);
  if (seen.has(resolved)) return ordered;
  seen.add(resolved);

  const source = readTextFile(resolved);
  const importPattern = /^\s*import\b[\s\S]*?\bfrom\s+["'](.+?)["'];?\s*$/gm;
  let match = null;
  while ((match = importPattern.exec(source)) !== null) {
    const specifier = String(match[1] || "");
    if (!specifier.startsWith(".")) continue;
    collectModuleFiles(path.resolve(path.dirname(resolved), stripImportSuffix(specifier)), seen, ordered);
  }

  ordered.push(resolved);
  return ordered;
}

function transpileModuleToScript(source) {
  return String(source || "")
    .replace(/^\uFEFF/, "")
    .replace(/^\s*import\b[\s\S]*?;\s*$/gm, "")
    .replace(/^\s*export\s+\{[^}]+\};?\s*$/gm, "")
    .replace(/\bexport\s+(?=(function|const|let|class))/g, "");
}

function runModuleLikeScript(context, filePath) {
  const code = transpileModuleToScript(readTextFile(filePath));
  vm.runInContext(code, context, { filename: path.basename(filePath) });
}

function buildAppContext(rootDir) {
  const queryMap = new Map();
  const document = {
    querySelector(selector) {
      if (!queryMap.has(selector)) queryMap.set(selector, makeElement());
      return queryMap.get(selector);
    },
    querySelectorAll() {
      return [];
    },
    createElement() {
      return makeElement();
    },
    body: makeElement(),
    documentElement: makeElement(),
    addEventListener() {},
  };

  const localStorage = {
    getItem() {
      return null;
    },
    setItem() {},
    removeItem() {},
  };

  const context = {
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    URL,
    URLSearchParams,
    Blob: function Blob() {},
    FileReader: function FileReader() {
      this.readAsText = () => {};
      this.addEventListener = () => {};
    },
    localStorage,
    document,
    navigator: { serviceWorker: { getRegistrations: () => Promise.resolve([]) } },
    caches: { keys: () => Promise.resolve([]), delete: () => Promise.resolve(true) },
  };

  context.window = context;
  context.window.document = document;
  context.window.localStorage = localStorage;
  context.window.location = { search: "", pathname: "/index.html", protocol: "http:" };
  context.window.history = { replaceState() {} };
  context.window.addEventListener = () => {};
  context.window.removeEventListener = () => {};
  context.window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  context.window.cancelAnimationFrame = (id) => clearTimeout(id);
  context.window.requestIdleCallback = (cb) => setTimeout(cb, 0);
  context.window.cancelIdleCallback = (id) => clearTimeout(id);
  context.window.URL = Object.assign(URL, { createObjectURL: () => "blob:temp", revokeObjectURL() {} });
  context.window.URLSearchParams = URLSearchParams;
  context.window.Blob = context.Blob;
  context.window.FileReader = context.FileReader;
  context.window.navigator = context.navigator;
  context.window.caches = context.caches;
  context.globalThis = context;

  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(rootDir, "app", "data.js"), "utf8"), context, { filename: "data.js" });
  collectModuleFiles(path.join(rootDir, "app", "app.js")).forEach((filePath) => {
    runModuleLikeScript(context, filePath);
  });
  vm.runInContext(
    `
      globalThis.__searchAuditApi = {
        compactText,
        normalizeText,
        getMergedData,
        buildSearchProfile,
        buildGeneratedNumberEntries,
        buildGeneratedDateEntries,
        buildGeneratedTimeQuestionEntries,
        buildGeneratedTimeEntries,
        buildGeneratedComposedEntries,
        buildGeneratedWhereQuestionEntries,
        buildGeneratedWhatQuestionEntries,
        buildGeneratedPredicateEntries,
        buildGeneratedThaiMeaningEntries,
        findExactEntry,
        shouldKeepExactSentenceMatch,
        getVocabResults: (...args) => searchEngine.getVocabResults(...args),
        getSentenceResults: (...args) => searchEngine.getSentenceResults(...args),
        uniqueById,
        uniqueByMeaning,
        mergeGeneratedEntrySets,
        refineGeneratedVocabForSpecificObject,
        finalizeSearchEntries,
        isSentenceLikeVocabEntry,
        isUtilityLabelVocabEntry,
      };
    `,
    context
  );

  return context;
}

function createSearchRunner(context) {
  const api = context.__searchAuditApi;

  function search(query) {
    const merged = api.getMergedData();
    const generated = api.buildGeneratedNumberEntries(query);
    const numberMode = generated.vocab.length > 0;
    const generatedDate = !numberMode ? api.buildGeneratedDateEntries(query) : { vocab: [], sentences: [] };
    const dateMode = !numberMode && generatedDate.vocab.length > 0;
    const generatedTimeQuestion = !numberMode && !dateMode ? api.buildGeneratedTimeQuestionEntries(query) : { vocab: [], sentences: [] };
    const timeQuestionMode = !numberMode && !dateMode && generatedTimeQuestion.vocab.length > 0;
    const generatedTime = !numberMode && !dateMode && !timeQuestionMode ? api.buildGeneratedTimeEntries(query) : { vocab: [], sentences: [] };
    const timeMode = !numberMode && !dateMode && !timeQuestionMode && generatedTime.vocab.length > 0;
    const profile = api.buildSearchProfile(query, numberMode || dateMode || timeQuestionMode || timeMode ? [] : merged.vocab);

    const exactVocab = numberMode || dateMode ? null : api.findExactEntry(merged.vocab, profile);
    const preliminaryVocab =
      numberMode || dateMode || timeQuestionMode || timeMode
        ? []
        : api.uniqueById([...(exactVocab ? [exactVocab] : []), ...api.getVocabResults(merged.vocab, profile)]);
    const generatedComposed =
      !numberMode && !dateMode && !timeQuestionMode && !timeMode
        ? api.buildGeneratedComposedEntries(query, profile, merged.vocab)
        : { vocab: [], sentences: [], suppressFallbackSentences: false };
    const generatedWhereQuestion =
      !numberMode && !dateMode && !timeQuestionMode && !timeMode
        ? api.buildGeneratedWhereQuestionEntries(query, profile, merged.vocab)
        : { vocab: [], sentences: [], suppressFallbackSentences: false };
    const generatedWhatQuestion =
      !numberMode && !dateMode && !timeQuestionMode && !timeMode
        ? api.buildGeneratedWhatQuestionEntries(query, profile, merged.vocab)
        : { vocab: [], sentences: [], suppressFallbackSentences: false };
    const generatedPredicate =
      !numberMode && !dateMode && !timeQuestionMode && !timeMode
        ? api.buildGeneratedPredicateEntries(query)
        : { vocab: [], sentences: [], suppressFallbackSentences: false };
    const generatedThaiMeaning =
      !numberMode && !dateMode && !timeQuestionMode && !timeMode
        ? api.buildGeneratedThaiMeaningEntries(query, profile, merged.vocab)
        : { vocab: [], sentences: [], suppressFallbackSentences: false };
    const generatedAssist = api.mergeGeneratedEntrySets(
      generatedComposed,
      generatedWhereQuestion,
      generatedWhatQuestion,
      generatedPredicate,
      generatedThaiMeaning
    );
    const refinedGeneratedVocab = api.refineGeneratedVocabForSpecificObject(generatedAssist.vocab, profile);
    const exactSentence = numberMode || dateMode ? null : api.findExactEntry(merged.sentences, profile, { includeTemplates: true });
    const strictPhraseMode = Boolean(profile.templateTerms.length || (profile.objectTerms.length && profile.actionTerms.length));
    const exactSentenceIsExactQuery = exactSentence && api.compactText(exactSentence.korean) === api.compactText(query);
    const safeExactSentence =
      exactSentence &&
      ((strictPhraseMode && exactSentence.source === "generated-bulk") ||
        (generatedWhereQuestion.suppressFallbackSentences && !exactSentenceIsExactQuery) ||
        !api.shouldKeepExactSentenceMatch(exactSentence, profile))
        ? null
        : exactSentence;
    const baseRefinedVocab =
      generatedAssist.vocab.length || generatedAssist.sentences.length
        ? preliminaryVocab.filter((entry) => entry.source !== "generated-bulk")
        : preliminaryVocab;
    const refinedVocab = api.refineGeneratedVocabForSpecificObject(baseRefinedVocab, profile);
    const rawVocab = numberMode
      ? generated.vocab
      : dateMode
        ? generatedDate.vocab
      : timeQuestionMode
        ? generatedTimeQuestion.vocab
        : timeMode
          ? generatedTime.vocab
          : api.uniqueByMeaning(api.uniqueById([...refinedGeneratedVocab, ...refinedVocab]));
    const vocab = api.finalizeSearchEntries(rawVocab, profile, "vocab", 5);

    const refinedSentenceCandidates =
      numberMode || dateMode || timeQuestionMode || timeMode
        ? []
        : generatedAssist.suppressFallbackSentences
          ? []
          : ((generatedAssist.vocab.length || generatedAssist.sentences.length || strictPhraseMode)
              ? api.getSentenceResults(
                  merged.sentences,
                  profile,
                  api.uniqueByMeaning([...refinedGeneratedVocab, ...refinedVocab])
                ).filter((entry) => entry.source !== "generated-bulk")
              : api.getSentenceResults(
                  merged.sentences,
                  profile,
                  api.uniqueByMeaning([...refinedGeneratedVocab, ...refinedVocab])
                ));
    const rawSentences = (
      numberMode
        ? generated.sentences
        : dateMode
          ? api.uniqueById([
              ...(safeExactSentence ? [safeExactSentence] : []),
              ...generatedDate.sentences,
            ])
        : timeQuestionMode
          ? api.uniqueById([
              ...(safeExactSentence ? [safeExactSentence] : []),
              ...generatedTimeQuestion.sentences,
            ])
          : timeMode
          ? generatedTime.sentences
            : api.uniqueByMeaning(api.uniqueById([
                ...(safeExactSentence ? [safeExactSentence] : []),
                ...generatedAssist.sentences,
                ...refinedSentenceCandidates,
              ]))
    );
    const sentences = api.finalizeSearchEntries(rawSentences, profile, "sentence", 5);

    return { profile, vocab, sentences };
  }

  function compact(value) {
    return api.compactText(value || "");
  }

  function exactMatch(entries, query) {
    const target = compact(query);
    return entries.some((entry) => compact(entry.korean) === target);
  }

  function containsQuery(entries, query) {
    const target = compact(query);
    if (!target) return false;
    return entries.some((entry) => compact(entry.korean).includes(target));
  }

  function containsKeyword(entries, keywords) {
    const terms = (keywords || [])
      .map((item) => compact(item))
      .filter((item) => item.length >= 2);
    if (!terms.length) return false;
    return entries.some((entry) => {
      const korean = compact(entry.korean);
      return terms.some((term) => korean.includes(term));
    });
  }

  return { search, compact, exactMatch, containsQuery, containsKeyword, api };
}

function summarizeTags(entries) {
  const counts = new Map();
  entries.forEach((item) => {
    (item.tags || []).forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
}

function audit(rootDir) {
  const context = buildAppContext(rootDir);
  const runner = createSearchRunner(context);
  const merged = runner.api.getMergedData();
  const curatedVocab = merged.vocab.filter((entry) => entry.source !== "generated-bulk");
  const curatedSentences = merged.sentences.filter((entry) => entry.source !== "generated-bulk");

  const vocabIssues = [];
  const sentenceIssues = [];

  curatedVocab.forEach((entry) => {
    if (runner.api.isSentenceLikeVocabEntry(entry) || runner.api.isUtilityLabelVocabEntry(entry)) return;
    const result = runner.search(entry.korean);
    const topVocab = result.vocab.slice(0, 3);
    const topSentences = result.sentences.slice(0, 3);
    const exactTop1 = topVocab.length > 0 && runner.compact(topVocab[0].korean) === runner.compact(entry.korean);
    const exactTop3 = runner.exactMatch(topVocab, entry.korean);
    const connectedSentence = runner.containsQuery(topSentences, entry.korean) || runner.containsKeyword(topSentences, entry.keywords);
    if (!exactTop1 || !exactTop3 || !connectedSentence) {
      vocabIssues.push({
        query: entry.korean,
        source: entry.source,
        tags: entry.tags || [],
        exactTop1,
        exactTop3,
        connectedSentence,
        vocabTop3: topVocab.map((item) => item.korean),
        sentenceTop3: topSentences.map((item) => item.korean),
      });
    }
  });

  curatedSentences.forEach((entry) => {
    const result = runner.search(entry.korean);
    const topSentences = result.sentences.slice(0, 3);
    const exactTop1 = topSentences.length > 0 && runner.compact(topSentences[0].korean) === runner.compact(entry.korean);
    const exactTop3 = runner.exactMatch(topSentences, entry.korean);
    if (!exactTop1 || !exactTop3) {
      sentenceIssues.push({
        query: entry.korean,
        source: entry.source,
        tags: entry.tags || [],
        exactTop1,
        exactTop3,
        sentenceTop3: topSentences.map((item) => item.korean),
      });
    }
  });

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      curatedVocab: curatedVocab.length,
      curatedSentences: curatedSentences.length,
      vocabIssues: vocabIssues.length,
      sentenceIssues: sentenceIssues.length,
      vocabIssueRate: curatedVocab.length ? Number((vocabIssues.length / curatedVocab.length).toFixed(4)) : 0,
      sentenceIssueRate: curatedSentences.length ? Number((sentenceIssues.length / curatedSentences.length).toFixed(4)) : 0,
    },
    issueTags: {
      vocab: summarizeTags(vocabIssues),
      sentences: summarizeTags(sentenceIssues),
    },
    vocabIssues: vocabIssues.slice(0, 120),
    sentenceIssues: sentenceIssues.slice(0, 120),
  };
}

function inspectQueries(rootDir, queries) {
  const context = buildAppContext(rootDir);
  const runner = createSearchRunner(context);
  return queries.map((query) => {
    const result = runner.search(query);
    return {
      query,
      vocab: result.vocab.map((entry) => ({
        korean: entry.korean,
        source: entry.source,
        tags: entry.tags || [],
      })),
      sentences: result.sentences.map((entry) => ({
        korean: entry.korean,
        source: entry.source,
        tags: entry.tags || [],
      })),
    };
  });
}

function hasCompactExact(runner, texts, expected) {
  const target = runner.compact(expected);
  return Boolean(target) && texts.some((text) => runner.compact(text) === target);
}

function hasCompactIncludes(runner, texts, expected) {
  const target = runner.compact(expected);
  return Boolean(target) && texts.some((text) => runner.compact(text).includes(target));
}

function anyCompactExact(runner, texts, expectedList) {
  return (expectedList || []).some((expected) => hasCompactExact(runner, texts, expected));
}

function anyCompactIncludes(runner, texts, expectedList) {
  return (expectedList || []).some((expected) => hasCompactIncludes(runner, texts, expected));
}

function evaluateRegressionCase(runner, testCase) {
  const query = String(testCase?.query || "").trim();
  const expect = testCase?.expect || {};
  const result = runner.search(query);
  const vocabTexts = result.vocab.map((entry) => String(entry.korean || "").trim());
  const sentenceTexts = result.sentences.map((entry) => String(entry.korean || "").trim());
  const topVocab = vocabTexts.slice(0, 3);
  const topSentences = sentenceTexts.slice(0, 3);
  const failures = [];

  if (expect.vocabTop1 && !hasCompactExact(runner, topVocab.slice(0, 1), expect.vocabTop1)) {
    failures.push(`vocab top1 mismatch: expected "${expect.vocabTop1}"`);
  }
  if (expect.vocabTop1Includes && !hasCompactIncludes(runner, topVocab.slice(0, 1), expect.vocabTop1Includes)) {
    failures.push(`vocab top1 should include "${expect.vocabTop1Includes}"`);
  }
  if (Array.isArray(expect.vocabTop3Includes)) {
    expect.vocabTop3Includes.forEach((expected) => {
      if (!hasCompactExact(runner, topVocab, expected)) {
        failures.push(`vocab top3 missing "${expected}"`);
      }
    });
  }
  if (Array.isArray(expect.vocabTop3IncludesAny) && expect.vocabTop3IncludesAny.length) {
    if (!anyCompactExact(runner, topVocab, expect.vocabTop3IncludesAny)) {
      failures.push(`vocab top3 missing any of [${expect.vocabTop3IncludesAny.join(", ")}]`);
    }
  }
  if (Array.isArray(expect.forbidVocabTop1)) {
    expect.forbidVocabTop1.forEach((forbidden) => {
      if (hasCompactIncludes(runner, topVocab.slice(0, 1), forbidden)) {
        failures.push(`vocab top1 should not include "${forbidden}"`);
      }
    });
  }

  if (expect.sentenceTop1 && !hasCompactExact(runner, topSentences.slice(0, 1), expect.sentenceTop1)) {
    failures.push(`sentence top1 mismatch: expected "${expect.sentenceTop1}"`);
  }
  if (expect.sentenceTop1Includes && !hasCompactIncludes(runner, topSentences.slice(0, 1), expect.sentenceTop1Includes)) {
    failures.push(`sentence top1 should include "${expect.sentenceTop1Includes}"`);
  }
  if (Array.isArray(expect.sentenceTop3Includes)) {
    expect.sentenceTop3Includes.forEach((expected) => {
      if (!hasCompactExact(runner, topSentences, expected)) {
        failures.push(`sentence top3 missing "${expected}"`);
      }
    });
  }
  if (Array.isArray(expect.sentenceTop3IncludesAny) && expect.sentenceTop3IncludesAny.length) {
    if (!anyCompactExact(runner, topSentences, expect.sentenceTop3IncludesAny)) {
      failures.push(`sentence top3 missing any of [${expect.sentenceTop3IncludesAny.join(", ")}]`);
    }
  }
  if (Array.isArray(expect.sentenceTop3IncludesAnyText) && expect.sentenceTop3IncludesAnyText.length) {
    if (!anyCompactIncludes(runner, topSentences, expect.sentenceTop3IncludesAnyText)) {
      failures.push(`sentence top3 missing any text of [${expect.sentenceTop3IncludesAnyText.join(", ")}]`);
    }
  }
  if (Array.isArray(expect.forbidSentenceTop1)) {
    expect.forbidSentenceTop1.forEach((forbidden) => {
      if (hasCompactIncludes(runner, topSentences.slice(0, 1), forbidden)) {
        failures.push(`sentence top1 should not include "${forbidden}"`);
      }
    });
  }

  return {
    query,
    category: String(testCase?.category || "").trim(),
    passed: failures.length === 0,
    failures,
    topVocab,
    topSentences,
  };
}

function summarizeRegressionCategories(results) {
  const counts = new Map();
  results.forEach((result) => {
    const key = String(result.category || "uncategorized").trim() || "uncategorized";
    const current = counts.get(key) || { total: 0, passed: 0, failed: 0 };
    current.total += 1;
    if (result.passed) {
      current.passed += 1;
    } else {
      current.failed += 1;
    }
    counts.set(key, current);
  });
  return Object.fromEntries(
    [...counts.entries()]
      .sort((left, right) => left[0].localeCompare(right[0], "ko"))
      .map(([category, summary]) => [category, summary])
  );
}

function runRegressionSuite(rootDir, casesPath, options = {}) {
  const context = buildAppContext(rootDir);
  const runner = createSearchRunner(context);
  const resolvedPath = path.resolve(rootDir, casesPath || path.join("scripts", "search_regression_cases.json"));
  const categoryFilter = String(options?.category || "").trim();
  const cases = JSON.parse(readTextFile(resolvedPath)).filter((testCase) => {
    if (!categoryFilter) return true;
    return String(testCase?.category || "").trim() === categoryFilter;
  });
  const results = cases.map((testCase) => evaluateRegressionCase(runner, testCase));
  const failed = results.filter((item) => !item.passed);
  return {
    generatedAt: new Date().toISOString(),
    casesPath: resolvedPath,
    categoryFilter,
    summary: {
      total: results.length,
      passed: results.length - failed.length,
      failed: failed.length,
    },
    categorySummary: summarizeRegressionCategories(results),
    failedCases: failed,
  };
}

function main() {
  const rootDir = path.resolve(__dirname, "..");
  const args = process.argv.slice(2);
  if (args[0] === "--regression" || args[0] === "--regression-category") {
    let casesPath = null;
    let category = "";
    if (args[0] === "--regression-category") {
      category = String(args[1] || "").trim();
      casesPath = args[2] || null;
    } else {
      for (let index = 1; index < args.length; index += 1) {
        if (args[index] === "--category") {
          category = String(args[index + 1] || "").trim();
          index += 1;
          continue;
        }
        if (!casesPath) {
          casesPath = args[index];
        }
      }
    }
    const report = runRegressionSuite(rootDir, casesPath, { category });
    console.log(JSON.stringify(report, null, 2));
    if (report.summary.failed) {
      process.exitCode = 1;
    }
    return;
  }
  if (args.length) {
    console.log(JSON.stringify(inspectQueries(rootDir, args), null, 2));
    return;
  }
  const report = audit(rootDir);
  const reportDir = path.join(rootDir, "audit");
  fs.mkdirSync(reportDir, { recursive: true });
  const outPath = path.join(reportDir, "search-audit.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report.summary, null, 2));
  console.log(`saved: ${outPath}`);
}

main();
