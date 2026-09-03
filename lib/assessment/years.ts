export const studyYears = [
  {
    id: 'year-1',
    label: 'Year 1',
    note: 'Beginning undergraduate engineering study',
  },
  {
    id: 'year-2',
    label: 'Year 2',
    note: 'Developing disciplinary and project experience',
  },
  {
    id: 'year-3',
    label: 'Year 3',
    note: 'Taking on deeper technical and team responsibilities',
  },
  {
    id: 'year-4',
    label: 'Year 4',
    note: 'Integrating experience through advanced project work',
  },
] as const;

export function getStudyYearLabel(id: string | null) {
  return studyYears.find((year) => year.id === id)?.label ?? null;
}
