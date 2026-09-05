import { readDraft } from './drafts';
import { currentVersion, getQuestions } from './pro';
import type { AssessmentAnswers, AssessmentEdition } from './types';

export const completedProfileStorageKey =
  'engineering-compass-latest-result-v1';

export type CompletedProfile = {
  edition: AssessmentEdition;
  version: string;
  year: string | null;
  answers: AssessmentAnswers;
  completedAt: string;
};

function hasCompleteAnswer(
  item: ReturnType<typeof getQuestions>[number],
  answer: unknown,
) {
  if (item.kind === 'interest') return Array.isArray(answer);
  if (item.kind === 'growth')
    return Array.isArray(answer) && answer.length >= item.min;
  return typeof answer === 'number';
}

export function createCompletedProfile(
  edition: AssessmentEdition,
  year: string | null,
  answers: AssessmentAnswers,
  completedAt = new Date().toISOString(),
): CompletedProfile {
  return {
    edition,
    version: currentVersion(edition),
    year,
    answers,
    completedAt,
  };
}

export function serializeCompletedProfile(profile: CompletedProfile) {
  return JSON.stringify({
    ...profile,
    questionOrder: 'judgment-before-priorities',
    current: getQuestions(profile.edition).length - 1,
  });
}

export function readCompletedProfile(raw: string): CompletedProfile | null {
  try {
    const stored = JSON.parse(raw);
    if (
      !stored ||
      typeof stored !== 'object' ||
      typeof stored.completedAt !== 'string' ||
      !Number.isFinite(Date.parse(stored.completedAt))
    )
      return null;

    const parsed = readDraft(raw);
    if (parsed.status !== 'current') return null;

    const { edition, version, year, answers } = parsed.draft;
    if (
      version !== currentVersion(edition) ||
      !getQuestions(edition).every((item) =>
        hasCompleteAnswer(item, answers[item.id]),
      )
    )
      return null;

    return {
      edition,
      version,
      year,
      answers,
      completedAt: stored.completedAt,
    };
  } catch {
    return null;
  }
}
