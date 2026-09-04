import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import ts from 'typescript';

// Test the source modules without introducing a new build/test dependency.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      const path = new URL('../' + specifier.slice(2) + '.ts', import.meta.url);
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
    if (/\.tsx?$/.test(url))
      return {
        format: 'module',
        shortCircuit: true,
        source: ts.transpileModule(readFileSync(new URL(url), 'utf8'), {
          compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2022,
            jsx: ts.JsxEmit.ReactJSX,
          },
        }).outputText,
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
} = await import('../lib/assessment/pro.ts');
const { calculateResults } = await import('../lib/assessment/scoring.ts');
const { interpretResults } =
  await import('../lib/assessment/interpretation.ts');
const { growthActions } = await import('../lib/assessment/growth-actions.ts');
const { translate } = await import('../lib/i18n/translate.ts');
const { zhHant } = await import('../lib/i18n/catalog.ts');
const { competencies } = await import('../lib/assessment/competencies.ts');
const { toolkit } = await import('../lib/assessment/toolkit.ts');
const { engineeringModes: translatedModes, growthStages: translatedStages } =
  await import('../lib/assessment/profile.ts');
const { studyYears } = await import('../lib/assessment/years.ts');
const { behaviourScale, technicalScale } =
  await import('../lib/assessment/questions.ts');

function assertTranslated(text) {
  if (!text || ['CAD'].includes(text)) return;
  assert.notEqual(
    translate(text, 'zh-Hant'),
    text,
    `Missing Traditional Chinese: ${text}`,
  );
  assert.equal(translate(text, 'en'), text, 'English must remain unchanged');
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
        .map((q) => [q.id, Math.min(value, q.kind === 'proCheck' ? 4 : 5)]),
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
  assert.ok(Object.keys(zhHant).length > 450);
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
      if (
        /[a-z]/i.test(text) &&
        !allowed.has(text) &&
        translate(text, 'zh-Hant') === text
      )
        missing.add(text);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.deepEqual([...missing], []);
});
test('Dynamic Chinese labels preserve counts and translate strength analysis', () => {
  assert.equal(translate('Question 55 of 60', 'zh-Hant'), '第 55 題，共 60 題');
  assert.equal(translate('4 selected', 'zh-Hant'), '已選 4 項');
  assert.equal(
    translate('Preview Problem Framer', 'zh-Hant'),
    '預覽問題定義者',
  );
  assert.equal(
    translate('Team Connector character illustration', 'zh-Hant'),
    '團隊連結者角色插圖',
  );
  const analysis =
    'Your answers point most strongly to Problem Identification, with Interdisciplinary Collaboration as a supporting strength. Hands-on Skills is the clearest area to practise next.';
  const chinese = translate(analysis, 'zh-Hant');
  assert.ok(
    chinese.includes('問題識別') &&
      chinese.includes('跨學科協作') &&
      chinese.includes('實作技能'),
  );
  assert.ok(!chinese.includes('Your answers'));
  assert.equal(
    translate(chinese, 'zh-Hant'),
    chinese,
    'Repeated presentation boundaries must be idempotent',
  );
});
const { initialCharacterVariant, engineeringModes } =
  await import('../lib/assessment/profile.ts');
const { compassSpringStep, shuffledCompassTargets, compassRetargetDelay } =
  await import('../lib/assessment/compass-motion.ts');
const { profileExportOptions } =
  await import('../lib/assessment/profile-export.ts');
const coreAnswers = Object.fromEntries(
  questions.map((item) => [
    item.id,
    item.kind === 'growth' ? ['design'] : item.kind === 'interest' ? [] : 3,
  ]),
);

test('Standard has 30 items; Pro has 60 sequential, unique, fully answerable items', () => {
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
    assert.equal(item.options.length, 4);
    assert.equal(new Set(item.options.map((option) => option.value)).size, 4);
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
      ...Object.fromEntries(proChecks.map((item) => [item.id, value])),
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
  assert.equal(result.projectLabel, 'Three or four completed projects');
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

test('Old Pro drafts resume missing middle questions without losing closing answers', () => {
  const answers = { ...coreAnswers };
  assert.equal(restoreQuestionIndex('pro', 'pro-v0.1', 29, answers), 24);
  for (const item of proChecks) answers[item.id] = 2;
  delete answers.C02;
  assert.equal(restoreQuestionIndex('pro', 'pro-v0.1', 25, answers), 55);
  assert.equal(restoreQuestionIndex('pro', 'pro-v0.2', 40, answers), 40);
  assert.equal(
    restoreQuestionIndex('standard', 'standard-v1.6', 25, answers),
    25,
  );
});

test('Long-image export removes page centering and captures explicit complete bounds', () => {
  for (const [width, height, dpr] of [
    [1280, 6500, 2],
    [1280, 22000, 3],
    [390, 31000, 3],
  ]) {
    const options = profileExportOptions(width, height, dpr);
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
test('Language presentation preserves control identity, handlers, values and complete rendered text', async () => {
  const React = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { localizeTree } = await import('../components/language.tsx');
  const choose = () => {};
  const original = React.createElement(
    'button',
    { key: 'B01-answer-4', onClick: choose, value: 4, 'aria-label': '4 of 5' },
    React.createElement('span', null, 'How you currently work'),
    React.createElement('strong', null, 75),
  );
  const translated = localizeTree(original, 'zh-Hant');
  assert.equal(translated.type, original.type);
  assert.equal(translated.key, original.key);
  assert.equal(translated.props.onClick, choose);
  assert.equal(translated.props.value, 4);
  const html = renderToStaticMarkup(translated);
  assert.ok(html.includes('你目前的工作方式') && html.includes('75'));
  assert.ok(html.includes('4 分（共 5 分）'));
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
    assert.equal(
      renderToStaticMarkup(localizeTree(tree, 'en')),
      renderToStaticMarkup(tree),
    );
  }
});
