import type { AssessmentAnswers, CompetencyKey } from './types';
import type { CompetencyResult, ToolkitResult } from './scoring';

export type EngineeringModeKey = CompetencyKey | 'integrator';
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
      'Help the team define the real need, gather evidence, and turn a broad concern into an actionable problem.',
    accent: '#c9444b',
    tint: '#f8e5e5',
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
      'Clarify requirements, milestones, ownership, resources, and important risks before work accelerates.',
    accent: '#d66a17',
    tint: '#faeadf',
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
      'Translate between specialisms, make ownership clear, and surface disagreements early enough to resolve them.',
    accent: '#a77700',
    tint: '#f8efc9',
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
      'Turn discussion into a working prototype, troubleshoot common failures, and make practical constraints visible.',
    accent: '#147a50',
    tint: '#dff0e7',
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
      'Create an early version, design a useful test, diagnose failures, and turn feedback into a focused iteration.',
    accent: '#087f89',
    tint: '#dff1f1',
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
      'Explain the problem and value clearly, support claims with evidence, and communicate limitations honestly.',
    accent: '#3567b3',
    tint: '#e3eaf7',
    image: {
      a: 'modes/solution-storyteller-a.webp',
      b: 'modes/solution-storyteller-b.webp',
    },
  },
  integrator: {
    name: 'Systems Integrator',
    shortDescription:
      'You connect parts, people, and evidence into a coherent working whole.',
    contribution:
      'Bridge specialist work, coordinate interfaces, and help the team see how technical and human decisions affect one another.',
    accent: '#7751a8',
    tint: '#ede5f5',
    image: {
      a: 'modes/systems-integrator-a.webp',
      b: 'modes/systems-integrator-b.webp',
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
  const highest = sorted[0]?.score ?? 0;
  const lowest = sorted.at(-1)?.score ?? 0;
  const mean =
    sorted.reduce((sum, item) => sum + item.score, 0) /
    Math.max(sorted.length, 1);

  // A genuinely even profile receives the seventh, balanced mode. The
  // threshold avoids labelling a uniformly low-response profile as integrated.
  if (highest - lowest <= 12 && mean >= 50) return 'integrator';
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
