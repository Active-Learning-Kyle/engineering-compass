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
    label: 'Problem Identification',
    short: 'Problem',
    description: 'Investigate and frame a challenge before solving it.',
    color: '#075b45',
  },
  planning: {
    label: 'Proposal with Plan',
    short: 'Planning',
    description: 'Turn a promising direction into a realistic route forward.',
    color: '#367a5e',
  },
  collaboration: {
    label: 'Interdisciplinary Collaboration',
    short: 'Collaboration',
    description: 'Connect responsibilities, perspectives, and decisions.',
    color: '#6f8f3d',
  },
  handsOn: {
    label: 'Hands-on Skills',
    short: 'Hands-on',
    description:
      'Current technical breadth, experience, and independence across the toolkit.',
    color: '#b28a2e',
  },
  design: {
    label: 'Design Thinking and Prototyping',
    short: 'Design',
    description: 'Prototype, test, diagnose, and improve through evidence.',
    color: '#387b73',
  },
  pitch: {
    label: 'Pitch for Engineering Solutions',
    short: 'Pitch',
    description: 'Communicate value, evidence, limitations, and trade-offs.',
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

