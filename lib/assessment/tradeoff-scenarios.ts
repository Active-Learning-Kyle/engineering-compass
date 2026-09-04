import type { CompetencyKey, ProCheckItem } from './types';

const areas: CompetencyKey[] = [
  'problem',
  'planning',
  'collaboration',
  'handsOn',
  'design',
  'pitch',
  'problem',
  'planning',
  'collaboration',
  'handsOn',
  'design',
  'pitch',
];
// Values are choice identifiers, never an ordered merit scale.
export const tradeoffScenarios: ProCheckItem[] = areas.map((area, index) => {
  const id = `PS${String(index + 1).padStart(2, '0')}`;
  return {
    id,
    number: 25 + index,
    phase: 'proScenarios',
    kind: 'proCheck',
    area,
    prompt: `question.${id}.prompt`,
    helper: 'assessment.scenarios.helper',
    options: ['a', 'b'].map((option, i) => ({
      id: option,
      value: i + 1,
      label: `question.${id}.option.${option}.label`,
      feedback: `question.${id}.option.${option}.feedback`,
    })),
  };
});
