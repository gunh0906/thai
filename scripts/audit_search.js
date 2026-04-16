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

function buildAppContext(rootDir) {
  const queryMap = new Map();
  const document = {
    querySelector(selector) {
      if (!queryMap.has(selector)) queryMap.set(selector, makeElement());
      return queryMap.get(selector);
    },
    createElement() {
      return makeElement();
    },
    body: makeElement(),
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
  vm.runInContext(fs.readFileSync(path.join(rootDir, "app", "app.js"), "utf8"), context, { filename: "app.js" });
  vm.runInContext(
    `
      globalThis.__searchAuditApi = {
        compactText,
        normalizeText,
        getMergedData,
        buildSearchProfile,
        buildGeneratedNumberEntries,
        buildGeneratedTimeQuestionEntries,
        buildGeneratedTimeEntries,
        buildGeneratedComposedEntries,
        buildGeneratedWhatQuestionEntries,
        buildGeneratedPredicateEntries,
        buildGeneratedThaiMeaningEntries,
        findExactEntry,
        getVocabResults,
        getSentenceResults,
        uniqueById,
        uniqueByMeaning,
        mergeGeneratedEntrySets,
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
    const generatedTimeQuestion = !numberMode ? api.buildGeneratedTimeQuestionEntries(query) : { vocab: [], sentences: [] };
    const timeQuestionMode = !numberMode && generatedTimeQuestion.vocab.length > 0;
    const generatedTime = !numberMode && !timeQuestionMode ? api.buildGeneratedTimeEntries(query) : { vocab: [], sentences: [] };
    const timeMode = !numberMode && !timeQuestionMode && generatedTime.vocab.length > 0;
    const profile = api.buildSearchProfile(query, numberMode || timeQuestionMode || timeMode ? [] : merged.vocab);

    const exactVocab = numberMode ? null : api.findExactEntry(merged.vocab, profile);
    const preliminaryVocab =
      numberMode || timeQuestionMode || timeMode
        ? []
        : api.uniqueById([...(exactVocab ? [exactVocab] : []), ...api.getVocabResults(merged.vocab, profile)]);
    const generatedComposed =
      !numberMode && !timeQuestionMode && !timeMode
        ? api.buildGeneratedComposedEntries(query, profile, merged.vocab)
        : { vocab: [], sentences: [], suppressFallbackSentences: false };
    const generatedWhatQuestion =
      !numberMode && !timeQuestionMode && !timeMode
        ? api.buildGeneratedWhatQuestionEntries(query, profile, merged.vocab)
        : { vocab: [], sentences: [], suppressFallbackSentences: false };
    const generatedPredicate =
      !numberMode && !timeQuestionMode && !timeMode
        ? api.buildGeneratedPredicateEntries(query)
        : { vocab: [], sentences: [], suppressFallbackSentences: false };
    const generatedThaiMeaning =
      !numberMode && !timeQuestionMode && !timeMode
        ? api.buildGeneratedThaiMeaningEntries(query, profile, merged.vocab)
        : { vocab: [], sentences: [], suppressFallbackSentences: false };
    const generatedAssist = api.mergeGeneratedEntrySets(
      generatedComposed,
      generatedWhatQuestion,
      generatedPredicate,
      generatedThaiMeaning
    );
    const exactSentence = numberMode ? null : api.findExactEntry(merged.sentences, profile, { includeTemplates: true });
    const strictPhraseMode = Boolean(profile.templateTerms.length || (profile.objectTerms.length && profile.actionTerms.length));
    const safeExactSentence =
      strictPhraseMode && exactSentence?.source === "generated-bulk" ? null : exactSentence;
    const refinedVocab =
      generatedAssist.vocab.length || generatedAssist.sentences.length
        ? preliminaryVocab.filter((entry) => entry.source !== "generated-bulk")
        : preliminaryVocab;
    const allVocab = numberMode
      ? generated.vocab
      : timeQuestionMode
        ? generatedTimeQuestion.vocab
        : timeMode
          ? generatedTime.vocab
          : api.uniqueByMeaning(api.uniqueById([...generatedAssist.vocab, ...refinedVocab]));
    const vocab = allVocab.slice(0, 5);

    const refinedSentenceCandidates =
      numberMode || timeQuestionMode || timeMode
        ? []
        : generatedAssist.suppressFallbackSentences
          ? []
          : ((generatedAssist.vocab.length || generatedAssist.sentences.length || strictPhraseMode)
              ? api.getSentenceResults(
                  merged.sentences,
                  profile,
                  api.uniqueByMeaning([...generatedAssist.vocab, ...refinedVocab])
                ).filter((entry) => entry.source !== "generated-bulk")
              : api.getSentenceResults(
                  merged.sentences,
                  profile,
                  api.uniqueByMeaning([...generatedAssist.vocab, ...refinedVocab])
                ));
    const sentences = (
      numberMode
        ? generated.sentences
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
    ).slice(0, 5);

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

function main() {
  const rootDir = path.resolve(__dirname, "..");
  const args = process.argv.slice(2);
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
