import { growthOptions, interestOptions, questions } from './questions';
import type { AssessmentAnswers } from './types';
import type { CompetencyResult, ToolkitResult } from './scoring';
import { findProfileValue } from './scoring';

export function interpretResults(
  answers: AssessmentAnswers,
  competencyScores: CompetencyResult[],
  toolkitScores: ToolkitResult[],
) {
  const strengths = [...competencyScores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);
  const growthIds = Array.isArray(answers.G01) ? answers.G01 : [];
  const growth = growthIds.map((id) => ({
    id,
    label: growthOptions.find((option) => option.id === id)?.label ?? id,
    score: findProfileValue(id, competencyScores, toolkitScores),
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
      ? 'You tend to verify evidence, isolate uncertainty, and communicate trade-offs before committing to a decision.'
      : judgmentMean >= 3.5
        ? 'You show a developing habit of checking evidence and making uncertainty visible before changing direction.'
        : 'When evidence is uncertain, try defining one diagnostic question and changing one variable at a time before deciding.';

  const projectItem = questions.find((item) => item.id === 'C01');
  const responsibilityItem = questions.find((item) => item.id === 'C02');
  const projectValue = typeof answers.C01 === 'number' ? answers.C01 : 1;
  const responsibilityValue = typeof answers.C02 === 'number' ? answers.C02 : 1;
  const projectLabel =
    projectItem?.kind === 'context'
      ? projectItem.options.find((option) => option.value === projectValue)
          ?.label
      : undefined;
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
    projectLabel,
    responsibilityLabel,
  };
}
