import type { CompetencyKey } from './types';

type EngineeringModeKey = CompetencyKey;

export type HiddenRoleId =
  | 'evidence-experimenter'
  | 'collaborative-coordinator'
  | 'iterative-maker'
  | 'insight-translator'
  | 'community-advocate'
  | 'delivery-architect'
  | 'systems-synthesist'
  | 'cross-disciplinary-catalyst'
  | 'versatile-integrator'
  | 'adaptive-integrator';

export type HiddenRoleDefinition = {
  id: HiddenRoleId;
  code: string;
  name: string;
  description: string;
  image: string | null;
  accent: string;
  tint: string;
};

export type RoleDiscovery = {
  id: HiddenRoleId;
  keys: EngineeringModeKey[];
};

export const roleCollectionStorageKey =
  'engineering-compass-role-collection-v1';

export const hiddenRoles: HiddenRoleDefinition[] = [
  {
    id: 'evidence-experimenter',
    code: 'ECEE',
    name: 'result.blend.evidenceExperimenter.name',
    description: 'result.blend.evidenceExperimenter.description',
    image: 'modes/evidence-experimenter.png',
    accent: '#356f73',
    tint: '#e7f1ef',
  },
  {
    id: 'collaborative-coordinator',
    code: 'ECCC',
    name: 'result.blend.collaborativeCoordinator.name',
    description: 'result.blend.collaborativeCoordinator.description',
    image: 'modes/collaborative-coordinator.png',
    accent: '#665a31',
    tint: '#f4efd9',
  },
  {
    id: 'iterative-maker',
    code: 'ECIM',
    name: 'result.blend.iterativeMaker.name',
    description: 'result.blend.iterativeMaker.description',
    image: 'modes/iterative-maker.png',
    accent: '#8b6a35',
    tint: '#f4eee2',
  },
  {
    id: 'insight-translator',
    code: 'ECIT',
    name: 'result.blend.insightTranslator.name',
    description: 'result.blend.insightTranslator.description',
    image: 'modes/insight-translator.png',
    accent: '#5a63a8',
    tint: '#ececf7',
  },
  {
    id: 'community-advocate',
    code: 'ECCA',
    name: 'result.blend.communityAdvocate.name',
    description: 'result.blend.communityAdvocate.description',
    image: 'modes/community-advocate.png',
    accent: '#8d6c72',
    tint: '#f6eedf',
  },
  {
    id: 'delivery-architect',
    code: 'ECDA',
    name: 'result.blend.deliveryArchitect.name',
    description: 'result.blend.deliveryArchitect.description',
    image: 'modes/delivery-architect.png',
    accent: '#5e4a3e',
    tint: '#f2ece7',
  },
  {
    id: 'systems-synthesist',
    code: 'ECSS',
    name: 'result.blend.systemsSynthesist.name',
    description: 'result.blend.systemsSynthesist.description',
    image: 'modes/systems-synthesist.png',
    accent: '#326c63',
    tint: '#e5f1ed',
  },
  {
    id: 'cross-disciplinary-catalyst',
    code: 'ECXC',
    name: 'result.blend.crossDisciplinaryCatalyst.name',
    description: 'result.blend.crossDisciplinaryCatalyst.description',
    image: 'modes/cross-disciplinary-catalyst.png',
    accent: '#5c4d8b',
    tint: '#eeebf6',
  },
  {
    id: 'versatile-integrator',
    code: 'ECVI',
    name: 'result.blend.versatileIntegrator.name',
    description: 'result.blend.versatileIntegrator.description',
    image: 'modes/versatile-integrator.png',
    accent: '#8a552f',
    tint: '#f6ebe2',
  },
  {
    id: 'adaptive-integrator',
    code: 'ECAI',
    name: 'result.blend.adaptiveIntegrator.name',
    description: 'result.blend.adaptiveIntegrator.description',
    image: 'modes/adaptive-integrator.png',
    accent: '#276347',
    tint: '#e7f1ea',
  },
];

const hiddenRoleById = Object.fromEntries(
  hiddenRoles.map((role) => [role.id, role]),
) as Record<HiddenRoleId, HiddenRoleDefinition>;

const pairRoleIds: Record<string, HiddenRoleId> = {
  'design+problem': 'evidence-experimenter',
  'collaboration+planning': 'collaborative-coordinator',
  'design+handsOn': 'iterative-maker',
  'pitch+problem': 'insight-translator',
  'collaboration+pitch': 'community-advocate',
  'handsOn+planning': 'delivery-architect',
};

function combinationKey(keys: EngineeringModeKey[]) {
  return [...keys].sort().join('+');
}

/**
 * The first collection contains six named two-mode synergies plus one discovery
 * role for each exact three-, four-, five- and six-way tie. Unlisted two-way
 * ties remain an integrated result until their own character is art-directed.
 */
export function hiddenRoleForKeys(
  keys: EngineeringModeKey[],
): HiddenRoleDefinition | null {
  const pairId = keys.length === 2 ? pairRoleIds[combinationKey(keys)] : null;
  if (pairId) return hiddenRoleById[pairId];
  if (keys.length === 3) return hiddenRoleById['systems-synthesist'];
  if (keys.length === 4) return hiddenRoleById['cross-disciplinary-catalyst'];
  if (keys.length === 5) return hiddenRoleById['versatile-integrator'];
  if (keys.length === 6) return hiddenRoleById['adaptive-integrator'];
  return null;
}

export function readRoleCollection(raw: string | null): RoleDiscovery[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const validIds = new Set(hiddenRoles.map((role) => role.id));
    const validKeys = new Set<EngineeringModeKey>([
      'problem',
      'planning',
      'collaboration',
      'handsOn',
      'design',
      'pitch',
    ]);
    const byId = new Map<HiddenRoleId, RoleDiscovery>();
    for (const item of parsed) {
      const id = typeof item === 'string' ? item : item?.id;
      if (!validIds.has(id)) continue;
      const keys = Array.isArray(item?.keys)
        ? [
            ...new Set(
              item.keys.filter((key: unknown) =>
                validKeys.has(key as EngineeringModeKey),
              ),
            ),
          ]
        : [];
      byId.set(id, { id, keys } as RoleDiscovery);
    }
    return [...byId.values()];
  } catch {
    return [];
  }
}

export function addRoleToCollection(
  current: RoleDiscovery[],
  role: HiddenRoleDefinition | null,
  keys: EngineeringModeKey[] = [],
) {
  if (!role || current.some((item) => item.id === role.id)) return current;
  return [...current, { id: role.id, keys: [...new Set(keys)] }];
}
