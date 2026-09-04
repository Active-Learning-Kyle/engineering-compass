import { questions, assessmentVersion } from './questions';
import { competencies } from './competencies';
import { toolkit, toolkitOrder } from './toolkit';
import { evidenceItems } from './evidence-items';
import { tradeoffScenarios } from './tradeoff-scenarios';
import type {
  AssessmentAnswers,
  AssessmentEdition,
  CompetencyKey,
} from './types';

export const proVersion = 'pro-v0.3';
export const proChecks = [...tradeoffScenarios, ...evidenceItems];
// Both editions end with the same six context/priority/judgment items.
export const proQuestions = [
  ...questions.slice(0, 24),
  ...proChecks,
  ...questions.slice(24),
].map((item, index) => ({ ...item, number: index + 1 }));
export const getQuestions = (edition: AssessmentEdition) =>
  edition === 'pro' ? proQuestions : questions;
export const currentVersion = (edition: AssessmentEdition) =>
  edition === 'pro' ? proVersion : assessmentVersion;

export function restoreQuestionIndex(
  edition: AssessmentEdition,
  version: string,
  current: number,
  _answers: AssessmentAnswers,
) {
  // Changed response meanings must not be silently reinterpreted.
  if (version !== currentVersion(edition)) return 0;
  return Math.min(
    Math.max(Math.floor(current), 0),
    getQuestions(edition).length - 1,
  );
}

export function interpretPro(answers: AssessmentAnswers) {
  const scenariosByArea = Object.keys(competencies).map((area) => ({
    area,
    label: competencies[area as CompetencyKey].label,
    reflections: tradeoffScenarios
      .filter((item) => item.area === area)
      .map((item) => ({
        id: item.id,
        prompt: item.prompt,
        choice: item.options.find(
          (option) => option.value === answers[item.id],
        ),
      })),
  }));
  const evidence = toolkitOrder.map((area, index) => {
    const checks = evidenceItems.filter((item) => item.area === area);
    const values = checks.map(
      (item) =>
        item.options.find((option) => option.value === answers[item.id])
          ?.value ?? 0,
    );
    const answered = values.filter((value) => value > 0).length;
    const independent = values.filter((value) => value === 4).length;
    const experienced = values.filter((value) => value >= 3).length;
    const core = answers[`T${String(index + 1).padStart(2, '0')}`];
    const mismatch =
      typeof core === 'number' &&
      core >= 4 &&
      values.some((value) => value > 0 && value <= 2);
    const firstPractice = checks[values.indexOf(Math.min(...values))];
    return {
      area,
      label: toolkit[area].label,
      answered,
      total: checks.length,
      independent,
      experienced,
      summary:
        answered < checks.length
          ? 'result.evidence.incomplete'
          : independent === 2
            ? 'evidence.summary.verified'
            : experienced > 0
              ? 'evidence.summary.mixed'
              : 'evidence.summary.guided',
      consistency:
        answered < checks.length
          ? 'result.evidence.incomplete'
          : mismatch
            ? 'evidence.consistency.mixed'
            : independent === 2 && typeof core === 'number' && core >= 4
              ? 'evidence.consistency.aligned'
              : 'evidence.consistency.varied',
      crossCheck: mismatch ? 'evidence.consistency.mixed' : null,
      next: firstPractice?.options.find(
        (option) => option.value === answers[firstPractice.id],
      )?.feedback,
    };
  });
  return { scenariosByArea, evidence };
}
