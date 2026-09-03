# Engineering Compass

Engineering Compass is a formative self-assessment for ENGG1101 learners. It helps students reflect on six engineering competencies and eight hands-on toolkit areas, then turns their responses into an actionable personal profile.

**Live site:** <https://active-learning-kyle.github.io/engineering-compass/>

The public site is hosted directly from this repository with GitHub Pages.

## MVP flow

- Optional engineering-field context (four primary fields, Other, or Skip)
- 30 questions: five for each competency
- Five-level behaviour-based response scale
- Reflection nudge after unusually fast response patterns
- Integer scores on a 0–100 scale
- Six-competency radar profile
- Eight-area technical toolkit profile
- Downloadable plain-text summary

Engineering-field selection is never included in scoring. Answers remain in the current browser session and are not submitted to a server.

## Competencies

1. Problem Identification
2. Proposal with Plan
3. Interdisciplinary Collaboration
4. Hands-on Skills
5. Design Thinking & Prototyping
6. Pitch for Engineering Solutions

## Scoring

Each item is answered from 1 (`Not yet`) to 5 (`Consistent`). For each competency, the mean of its five questions is converted to an integer confidence score:

`score = round(((mean - 1) / 4) × 100)`

Technical toolkit scores use the same conversion for the relevant hands-on item. The output is a formative reflection, not a grade, diagnosis, or selection test.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The project exports a static site to `dist/client` for deployment.

Pushes to `main` are automatically built and deployed with GitHub Pages.

