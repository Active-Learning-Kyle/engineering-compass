export const studyYears = [
  {
    id: 'year-1',
    label: 'year.year-1.label',
    note: 'year.year-1.note',
  },
  {
    id: 'year-2',
    label: 'year.year-2.label',
    note: 'year.year-2.note',
  },
  {
    id: 'year-3',
    label: 'year.year-3.label',
    note: 'year.year-3.note',
  },
  {
    id: 'year-4',
    label: 'year.year-4.label',
    note: 'year.year-4.note',
  },
] as const;

export function getStudyYearLabel(id: string | null) {
  return studyYears.find((year) => year.id === id)?.label ?? null;
}
