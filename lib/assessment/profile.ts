import type { AssessmentAnswers, CompetencyKey } from './types';
import type { CompetencyResult, ToolkitResult } from './scoring';
import { hiddenRoleForKeys } from './role-collection';

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
    code: string;
    keywords: string;
    accent: string;
    tint: string;
    image: Record<CharacterVariant, string>;
  }
> = {
  problem: {
    name: 'role.problem.name',
    shortDescription: 'role.problem.shortDescription',
    contribution: 'role.problem.contribution',
    code: 'ECPF',
    keywords: 'role.problem.keywords',
    accent: '#3f6fb5',
    tint: '#eaf0f9',
    image: {
      a: 'modes/problem-framer.png',
      b: 'modes/problem-framer.png',
    },
  },
  planning: {
    name: 'role.planning.name',
    shortDescription: 'role.planning.shortDescription',
    contribution: 'role.planning.contribution',
    code: 'ECPN',
    keywords: 'role.planning.keywords',
    accent: '#282b30',
    tint: '#ececee',
    image: {
      a: 'modes/project-navigator.png',
      b: 'modes/project-navigator.png',
    },
  },
  collaboration: {
    name: 'role.collaboration.name',
    shortDescription: 'role.collaboration.shortDescription',
    contribution: 'role.collaboration.contribution',
    code: 'ECTC',
    keywords: 'role.collaboration.keywords',
    accent: '#e3b341',
    tint: '#fbf4dc',
    image: {
      a: 'modes/team-connector.png',
      b: 'modes/team-connector.png',
    },
  },
  handsOn: {
    name: 'role.handsOn.name',
    shortDescription: 'role.handsOn.shortDescription',
    contribution: 'role.handsOn.contribution',
    code: 'ECPB',
    keywords: 'role.handsOn.keywords',
    accent: '#d97832',
    tint: '#faeee4',
    image: {
      a: 'modes/practical-builder.png',
      b: 'modes/practical-builder.png',
    },
  },
  design: {
    name: 'role.design.name',
    shortDescription: 'role.design.shortDescription',
    contribution: 'role.design.contribution',
    code: 'ECPE',
    keywords: 'role.design.keywords',
    accent: '#4f8f63',
    tint: '#e8f2eb',
    image: {
      a: 'modes/prototype-explorer.png',
      b: 'modes/prototype-explorer.png',
    },
  },
  pitch: {
    name: 'role.pitch.name',
    shortDescription: 'role.pitch.shortDescription',
    contribution: 'role.pitch.contribution',
    code: 'ECST',
    keywords: 'role.pitch.keywords',
    accent: '#7656a8',
    tint: '#f0ebf7',
    image: {
      a: 'modes/solution-storyteller.png',
      b: 'modes/solution-storyteller.png',
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

/** A display identity derived only from exact top-score ties. */
export function deriveRolePresentation(scores: CompetencyResult[]) {
  const modes = deriveLeadingModes(scores);
  const keys = modes.leading.map((item) => item.key);
  const code = keys.map((key) => engineeringModes[key].code).join(' · ');

  if (keys.length === 1) {
    const key = keys[0];
    const base = engineeringModes[key];
    return {
      kind: 'single' as const,
      roleId: `classic-${key}` as const,
      hidden: false as const,
      keys,
      code,
      name: base.name,
      description: base.shortDescription,
      image: null,
      accent: base.accent,
      tint: base.tint,
    };
  }

  const hiddenRole = hiddenRoleForKeys(keys);
  if (hiddenRole)
    return {
      kind: keys.length === 2 ? ('blend' as const) : ('integrated' as const),
      roleId: hiddenRole.id,
      hidden: true as const,
      keys,
      ...hiddenRole,
    };

  return {
    kind: 'integrated' as const,
    roleId: 'integrated-unlisted' as const,
    hidden: false as const,
    keys,
    code,
    name: 'result.blend.adaptiveIntegrator.name',
    description: 'result.blend.adaptiveIntegrator.description',
    image: null,
    accent: '#276347',
    tint: '#e7f1ea',
  };
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
