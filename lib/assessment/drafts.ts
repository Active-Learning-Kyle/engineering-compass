import { currentVersion, getQuestions } from './pro';
import { exclusiveSelectionId, normalizeSelections } from './selections';
import type { AssessmentAnswers, AssessmentEdition } from './types';
export const progressStorageKey = 'engineering-compass-progress-v1.7';
export const legacyStorageKey = 'engineering-compass-progress-v1.6';
export type CurrentDraft = {
  edition: AssessmentEdition;
  version: string;
  year: string | null;
  current: number;
  answers: AssessmentAnswers;
  optionOrderSeed: number;
};
export function readDraft(
  raw: string,
):
  | { status: 'current'; draft: CurrentDraft }
  | { status: 'legacy' }
  | { status: 'invalid' } {
  try {
    const value = JSON.parse(raw);
    if (
      !value ||
      typeof value !== 'object' ||
      typeof value.version !== 'string'
    )
      return { status: 'invalid' };
    const edition: AssessmentEdition = value.version.startsWith('pro-')
      ? 'pro'
      : 'standard';
    if (value.version !== currentVersion(edition)) return { status: 'legacy' };
    const bank = getQuestions(edition);
    if (
      !Number.isInteger(value.current) ||
      value.current < 0 ||
      value.current >= bank.length ||
      !value.answers ||
      Array.isArray(value.answers) ||
      typeof value.answers !== 'object'
    )
      return { status: 'invalid' };
    for (const [id, answer] of Object.entries(value.answers)) {
      const item = bank.find((q) => q.id === id);
      if (!item) return { status: 'invalid' };
      if (item.kind === 'interest' || item.kind === 'growth') {
        if (
          !Array.isArray(answer) ||
          answer.some((id) => !item.options.some((o) => o.id === id))
        )
          return { status: 'invalid' };
        value.answers[id] = normalizeSelections(
          answer,
          exclusiveSelectionId(item.kind),
        );
      } else if (
        typeof answer !== 'number' ||
        !Number.isInteger(answer) ||
        ('options' in item
          ? !item.options.some((o) => 'value' in o && o.value === answer)
          : answer < 1 || answer > 5)
      )
        return { status: 'invalid' };
    }
    let current = value.current;
    if (value.questionOrder !== 'judgment-before-priorities') {
      const oldClosing = ['C01', 'C02', 'I01', 'G01', 'J01', 'J02'];
      const closingStart = bank.length - 6;
      if (current >= closingStart) {
        const oldId = oldClosing[current - closingStart];
        current = bank.findIndex((item) => item.id === oldId);
        // Keep answers by ID. Resume any newly preceding unanswered item first.
        const missing = bank.findIndex((item, index) => {
          if (index >= current) return false;
          const answer = value.answers[item.id];
          if (item.kind === 'interest') return !Array.isArray(answer);
          if (item.kind === 'growth')
            return !Array.isArray(answer) || answer.length < item.min;
          return typeof answer !== 'number';
        });
        if (missing >= 0) current = missing;
      }
    }
    return {
      status: 'current',
      draft: {
        edition,
        version: value.version,
        year: typeof value.year === 'string' ? value.year : null,
        current,
        answers: value.answers,
        optionOrderSeed:
          Number.isInteger(value.optionOrderSeed) && value.optionOrderSeed >= 0
            ? value.optionOrderSeed >>> 0
            : 0,
      },
    };
  } catch {
    return { status: 'invalid' };
  }
}
