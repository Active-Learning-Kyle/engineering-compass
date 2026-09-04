import { growthOptions, interestOptions, questions } from './questions';
import type { AssessmentAnswers } from './types';
import type { CompetencyResult, ToolkitResult } from './scoring';
import { findProfileValue } from './scoring';
import { growthActions } from './growth-actions';

export function interpretResults(
  answers: AssessmentAnswers,
  competencyScores: CompetencyResult[],
  toolkitScores: ToolkitResult[],
) {
  const ranked = [...competencyScores].sort((a, b) => b.score - a.score);
  // Include ties at the second displayed score rather than breaking them by array order.
  const strengths = ranked.filter(
    (item) => item.score >= (ranked[1]?.score ?? ranked[0]?.score ?? 0),
  );
  const growthIds = Array.isArray(answers.G01) ? answers.G01 : [];
  const growth = growthIds.map((id) => ({
    id,
    label: growthOptions.find((option) => option.id === id)?.label ?? id,
    score: findProfileValue(id, competencyScores, toolkitScores),
    action: growthActions[id],
  }));
  const interestIds = Array.isArray(answers.I01) ? answers.I01 : [];
  const interests = interestIds.map(
    (id) => interestOptions.find((option) => option.id === id)?.label ?? id,
  );
  const judgmentValues = ['J01', 'J02'].map((id) => {
    const answer = answers[id];
    return typeof answer === 'number' ? answer : 1;
  });
  const judgmentMean =
    judgmentValues.reduce((sum, value) => sum + value, 0) /
    judgmentValues.length;
  const evidenceReflection =
    judgmentMean >= 4.5
      ? 'common.youTendToVerifyEvidenceIsolateUncertaintyAndCommunicate'
      : judgmentMean >= 3.5
        ? 'common.youShowADevelopingHabitOfCheckingEvidenceAnd'
        : 'common.whenEvidenceIsUncertainTryDefiningOneDiagnosticQuestion';

  const responsibilityItem = questions.find((item) => item.id === 'C02');
  const projectValue = typeof answers.C01 === 'number' ? answers.C01 : 1;
  const responsibilityValue = typeof answers.C02 === 'number' ? answers.C02 : 1;
  const responsibilityLabel =
    responsibilityItem?.kind === 'context'
      ? responsibilityItem.options.find(
          (option) => option.value === responsibilityValue,
        )?.label
      : undefined;

  return {
    strengths,
    growth,
    interests,
    evidenceReflection,
    projectLabel: `result.projects.${Math.min(5, Math.max(1, projectValue))}`,
    responsibilityLabel,
  };
}
