import { competencies, competencyOrder } from './competencies';
import { questions } from './questions';
import { toolkit, toolkitOrder } from './toolkit';
import type { AssessmentAnswers, CompetencyKey, ToolkitKey } from './types';

const toPercent = (value: number) => Math.round(((value - 1) / 4) * 100);

const numericAnswer = (answers: AssessmentAnswers, id: string) => {
  const value = answers[id];
  return typeof value === 'number' ? value : 1;
};

export function calculateResults(answers: AssessmentAnswers) {
  const competencyScores = competencyOrder.map((key) => {
    const values =
      key === 'handsOn'
        ? questions
            .filter((item) => item.kind === 'technical')
            .map((item) => numericAnswer(answers, item.id))
        : questions
            .filter(
              (item) => item.kind === 'behaviour' && item.competency === key,
            )
            .map((item) => numericAnswer(answers, item.id));
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    return {
      key,
      subject: competencies[key].short,
      fullLabel: competencies[key].label,
      score: toPercent(mean),
      description: competencies[key].description,
      color: competencies[key].color,
    };
  });

  const toolkitScores = toolkitOrder.map((key) => ({
    key,
    name: toolkit[key].label,
    short: toolkit[key].short,
    description: toolkit[key].description,
    score: toPercent(
      numericAnswer(
        answers,
        `T${String(toolkitOrder.indexOf(key) + 1).padStart(2, '0')}`,
      ),
    ),
  }));

  return { competencyScores, toolkitScores };
}

export type CompetencyResult = ReturnType<
  typeof calculateResults
>['competencyScores'][number];
export type ToolkitResult = ReturnType<
  typeof calculateResults
>['toolkitScores'][number];

export function findProfileValue(
  id: string,
  competencyScores: CompetencyResult[],
  toolkitScores: ToolkitResult[],
) {
  return (
    competencyScores.find((item) => item.key === (id as CompetencyKey))
      ?.score ??
    toolkitScores.find((item) => item.key === (id as ToolkitKey))?.score
  );
}

