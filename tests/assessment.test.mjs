import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import ts from 'typescript';

// Test the source modules without introducing a new build/test dependency.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier))
        return nextResolve(`${specifier}.ts`, context);
      throw error;
    }
  },
  load(url, context, nextLoad) {
    if (url.endsWith('.ts'))
      return {
        format: 'module',
        shortCircuit: true,
        source: ts.transpileModule(readFileSync(new URL(url), 'utf8'), {
          compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2022,
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
