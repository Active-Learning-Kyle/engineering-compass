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
    code: 'PFR',
    keywords: 'role.problem.keywords',
    accent: '#3f6fb5',
    tint: '#eaf0f9',
    image: {
      a: 'modes-v2/problem-framer-a.png',
      b: 'modes-v2/problem-framer-b.png',
    },
  },
  planning: {
    name: 'role.planning.name',
    shortDescription: 'role.planning.shortDescription',
    contribution: 'role.planning.contribution',
    code: 'NAV',
    keywords: 'role.planning.keywords',
    accent: '#282b30',
    tint: '#ececee',
    image: {
      a: 'modes-v2/project-navigator-a.png',
      b: 'modes-v2/project-navigator-b.png',
    },
  },
  collaboration: {
    name: 'role.collaboration.name',
    shortDescription: 'role.collaboration.shortDescription',
    contribution: 'role.collaboration.contribution',
    code: 'CON',
    keywords: 'role.collaboration.keywords',
    accent: '#e3b341',
    tint: '#fbf4dc',
    image: {
      a: 'modes-v2/team-connector-a.png',
      b: 'modes-v2/team-connector-b.png',
    },
  },
  handsOn: {
    name: 'role.handsOn.name',
    shortDescription: 'role.handsOn.shortDescription',
    contribution: 'role.handsOn.contribution',
    code: 'BLD',
    keywords: 'role.handsOn.keywords',
    accent: '#d97832',
    tint: '#faeee4',
    image: {
      a: 'modes-v2/practical-builder-a.png',
      b: 'modes-v2/practical-builder-b.png',
    },
  },
  design: {
    name: 'role.design.name',
    shortDescription: 'role.design.shortDescription',
    contribution: 'role.design.contribution',
    code: 'EXP',
    keywords: 'role.design.keywords',
    accent: '#4f8f63',
    tint: '#e8f2eb',
    image: {
      a: 'modes-v2/prototype-explorer-a.png',
      b: 'modes-v2/prototype-explorer-b.png',
    },
  },
  pitch: {
    name: 'role.pitch.name',
    shortDescription: 'role.pitch.shortDescription',
    contribution: 'role.pitch.contribution',
    code: 'STR',
    keywords: 'role.pitch.keywords',
    accent: '#7656a8',
    tint: '#f0ebf7',
    image: {
      a: 'modes-v2/solution-storyteller-a.png',
      b: 'modes-v2/solution-storyteller-b.png',
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

type BlendedRole = {
  name: string;
  description: string;
  image: string;
  accent: string;
  tint: string;
};

const blendedRoles: Record<string, BlendedRole> = {
  'design+problem': {
    name: 'result.blend.evidenceExperimenter.name',
    description: 'result.blend.evidenceExperimenter.description',
    image: 'modes-v2/evidence-experimenter.png',
    accent: '#356f73',
    tint: '#e7f1ef',
  },
  'collaboration+planning': {
    name: 'result.blend.collaborativeCoordinator.name',
    description: 'result.blend.collaborativeCoordinator.description',
    image: 'modes-v2/collaborative-coordinator.png',
    accent: '#665a31',
    tint: '#f4efd9',
  },
  'design+handsOn': {
    name: 'result.blend.iterativeMaker.name',
    description: 'result.blend.iterativeMaker.description',
    image: 'modes-v2/iterative-maker.png',
    accent: '#8b6a35',
    tint: '#f4eee2',
  },
  'pitch+problem': {
    name: 'result.blend.insightTranslator.name',
    description: 'result.blend.insightTranslator.description',
    image: 'modes-v2/insight-translator.png',
    accent: '#5a63a8',
    tint: '#ececf7',
  },
  'collaboration+pitch': {
    name: 'result.blend.communityAdvocate.name',
    description: 'result.blend.communityAdvocate.description',
    image: 'modes-v2/community-advocate.png',
    accent: '#8d6c72',
    tint: '#f6eedf',
  },
  'handsOn+planning': {
    name: 'result.blend.deliveryArchitect.name',
    description: 'result.blend.deliveryArchitect.description',
    image: 'modes-v2/delivery-architect.png',
    accent: '#5e4a3e',
    tint: '#f2ece7',
  },
};

function pairKey(keys: EngineeringModeKey[]) {
  return [...keys].sort().join('+');
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
      keys,
      code,
      name: base.name,
      description: base.shortDescription,
      image: null,
      accent: base.accent,
      tint: base.tint,
    };
  }

  if (keys.length === 2) {
    const blend = blendedRoles[pairKey(keys)];
    if (blend) return { kind: 'blend' as const, keys, code, ...blend };
  }

  if (modes.balanced) {
    return {
      kind: 'integrated' as const,
      keys,
      code,
      name: 'result.role.balanced',
      description: 'result.role.balancedNote',
      image: 'modes-v2/adaptive-integrator.png',
      accent: '#276347',
      tint: '#e7f1ea',
    };
  }

  return {
    kind: 'integrated' as const,
    keys,
    code,
    name: 'result.blend.adaptiveIntegrator.name',
    description: 'result.blend.adaptiveIntegrator.description',
    image: 'modes-v2/adaptive-integrator.png',
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
