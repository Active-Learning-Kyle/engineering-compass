export function exclusiveSelectionId(kind: 'interest' | 'growth') {
  return kind === 'interest' ? 'other-interest' : 'not-sure';
}

export function normalizeSelections(selected: string[], exclusiveId: string) {
  return selected.includes(exclusiveId)
    ? [exclusiveId]
    : [...new Set(selected)];
}

export function toggleSelection(
  selected: string[],
  id: string,
  exclusiveId: string,
) {
  const current = normalizeSelections(selected, exclusiveId);
  if (current.includes(id)) return current.filter((item) => item !== id);
  if (id === exclusiveId) return [id];
  if (current.includes(exclusiveId)) return current;
  return [...current, id];
}
