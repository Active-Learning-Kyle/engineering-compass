export type AssessmentVersion = 'standard-v1.1' | 'pro-future';

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
  | 'judgment';

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
  max: number;
};

export type AssessmentItem =
  | BehaviourItem
  | TechnicalItem
  | OrderedItem
  | MultiSelectItem;

export type AssessmentAnswer = number | string[];
export type AssessmentAnswers = Record<string, AssessmentAnswer>;

