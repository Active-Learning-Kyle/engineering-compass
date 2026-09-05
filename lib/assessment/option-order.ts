type OptionWithId = { id: string };

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function nextRandom(state: number) {
  let value = state + 0x6d2b79f5;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return {
    state: value >>> 0,
    value: ((value ^ (value >>> 14)) >>> 0) / 4294967296,
  };
}

/**
 * Shuffles choices predictably for one assessment attempt. A pinned choice,
 * such as “Other / not sure yet”, remains at the end.
 */
export function stableOptionOrder<T extends OptionWithId>(
  options: readonly T[],
  questionId: string,
  attemptSeed: number,
  pinnedId?: string,
) {
  const movable = options.filter((option) => option.id !== pinnedId);
  const pinned = pinnedId
    ? options.find((option) => option.id === pinnedId)
    : undefined;
  let state = hashSeed(`${attemptSeed}:${questionId}`);
  for (let index = movable.length - 1; index > 0; index--) {
    const result = nextRandom(state);
    state = result.state;
    const swapWith = Math.floor(result.value * (index + 1));
    [movable[index], movable[swapWith]] = [movable[swapWith], movable[index]];
  }
  return pinned ? [...movable, pinned] : movable;
}

export function createAttemptSeed(random = Math.random) {
  return Math.floor(random() * 0x100000000) >>> 0;
}
