import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import ts from 'typescript';

// Test the source modules without introducing a new build/test dependency.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      let path = new URL('../' + specifier.slice(2) + '.ts', import.meta.url);
      if (!existsSync(path))
        path = new URL('../' + specifier.slice(2) + '.tsx', import.meta.url);
      return nextResolve(path.href, context);
    }
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier))
        return nextResolve(`${specifier}.ts`, context);
      throw error;
    }
  },
  load(url, context, nextLoad) {
    if (/\.tsx?(?:\?unit)?$/.test(url))
      return {
        format: 'module',
        shortCircuit: true,
        source: ts.transpileModule(
          readFileSync(new URL(url), 'utf8').replaceAll(
            'import.meta.env.BASE_URL',
            "'/'",
          ) +
            (url.endsWith('page.tsx?unit')
              ? '\nexport { Results, Assessment, Welcome, Header, MultiChoices };'
              : ''),
          {
            compilerOptions: {
              module: ts.ModuleKind.ESNext,
              target: ts.ScriptTarget.ES2022,
              jsx: ts.JsxEmit.ReactJSX,
            },
          },
        ).outputText,
      };
    return nextLoad(url, context);
  },
});
const { questions, growthOptions } =
  await import('../lib/assessment/questions.ts');
const {
  proChecks,
  proQuestions,
  getQuestions,
  interpretPro,
  restoreQuestionIndex,
  currentVersion,
} = await import('../lib/assessment/pro.ts');
const { calculateResults } = await import('../lib/assessment/scoring.ts');
const { interpretResults } =
  await import('../lib/assessment/interpretation.ts');
const { growthActions } = await import('../lib/assessment/growth-actions.ts');
const { translate, messages, isMessageReference } =
  await import('../lib/i18n/translate.ts');
const { readDraft, progressStorageKey, legacyStorageKey } =
  await import('../lib/assessment/drafts.ts');
const { exclusiveSelectionId, toggleSelection } =
  await import('../lib/assessment/selections.ts');
test('unsure choice leaves concrete cards visible but disabled', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { MultiChoices } = await import('../app/page.tsx?unit');
  for (const kind of ['interest', 'growth']) {
    const item = questions.find((q) => q.kind === kind);
    const exclusiveId = exclusiveSelectionId(kind);
    const html = renderToStaticMarkup(
      createElement(MultiChoices, {
        options: item.options,
        selected: [exclusiveId],
        exclusiveId,
        onToggle: () => {},
      }),
    );
    assert.equal(
      (html.match(/ disabled=""/g) || []).length,
      item.options.length - 1,
    );
    assert.equal((html.match(/aria-pressed="true"/g) || []).length, 1);
    assert.ok(html.includes('Deselect this option'));
    const enabled = renderToStaticMarkup(
      createElement(MultiChoices, {
        options: item.options,
        selected: [],
        exclusiveId,
        onToggle: () => {},
      }),
    );
    assert.ok(!enabled.includes('disabled=""'));
  }
});
test('unsure selections clear and disable concrete choices until deselected', () => {
  for (const kind of ['interest', 'growth']) {
    const exclusive = exclusiveSelectionId(kind);
    assert.deepEqual(
      toggleSelection(['first', 'second'], exclusive, exclusive),
      [exclusive],
    );
    assert.deepEqual(toggleSelection([exclusive], 'first', exclusive), [
      exclusive,
    ]);
    assert.deepEqual(toggleSelection([exclusive], exclusive, exclusive), []);
    assert.deepEqual(toggleSelection([], 'first', exclusive), ['first']);
  }
});
test('saved conflicting choices are normalized for both editions', () => {
  for (const edition of ['standard', 'pro']) {
    const bank = getQuestions(edition);
    const answers = {};
    for (const kind of ['interest', 'growth']) {
      const item = bank.find((q) => q.kind === kind);
      answers[item.id] = [item.options[0].id, exclusiveSelectionId(kind)];
    }
    const result = readDraft(
      JSON.stringify({
        version: currentVersion(edition),
        current: 0,
        answers,
        questionOrder: 'judgment-before-priorities',
      }),
    );
    assert.equal(result.status, 'current');
    assert.deepEqual(result.draft.answers.I01, ['other-interest']);
    assert.deepEqual(result.draft.answers.G01, ['not-sure']);
  }
});
const { competencies } = await import('../lib/assessment/competencies.ts');
const { toolkit } = await import('../lib/assessment/toolkit.ts');
const { engineeringModes: translatedModes, growthStages: translatedStages } =
  await import('../lib/assessment/profile.ts');
