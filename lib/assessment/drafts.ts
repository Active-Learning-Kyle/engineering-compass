import { currentVersion, getQuestions } from './pro';
import type { AssessmentAnswers, AssessmentEdition } from './types';
export const progressStorageKey = 'engineering-compass-progress-v1.7';
export const legacyStorageKey = 'engineering-compass-progress-v1.6';
export type CurrentDraft = {
  edition: AssessmentEdition;
  version: string;
  year: string | null;
  current: number;
  answers: AssessmentAnswers;
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
      } else if (
        typeof answer !== 'number' ||
        !Number.isInteger(answer) ||
        ('options' in item
          ? !item.options.some((o) => 'value' in o && o.value === answer)
          : answer < 1 || answer > 5)
      )
        return { status: 'invalid' };
    }
    return {
      status: 'current',
      draft: {
        edition,
        version: value.version,
        year: typeof value.year === 'string' ? value.year : null,
        current: value.current,
        answers: value.answers,
      },
    };
  } catch {
    return { status: 'invalid' };
  }
}
