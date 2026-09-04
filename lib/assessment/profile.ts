import type { AssessmentAnswers, CompetencyKey } from './types';
import type { CompetencyResult, ToolkitResult } from './scoring';

export type EngineeringModeKey = CompetencyKey;
export type CharacterVariant = 'a' | 'b';
export function initialCharacterVariant(
  key: EngineeringModeKey,
): CharacterVariant {
  return ['problem', 'collaboration', 'design'].includes(key) ? 'a' : 'b';
}
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
    name: 'role.problem.name',
    shortDescription: 'role.problem.shortDescription',
    contribution: 'role.problem.contribution',
    accent: '#163f27',
    tint: '#edf4ed',
    image: {
      a: 'modes/problem-framer-a.webp',
      b: 'modes/problem-framer-b.webp',
    },
  },
  planning: {
    name: 'role.planning.name',
    shortDescription: 'role.planning.shortDescription',
    contribution: 'role.planning.contribution',
    accent: '#163f27',
    tint: '#edf4ed',
    image: {
      a: 'modes/project-navigator-a.webp',
      b: 'modes/project-navigator-b.webp',
    },
  },
  collaboration: {
    name: 'role.collaboration.name',
    shortDescription: 'role.collaboration.shortDescription',
    contribution: 'role.collaboration.contribution',
    accent: '#163f27',
    tint: '#edf4ed',
    image: {
      a: 'modes/team-connector-a.webp',
      b: 'modes/team-connector-b.webp',
    },
  },
  handsOn: {
    name: 'role.handsOn.name',
    shortDescription: 'role.handsOn.shortDescription',
    contribution: 'role.handsOn.contribution',
    accent: '#163f27',
    tint: '#edf4ed',
    image: {
      a: 'modes/practical-builder-a.webp',
      b: 'modes/practical-builder-b.webp',
    },
  },
  design: {
    name: 'role.design.name',
    shortDescription: 'role.design.shortDescription',
    contribution: 'role.design.contribution',
    accent: '#163f27',
    tint: '#edf4ed',
    image: {
      a: 'modes/prototype-explorer-a.webp',
      b: 'modes/prototype-explorer-b.webp',
    },
  },
  pitch: {
    name: 'role.pitch.name',
    shortDescription: 'role.pitch.shortDescription',
    contribution: 'role.pitch.contribution',
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
    name: 'scope.exploring.name',
    number: 1,
    description: 'scope.exploring.description',
  },
  building: {
    name: 'scope.building.name',
    number: 2,
    description: 'scope.building.description',
  },
  practising: {
    name: 'scope.practising.name',
    number: 3,
    description: 'scope.practising.description',
  },
  integrating: {
    name: 'scope.integrating.name',
    number: 4,
    description: 'scope.integrating.description',
  },
};

export function deriveEngineeringMode(
  competencyScores: CompetencyResult[],
): EngineeringModeKey {
  const sorted = [...competencyScores].sort((a, b) => b.score - a.score);
  return sorted[0]?.key ?? 'problem';
}

/** Descriptive display grouping only. No new score or unvalidated near-tie cut-off. */
export function deriveLeadingModes(scores: CompetencyResult[]) {
  const ranked = [...scores].sort((a, b) => b.score - a.score);
  const top = ranked[0]?.score;
  const leading = ranked.filter((item) => item.score === top);
  const balanced = leading.length === scores.length;
  const secondScore = ranked.find((item) => item.score !== top)?.score;
  const supporting =
    leading.length === 1
      ? ranked.filter((item) => item.score === secondScore)
      : [];
  return { leading, supporting, balanced };
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
