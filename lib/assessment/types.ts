export type AssessmentVersion =
  | 'standard-v1.2'
  | 'standard-v1.3'
  | 'standard-v1.4'
  | 'standard-v1.5'
  | 'standard-v1.6'
  | 'pro-v0.1'
  | 'pro-v0.2'
  | 'pro-future';

export type ActiveLearningEssentialTag =
  | 'designAndInnovation'
  | 'problemSolving'
  | 'interdisciplinaryThinking'
  | 'valueAndAttitude'
  | 'communication'
  | 'lifelongLearning';

export type CompetencyKey =
  | 'problem'
  | 'planning'
  | 'collaboration'
  | 'handsOn'
  | 'design'
  | 'pitch';

export type ToolkitKey =
  | 'mechanical'
  | 'cad'
  | 'fabrication'
  | 'electronics'
  | 'programming'
  | 'physicalComputing'
  | 'sensorsIot'
  | 'aiVision'
  | 'integration';

export type PhaseKey =
  | 'behaviour'
  | 'technical'
  | 'context'
  | 'priorities'
  | 'judgment'
  | 'proScenarios'
  | 'proEvidence';

export type OrderedOption = {
  id: string;
  label: string;
  value: number;
};

type BaseItem = {
  id: string;
  number: number;
  phase: PhaseKey;
  prompt: string;
  helper?: string;
  /** Hidden pedagogical alignment metadata. Never used in learner scoring. */
  activeLearningEssentialTags?: ActiveLearningEssentialTag[];
};

export type BehaviourItem = BaseItem & {
  kind: 'behaviour';
  competency: Exclude<CompetencyKey, 'handsOn'>;
};

export type TechnicalItem = BaseItem & {
  kind: 'technical';
  toolkit: ToolkitKey;
};

export type OrderedItem = BaseItem & {
  kind: 'context' | 'judgment';
  options: OrderedOption[];
};

export type MultiSelectItem = BaseItem & {
  kind: 'interest' | 'growth';
  options: Array<{ id: string; label: string }>;
  min: number;
};

export type AssessmentItem =
  | BehaviourItem
  | TechnicalItem
  | OrderedItem
  | MultiSelectItem
  | ProCheckItem;

export type AssessmentEdition = 'standard' | 'pro';
export type ProCheckItem = BaseItem & {
  kind: 'proCheck';
  area: CompetencyKey | ToolkitKey;
  options: Array<OrderedOption & { feedback: string }>;
};

export type AssessmentAnswer = number | string[];
export type AssessmentAnswers = Record<string, AssessmentAnswer>;