const { studyYears } = await import('../lib/assessment/years.ts');
const { behaviourScale, technicalScale } =
  await import('../lib/assessment/questions.ts');

function assertTranslated(text) {
  if (!text) return;
  assert.ok(isMessageReference(text), `Expected stable key: ${text}`);
  assert.notEqual(
    translate(text, 'zh-Hant'),
    text,
    `Missing Traditional Chinese: ${text}`,
  );
  assert.notEqual(
    translate(text, 'en'),
    text,
    'English must resolve from a key',
  );
}
function checkCopy(object) {
  for (const [key, value] of Object.entries(object)) {
    if (
      [
        'prompt',
        'helper',
        'label',
        'short',
        'description',
        'shortDescription',
        'contribution',
        'note',
        'feedback',
        'summary',
        'crossCheck',
        'next',
        'action',
        'projectLabel',
        'responsibilityLabel',
        'evidenceReflection',
        'fullLabel',
        'name',
        'low',
        'high',
        'consistency',
      ].includes(key) &&
      typeof value === 'string'
    )
      assertTranslated(value);
    else if (key === 'skills' || key === 'details' || key === 'interests')
      value.forEach(assertTranslated);
    else if (value && typeof value === 'object') checkCopy(value);
  }
}
test('Traditional Chinese covers every Standard and Pro prompt, option and feedback', () => {
  checkCopy(proQuestions);
  checkCopy([behaviourScale, technicalScale]);
  checkCopy(competencies);
  checkCopy(toolkit);
  checkCopy(translatedModes);
  checkCopy(translatedStages);
  checkCopy(studyYears);
  Object.values(growthActions).forEach(assertTranslated);
  for (let value = 1; value <= 5; value++) {
    const answers = Object.fromEntries(
      proQuestions
        .filter((q) => !['interest', 'growth'].includes(q.kind))
        .map((q) => [
          q.id,
          Math.min(
            value,
            q.phase === 'proScenarios' ? 2 : q.kind === 'proCheck' ? 4 : 5,
          ),
        ]),
    );
    answers.I01 = ['robotics', 'data-ai'];
    answers.G01 = growthOptions.map((o) => o.id);
    const results = calculateResults(answers);
    checkCopy(
      interpretResults(
        answers,
        results.competencyScores,
        results.toolkitScores,
      ),
    );
    checkCopy(interpretPro(answers));
  }
  assert.ok(Object.keys(messages['zh-Hant']).length > 450);
});
test('All static JSX copy is covered, including accessible labels and modal text', () => {
  const source = readFileSync(
    new URL('../app/page.tsx', import.meta.url),
    'utf8',
  );
  const ast = ts.createSourceFile(
    'page.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const allowed = new Set(['N', 'E', 'S', 'W', 'Standard', 'Pro']);
  const missing = new Set();
  function visit(node) {
    if (ts.isJsxText(node)) {
      const text = node.text
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
      if (/[a-z]/i.test(text) && !allowed.has(text)) missing.add(text);
    }
    if (ts.isStringLiteral(node) && isMessageReference(node.text)) {
      assert.ok(
        Object.hasOwn(messages.en, node.text),
        `Unknown source key ${node.text}`,
      );
      assert.ok(
        Object.hasOwn(messages['zh-Hant'], node.text),
        `Missing Chinese ${node.text}`,
      );
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.deepEqual([...missing], []);
});
test('Stable bilingual keys and named parameters never silently fall back to English', () => {
  assert.equal(
    translate('assessment.questionCount', 'zh-Hant', {
      current: 55,
      total: 60,
    }),
    '第 55 題，共 60 題',
  );
  assert.equal(
    translate('assessment.selectedCount', 'zh-Hant', { count: 4 }),
    '已選 4 項',
  );
  assert.equal(
    translate('role.preview', 'zh-Hant', {
      name: translate('role.problem.name', 'zh-Hant'),
    }),
    '預覽問題定義者',
  );
  assert.throws(() => translate('unknown.key', 'zh-Hant'), /Missing/);
  assert.throws(() => translate('assessment.questionCount', 'en'), /Missing/);
  assert.deepEqual(
    Object.keys(messages.en).sort(),
    Object.keys(messages['zh-Hant']).sort(),
  );
  for (const key of Object.keys(messages.en)) {
    const params = (text) =>
      [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    assert.deepEqual(
      params(messages.en[key]),
      params(messages['zh-Hant'][key]),
      key,
    );
  }
  const before = translate('home.hero.title', 'zh-Hant');
  const english = messages.en['home.hero.title'];
  try {
    messages.en['home.hero.title'] = 'Revised punctuation, same stable key.';
    assert.equal(translate('home.hero.title', 'zh-Hant'), before);
  } finally {
    messages.en['home.hero.title'] = english;
  }
});
const { initialCharacterVariant, engineeringModes } =
  await import('../lib/assessment/profile.ts');
const { compassSpringStep, shuffledCompassTargets, compassRetargetDelay } =
  await import('../lib/assessment/compass-motion.ts');
const { profileExportOptions, pdfPageBreaks } =
  await import('../lib/assessment/profile-export.ts');
test('PDF pagination keeps complete blocks and covers the full report', () => {
  assert.deepEqual(
    pdfPageBreaks(2400, 1000, [{ top: 800, bottom: 1150 }]),
    [0, 800, 1800, 2400],
  );
  const breaks = pdfPageBreaks(3600, 1000, [{ top: 0, bottom: 2200 }]);
  assert.deepEqual(breaks, [0, 1000, 2000, 3000, 3600]);
});
const coreAnswers = Object.fromEntries(
  questions.map((item) => [
    item.id,
    item.kind === 'growth' ? ['design'] : item.kind === 'interest' ? [] : 3,
  ]),
);

test('Standard has 30 items; Pro has 60 sequential, unique, fully answerable items', () => {
  for (const bank of [questions, proQuestions]) {
    assert.deepEqual(
      bank.slice(-6).map((item) => item.id),
      ['C01', 'C02', 'J01', 'J02', 'I01', 'G01'],
    );
    bank.forEach((item, index) => assert.equal(item.number, index + 1));
  }
  assert.equal(getQuestions('standard').length, 30);
  assert.equal(getQuestions('pro').length, 60);
  assert.deepEqual(proQuestions.slice(0, 24), questions.slice(0, 24));
  assert.deepEqual(
    proQuestions.slice(-6).map((item) => item.id),
    questions.slice(-6).map((item) => item.id),
  );
  assert.equal(proQuestions[24].id, 'PS01');
  assert.equal(proQuestions[36].id, 'PE01');
  assert.equal(proQuestions[54].id, 'C01');
  assert.equal(new Set(proQuestions.map((item) => item.id)).size, 60);
  proQuestions.forEach((item, index) => assert.equal(item.number, index + 1));
  for (const item of proChecks) {
    const count = item.phase === 'proScenarios' ? 2 : 4;
    assert.equal(item.options.length, count);
    assert.equal(
      new Set(item.options.map((option) => option.value)).size,
      count,
    );
    assert.ok(item.options.every((option) => option.label && option.feedback));
  }
});

test('Pro covers two scenarios per competency and two practice checks per toolkit', () => {
  for (const area of Object.keys(engineeringModes))
    assert.equal(
      proChecks.filter(
        (item) => item.phase === 'proScenarios' && item.area === area,
      ).length,
      2,
    );
  for (const area of [
    'mechanical',
    'cad',
    'fabrication',
    'electronics',
    'programming',
    'physicalComputing',
    'sensorsIot',
    'aiVision',
    'integration',
  ])
    assert.equal(
      proChecks.filter(
        (item) => item.phase === 'proEvidence' && item.area === area,
      ).length,
      2,
    );
});

test('Pro additional answers never silently change core scores', () => {
  const expected = calculateResults(coreAnswers);
  for (const value of [1, 2, 3, 4]) {
    const answers = {
      ...coreAnswers,
      ...Object.fromEntries(
        proChecks.map((item) => [
          item.id,
          item.phase === 'proScenarios' ? (value % 2) + 1 : value,
        ]),
      ),
    };
    assert.deepEqual(calculateResults(answers), expected);
    const reflection = interpretPro(answers);
    assert.equal(reflection.scenariosByArea.length, 6);
    assert.equal(reflection.evidence.length, 9);
    assert.ok(
      reflection.scenariosByArea.every((group) =>
        group.reflections.every((item) => item.choice?.feedback),
      ),
    );
    assert.ok(reflection.evidence.every((item) => item.summary && item.next));
  }
  assert.ok(expected.competencyScores.every((item) => item.score === 50));
});

test('Growth choices each have a distinct action, including an unlimited full selection', () => {
  assert.equal(
    new Set(Object.values(growthActions)).size,
    growthOptions.length,
  );
  const answers = {
    ...coreAnswers,
    G01: growthOptions.map((item) => item.id),
    C01: 4,
  };
  const scores = calculateResults(answers);
  const result = interpretResults(
    answers,
    scores.competencyScores,
    scores.toolkitScores,
  );
  assert.equal(result.growth.length, growthOptions.length);
  assert.ok(result.growth.every((item) => item.action));
  assert.equal(
    translate(result.projectLabel, 'en'),
    'Three or four completed projects',
  );
});

test('Home and results use the requested starting portraits, and all assets exist', () => {
  const expected = {
    problem: 'a',
    planning: 'b',
    collaboration: 'a',
    handsOn: 'b',
    design: 'a',
    pitch: 'b',
  };
  for (const [key, variant] of Object.entries(expected)) {
    assert.equal(initialCharacterVariant(key), variant);
    for (const image of Object.values(engineeringModes[key].image))
      assert.ok(
        existsSync(new URL(`../public/${image}`, import.meta.url)),
        image,
      );
  }
});

test('Evidence cross-checks identify a high broad rating alongside newer specific practice', () => {
  const answers = {
    ...coreAnswers,
    T01: 5,
    ...Object.fromEntries(proChecks.map((item) => [item.id, 1])),
  };
  assert.ok(interpretPro(answers).evidence[0].crossCheck);
  answers.PE01 = 4;
  answers.PE02 = 4;
  assert.equal(interpretPro(answers).evidence[0].crossCheck, null);
});

test('Compass visits every direction in each cycle without repeating the boundary target', () => {
  let previous = -1;
  for (let cycle = 0; cycle < 100; cycle++) {
    const targets = shuffledCompassTargets(previous);
    assert.notEqual(targets[0], previous);
    assert.deepEqual(
      [...targets].sort((a, b) => a - b),
      [0, 60, 120, 180, 240, 300],
    );
    previous = targets.at(-1);
  }
});

test('Compass makes multiple overshoots and keeps moving between target changes', () => {
  let angle = 0,
    velocity = 0,
    crossings = 0,
    sign = -1;
  const lateAngles = [];
  for (let frame = 1; frame <= 150; frame++) {
    ({ angle, velocity } = compassSpringStep(
      angle,
      velocity,
      120,
      (frame * 1000) / 60,
      1 / 60,
    ));
    if (Math.sign(angle - 120) !== sign) {
      crossings++;
      sign = Math.sign(angle - 120);
    }
    if (frame > 120) lateAngles.push(angle);
    assert.ok(Number.isFinite(angle));
  }
  assert.ok(crossings >= 4, `Only ${crossings} overshoots`);
  assert.ok(Math.max(...lateAngles) - Math.min(...lateAngles) > 0.5);
});

test('Compass retargets rapidly, before it can settle', () => {
  assert.equal(
    compassRetargetDelay(() => 0),
    650,
  );
  assert.equal(
    compassRetargetDelay(() => 1),
    900,
  );
  let angle = 0,
    velocity = 0,
    crossings = 0,
    sign = -1;
  for (let frame = 1; frame <= 39; frame++) {
    ({ angle, velocity } = compassSpringStep(
      angle,
      velocity,
      120,
      (frame * 1000) / 60,
      1 / 60,
    ));
    if (Math.sign(angle - 120) !== sign) {
      crossings++;
      sign = Math.sign(angle - 120);
    }
  }
  assert.ok(crossings >= 2);
});

test('Changed question meanings cannot reuse old drafts; current drafts resume with stable IDs', () => {
  assert.notEqual(progressStorageKey, legacyStorageKey);
  for (const [edition, version] of [
    ['pro', 'pro-v0.1'],
    ['pro', 'pro-v0.2'],
    ['standard', 'standard-v1.6'],
  ]) {
    assert.equal(restoreQuestionIndex(edition, version, 25, coreAnswers), 0);
    assert.equal(
      readDraft(
        JSON.stringify({ edition, version, current: 25, answers: coreAnswers }),
      ).status,
      'legacy',
    );
  }
  for (const edition of ['standard', 'pro']) {
    const draft = {
      edition,
      version: currentVersion(edition),
      year: 'year-1',
      current: 25,
      answers: coreAnswers,
    };
    assert.deepEqual(readDraft(JSON.stringify(draft)), {
      status: 'current',
      draft,
    });
    assert.equal(
      restoreQuestionIndex(edition, currentVersion(edition), 25, coreAnswers),
      25,
    );
  }
  assert.equal(readDraft('{').status, 'invalid');
  assert.equal(
    readDraft(
      JSON.stringify({
        edition: 'pro',
        version: currentVersion('pro'),
        current: 25,
        year: null,
        answers: { PS01: 4 },
      }),
    ).status,
    'invalid',
  );
});

test('Summary export keeps mobile and desktop canvas bounds safe', () => {
  for (const [width, height, dpr] of [
    [342, 2400, 3],
    [1184, 1600, 2],
    [1280, 6500, 2],
    [1280, 22000, 3],
    [390, 31000, 3],
  ]) {
    const options = profileExportOptions(width, height, dpr);
    assert.ok(
      !('backgroundColor' in options),
      'Export must not replace the card background with a page background',
    );
    assert.equal(options.width, width);
    assert.equal(options.height, height);
    assert.equal(options.canvasWidth, width);
    assert.equal(options.canvasHeight, height);
    assert.equal(options.style.marginInline, '0');
    assert.equal(options.style.marginLeft, '0');
    assert.equal(options.style.marginRight, '0');
    assert.equal(options.style.maxWidth, 'none');
    assert.equal(options.style.boxSizing, 'border-box');
    assert.ok(width * height * options.pixelRatio ** 2 <= 12_000_001);
    assert.ok(height * options.pixelRatio <= 16001);
    assert.ok(options.pixelRatio > 0);
  }
});
test('PDF download targets the entire results page', () => {
  const source = readFileSync(
    new URL('../app/page.tsx', import.meta.url),
    'utf8',
  );
  assert.match(
    source,
    /document\.getElementById\(\s*'engineering-compass-results',?\s*\)/,
  );
  const ast = ts.createSourceFile(
    'page.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let summary;
  const visit = (node) => {
    if (
      ts.isJsxElement(node) &&
      node.openingElement.attributes.properties.some(
        (attr) =>
          ts.isJsxAttribute(attr) &&
          attr.name.getText(ast) === 'id' &&
          attr.initializer?.text === 'engineering-compass-results',
      )
    )
      summary = node.getText(ast);
    ts.forEachChild(node, visit);
  };
  visit(ast);
  assert.ok(summary?.includes('mode-hero'));
  assert.ok(summary?.includes('<Radar'));
  assert.ok(summary?.includes('toolkit-results-grid'));
  assert.ok(summary?.includes('common.currentStrengths'));
  assert.ok(summary?.includes('result-growth-stack'));
});
test('Language presentation preserves control identity, handlers, values and complete rendered text', async () => {
  const React = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { localizeTree } = await import('../components/language.tsx');
  const choose = () => {};
  const original = React.createElement(
    'button',
    {
      key: 'B01-answer-4',
      onClick: choose,
      value: 4,
      'aria-label': 'scale.behaviour.details.3',
    },
    React.createElement('span', null, 'result.radar.title'),
    React.createElement('strong', null, 75),
  );
  const translated = localizeTree(original, 'zh-Hant');
  assert.equal(translated.type, original.type);
  assert.equal(translated.key, original.key);
  assert.equal(translated.props.onClick, choose);
  assert.equal(translated.props.value, 4);
  const html = renderToStaticMarkup(translated);
  assert.ok(html.includes('你目前的工作方式') && html.includes('75'));
  assert.ok(html.includes('經常'));
  assert.equal(renderToStaticMarkup(localizeTree(translated, 'zh-Hant')), html);
  for (const question of proQuestions) {
    const tree = React.createElement(
      'article',
      null,
      React.createElement('h1', null, question.prompt),
      React.createElement('p', null, question.helper),
      ...('options' in question
        ? question.options.map((o) =>
            React.createElement('button', { key: o.id }, o.label),
          )
        : []),
    );
    const zh = renderToStaticMarkup(localizeTree(tree, 'zh-Hant'));
    assert.ok(!zh.includes(question.prompt), question.id);
    assert.ok(/[\u3400-\u9fff]/.test(zh), question.id);
    const en = renderToStaticMarkup(localizeTree(tree, 'en'));
    assert.ok(!en.includes(question.prompt), question.id);
    assert.ok(
      en.includes(
        renderToStaticMarkup(
          React.createElement('h1', null, translate(question.prompt, 'en')),
        ),
      ),
      question.id,
    );
  }
});

test('Behaviour items keep five numeric frequency anchors tied to recent actual work', () => {
  const items = questions.filter((q) => q.kind === 'behaviour');
  assert.equal(items.length, 15);
  assert.ok(items.every((item) => !item.helper));
  for (const item of items) {
    assert.match(translate(item.prompt, 'en'), /\bI\b/);
    assert.doesNotMatch(
      translate(item.prompt, 'en'),
      /audience|claim|criterion|problem statement|handovers/i,
    );
  }
  assert.deepEqual(
    behaviourScale.details.map((k) => translate(k, 'en')),
    ['Never', 'Rarely', 'Sometimes', 'Often', 'Almost always'],
  );
  assert.match(
    translate('assessment.behaviour.helper', 'en'),
    /recent learning/i,
  );
  assert.match(translate(behaviourScale.prompt, 'en'), /how often/i);
  for (const value of [1, 2, 3, 4, 5]) {
    const answers = Object.fromEntries(
      questions.map((q) => [
        q.id,
        ['growth', 'interest'].includes(q.kind) ? [] : value,
      ]),
    );
    assert.ok(
      calculateResults(answers).competencyScores.every(
        (s) => s.score === (value - 1) * 25,
      ),
    );
  }
});

test('Trade-off options have comparable lengths and no merit score metadata', () => {
  for (const item of proChecks.filter((q) => q.phase === 'proScenarios')) {
    for (const locale of ['en', 'zh-Hant']) {
      const lengths = item.options.map((o) =>
        locale === 'en'
          ? translate(o.label, locale).split(/\s+/).length
          : translate(o.label, locale).length,
      );
      assert.ok(
        Math.max(...lengths) / Math.min(...lengths) <= 1.55,
        `${item.id} ${locale}: ${lengths}`,
      );
    }
    for (const option of item.options) {
      assert.deepEqual(Object.keys(option).sort(), [
        'feedback',
        'id',
        'label',
        'value',
      ]);
      assert.ok(translate(option.feedback, 'en').length > 80);
    }
  }
});

test('Leading mode presentation preserves ties without an arbitrary near-tie threshold', async () => {
  const { deriveLeadingModes } = await import('../lib/assessment/profile.ts');
  const scores = calculateResults(coreAnswers).competencyScores;
  assert.equal(deriveLeadingModes(scores).balanced, true);
  assert.equal(deriveLeadingModes(scores).leading.length, 6);
  const close = scores.map((s, i) => ({
    ...s,
    score: i === 0 ? 96 : i === 1 ? 95 : 50,
  }));
  assert.equal(deriveLeadingModes(close).leading.length, 1);
  assert.equal(deriveLeadingModes(close).supporting[0].score, 95);
  close[1].score = 96;
  assert.equal(deriveLeadingModes(close).leading.length, 2);
  const interpretation = interpretResults(coreAnswers, scores, []);
  assert.equal(interpretation.strengths.length, 6);
});

test('Pro evidence reports factual task counts, distinguishes incomplete responses, and does not claim validation', () => {
  const answers = { ...coreAnswers, T01: 5, PE01: 4, PE02: 4 };
  let evidence = interpretPro(answers).evidence[0];
  assert.equal(evidence.independent, 2);
  assert.equal(evidence.experienced, 2);
  assert.equal(evidence.consistency, 'evidence.consistency.aligned');
  answers.PE02 = 1;
  evidence = interpretPro(answers).evidence[0];
  assert.equal(evidence.independent, 1);
  assert.equal(evidence.consistency, 'evidence.consistency.mixed');
  delete answers.PE02;
  evidence = interpretPro(answers).evidence[0];
  assert.equal(evidence.answered, 1);
  assert.equal(evidence.summary, 'result.evidence.incomplete');
  assert.equal(evidence.consistency, 'result.evidence.incomplete');
  assert.match(
    translate('result.evidence.selfReport', 'en'),
    /not externally verified/,
  );
});

test('Independent growth cards retain their final border and padding', () => {
  const css = readFileSync(
    new URL('../app/globals.css', import.meta.url),
    'utf8',
  );
  assert.doesNotMatch(css, /\.growth-row:last-child\s*\{/);
  assert.match(
    css,
    /\.growth-actions-grid \.growth-row\s*\{[^}]*border: 1px solid var\(--border\);[^}]*padding: 1\.2rem;/s,
  );
  assert.match(css, /\.radar-axis-label\s*\{[^}]*font-size: 1rem;/s);
  assert.match(css, /var\(--font-geist-sans, Arial\)/);
});

test('Language controls render within the sticky assessment/results header', async () => {
  const React = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { Header } = await import('../app/page.tsx?unit');
  for (const progress of [null, 55]) {
    const html = renderToStaticMarkup(
      React.createElement(Header, { progress }),
    );
    assert.match(html, /^<header class="sticky top-0/);
    assert.match(html, /language-toolbar-inline/);
    assert.ok(html.includes('English') && html.includes('繁體中文'));
    assert.equal((html.match(/language-switch"/g) ?? []).length, 1);
  }
});

test('Home introduction is neutral about assessment length in both languages', () => {
  assert.doesNotMatch(translate('home.hero.description', 'en'), /short/i);
  assert.doesNotMatch(translate('home.hero.description', 'zh-Hant'), /簡短/);
});
test('Only project count retains a visible helper across the full Pro bank', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { Assessment } = await import('../app/page.tsx?unit');
  for (const question of getQuestions('pro')) {
    const html = renderToStaticMarkup(
      createElement(Assessment, {
        total: 60,
        phases: [],
        question,
        current: question.number - 1,
        selected: undefined,
        activePhaseIndex: 0,
        canContinue: false,
        showNudge: false,
        onChooseNumber() {},
        onToggle() {},
        onBack() {},
        onHome() {},
        onAdvance() {},
      }),
    );
    if (question.helper)
      assert.equal(
        html.includes(translate(question.helper, 'en')),
        question.id === 'C01',
        question.id,
      );
    assert.ok(!html.includes('reflection-note'));
  }
  for (const language of ['en', 'zh-Hant'])
    assert.equal(
      translate('growth.not-sure.label', language),
      translate('interest.other-interest.label', language),
    );
});
test('Behaviour screen removes contextual coaching and keeps frequency legend visually hidden', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { Assessment } = await import('../app/page.tsx?unit');
  const html = renderToStaticMarkup(
    createElement(Assessment, {
      total: 30,
      phases: [
        { key: 'behaviour', label: 'phase.behaviour.label', range: '1–15' },
      ],
      question: questions[0],
      current: 0,
      selected: undefined,
      activePhaseIndex: 0,
      canContinue: false,
      showNudge: false,
      onChooseNumber() {},
      onToggle() {},
      onBack() {},
      onHome() {},
      onAdvance() {},
    }),
  );
  assert.ok(!html.includes(translate('assessment.behaviour.helper', 'en')));
  assert.ok(!html.includes('reflection-note'));
  assert.ok(html.includes('<legend class="sr-only">'));
  assert.ok(html.includes('Never') && html.includes('Almost always'));
  assert.ok(html.includes('assessment-home'));
});

test('Reordered closing questions preserve old draft answers without skipping judgment', () => {
  for (const edition of ['standard', 'pro']) {
    const bank = getQuestions(edition);
    const start = bank.length - 6;
    const answers = {
      ...coreAnswers,
      ...Object.fromEntries(proChecks.map((q) => [q.id, 1])),
    };
    if (edition === 'standard') for (const q of proChecks) delete answers[q.id];
    delete answers.J01;
    delete answers.J02;
    for (const offset of [2, 3, 4, 5]) {
      const result = readDraft(
        JSON.stringify({
          edition,
          version: currentVersion(edition),
          current: start + offset,
          year: null,
          answers,
        }),
      );
      assert.equal(result.status, 'current');
      assert.equal(result.draft.current, start + 2);
      assert.deepEqual(result.draft.answers, answers);
    }
    const current = readDraft(
      JSON.stringify({
        edition,
        version: currentVersion(edition),
        questionOrder: 'judgment-before-priorities',
        current: start + 4,
        year: null,
        answers,
      }),
    );
    assert.equal(current.draft.current, start + 4);
  }
});

test('Result components render complete single, joint and balanced profiles without unresolved keys', async () => {
  // Pure server-rendered component test: no browser, DOM inspection or screenshot.
  const React = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { Results } = await import('../app/page.tsx?unit');
  for (const pattern of ['single', 'joint', 'balanced']) {
    const answers = {
      ...coreAnswers,
      ...Object.fromEntries(
        proChecks.map((q) => [q.id, q.phase === 'proScenarios' ? 1 : 4]),
      ),
    };
    const scores = calculateResults(answers);
    const competencyScores = scores.competencyScores.map((s, i) => ({
      ...s,
      score:
        pattern === 'balanced'
          ? 50
          : i === 0
            ? 96
            : i === 1
              ? pattern === 'joint'
                ? 96
                : 95
              : 50,
    }));
    for (const pro of [false, true]) {
      const html = renderToStaticMarkup(
        React.createElement(Results, {
          competencyScores,
          toolkitScores: scores.toolkitScores,
          interpretation: interpretResults(
            answers,
            competencyScores,
            scores.toolkitScores,
          ),
          year: 'year-1',
          proReflection: pro ? interpretPro(answers) : null,
          modeKey: 'problem',
          growthStageKey: 'integrating',
          onRestart: () => {},
          onDownload: async () => {},
        }),
      );
      assert.ok(html.includes('CURRENT EXPERIENCE SCOPE'));
      assert.ok(!html.includes('04/04'));
      assert.ok(html.includes('ONE NEXT STEP'));
      assert.ok(html.includes(currentVersion(pro ? 'pro' : 'standard')));
      if (pro) assert.ok(html.includes('not externally verified'));
      if (pattern === 'balanced')
        assert.ok(html.includes('A balanced current profile'));
      if (pattern === 'joint') assert.ok(html.includes('Joint leading modes'));
      if (pattern === 'single')
        assert.ok(html.includes('Next-highest current mode(s)'));
      assert.doesNotMatch(
        html,
        /(?:question\.(?:PS|PE|B)\d+|result\.(?:role|scope|quick|evidence)|common\.)/,
      );
    }
  }
});
