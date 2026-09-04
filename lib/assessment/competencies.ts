import type { CompetencyKey } from './types';

export const competencies: Record<
  CompetencyKey,
  {
    label: string;
    short: string;
    description: string;
    color: string;
  }
> = {
  problem: {
    label: 'competency.problem.label',
    short: 'competency.problem.short',
    description: 'competency.problem.description',
    color: '#075b45',
  },
  planning: {
    label: 'competency.planning.label',
    short: 'competency.planning.short',
    description: 'competency.planning.description',
    color: '#367a5e',
  },
  collaboration: {
    label: 'competency.collaboration.label',
    short: 'competency.collaboration.short',
    description: 'competency.collaboration.description',
    color: '#6f8f3d',
  },
  handsOn: {
    label: 'competency.handsOn.label',
    short: 'competency.handsOn.short',
    description: 'competency.handsOn.description',
    color: '#b28a2e',
  },
  design: {
    label: 'competency.design.label',
    short: 'competency.design.short',
    description: 'competency.design.description',
    color: '#387b73',
  },
  pitch: {
    label: 'competency.pitch.label',
    short: 'competency.pitch.short',
    description: 'competency.pitch.description',
    color: '#526f60',
  },
};

export const competencyOrder: CompetencyKey[] = [
  'problem',
  'planning',
  'collaboration',
  'handsOn',
  'design',
  'pitch',
];
