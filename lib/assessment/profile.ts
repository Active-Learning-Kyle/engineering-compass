import type { AssessmentAnswers, CompetencyKey } from './types';
import type { CompetencyResult, ToolkitResult } from './scoring';

export type EngineeringModeKey = CompetencyKey;
export type CharacterVariant = 'a' | 'b';
export type GrowthStageKey =
  | 'exploring'
  | 'building'
  | 'practising'
  | 'integrating';

export const engineeringModes: Record<
  EngineeringModeKey,
  {
    name: string;
    shortDescription: string;
    contribution: string;
    accent: string;
    tint: string;
    image: Record<CharacterVariant, string>;
  }
> = {
  problem: {
    name: 'Problem Framer',
    shortDescription:
      'You look closely at what is happening before deciding what should be solved.',
    contribution:
      'In a team, you are especially good at defining the real need, gathering evidence, and turning a broad concern into an actionable problem.',
    accent: '#163f27',
    tint: '#edf4ed',
    image: {
      a: 'modes/problem-framer-a.webp',
      b: 'modes/problem-framer-b.webp',
    },
  },
  planning: {
    name: 'Project Navigator',
    shortDescription:
      'You turn a promising direction into a route that people can realistically follow.',
    contribution:
      'In a team, you are especially good at turning a promising direction into clear requirements, milestones, ownership, and a realistic plan.',
    accent: '#163f27',
    tint: '#edf4ed',
    image: {
      a: 'modes/project-navigator-a.webp',
      b: 'modes/project-navigator-b.webp',
    },
  },
  collaboration: {
    name: 'Team Connector',
    shortDescription:
      'You help different people, ideas, and technical contributions work together.',
    contribution:
      'In a team, you are especially good at connecting specialisms, clarifying ownership, and helping people resolve disagreements and dependencies.',
    accent: '#163f27',
    tint: '#edf4ed',
    image: {
      a: 'modes/team-connector-a.webp',
      b: 'modes/team-connector-b.webp',
    },
  },
  handsOn: {
    name: 'Practical Builder',
    shortDescription:
      'You learn quickly when an idea becomes something you can assemble, test, and improve.',
    contribution:
      'In a team, you are especially good at turning discussion into a working prototype, troubleshooting failures, and making practical constraints visible.',
    accent: '#163f27',
    tint: '#edf4ed',
    image: {
      a: 'modes/practical-builder-a.webp',
      b: 'modes/practical-builder-b.webp',
    },
  },
  design: {
    name: 'Prototype Explorer',
    shortDescription:
      'You use prototypes and tests to learn what should change next.',
    contribution:
      'In a team, you are especially good at creating early prototypes, designing useful tests, and turning evidence into focused improvements.',
    accent: '#163f27',
    tint: '#edf4ed',
    image: {
      a: 'modes/prototype-explorer-a.webp',
      b: 'modes/prototype-explorer-b.webp',
    },
  },
  pitch: {
    name: 'Solution Storyteller',
    shortDescription:
      'You make an engineering solution understandable, credible, and relevant to its audience.',
    contribution:
      'In a team, you are especially good at explaining the problem and value clearly, supporting claims with evidence, and communicating limitations honestly.',
    accent: '#163f27',
    tint: '#edf4ed',
    image: {
      a: 'modes/solution-storyteller-a.webp',
      b: 'modes/solution-storyteller-b.webp',
    },
  },
};

export const growthStages: Record<
  GrowthStageKey,
  { name: string; number: number; description: string }
> = {
  exploring: {
    name: 'Exploring',
    number: 1,
    description: 'Trying unfamiliar engineering tasks with guidance.',
  },
  building: {
    name: 'Building',
    number: 2,
    description: 'Taking ownership of familiar tasks with some support.',
  },
  practising: {
    name: 'Practising',
    number: 3,
    description: 'Working independently on a subsystem, test, or deliverable.',
  },
  integrating: {
    name: 'Integrating',
    number: 4,
    description: 'Connecting work across people, interfaces, or subsystems.',
  },
};

export function deriveEngineeringMode(
  competencyScores: CompetencyResult[],
): EngineeringModeKey {
  const sorted = [...competencyScores].sort((a, b) => b.score - a.score);
  return sorted[0]?.key ?? 'problem';
}

export function deriveGrowthStage(
  answers: AssessmentAnswers,
  toolkitScores: ToolkitResult[],
): GrowthStageKey {
  const projects = typeof answers.C01 === 'number' ? answers.C01 : 1;
  const responsibility = typeof answers.C02 === 'number' ? answers.C02 : 1;
  const toolkitMean =
    toolkitScores.reduce((sum, item) => sum + item.score / 25 + 1, 0) /
    Math.max(toolkitScores.length, 1);
  const currentExperience =
    projects * 0.25 + responsibility * 0.5 + toolkitMean * 0.25;

  if (currentExperience < 1.8) return 'exploring';
  if (currentExperience < 2.8) return 'building';
  if (currentExperience < 3.8) return 'practising';
  return 'integrating';
}
