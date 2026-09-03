# Engineering Compass

Engineering Compass is a standalone formative self-assessment for engineering learners. It helps students reflect on six engineering competencies, nine technical toolkit areas, and the directions they want to develop next.

**Live site:** <https://active-learning-kyle.github.io/engineering-compass/>

The public site is hosted directly from this repository with GitHub Pages.

## MVP flow

- Optional engineering-field context (four primary fields, Other, or Skip)
- 15 mixed behavioural statements across five non-hands-on competencies
- Nine independent Technical Toolkit items
- Project calibration, interests, selected growth areas, and two engineering-judgment scenarios
- Separate five-level behaviour and technical-independence scales
- Reflection nudge after unusually fast response patterns
- Integer scores on a 0–100 scale
- Six-competency radar profile
- Nine-area technical toolkit profile
- Downloadable plain-text summary

Engineering-field selection is never included in scoring. Answers remain in the current browser session and are not submitted to a server.

## Standard V1.2 pedagogical alignment

The six Engineering Compass competencies are the observable engineering behaviours being assessed and reported. Relevant questions also carry hidden alignment metadata for the six [HKU Active Learning Essentials](https://activelearning.engg.hku.hk/#about). These Essentials are a higher-level pedagogical mapping only: they create no additional scores, never change the radar or toolkit calculations, and are not shown as a second learner-facing framework.

## Competencies

1. Problem Identification
2. Proposal with Plan
3. Interdisciplinary Collaboration
4. Hands-on Skills
5. Design Thinking & Prototyping
6. Pitch for Engineering Solutions

## Scoring

Each non-hands-on competency uses the mean of three mixed behavioural items. Hands-on Skills uses the simple mean of all nine Technical Toolkit items and is interpreted as current technical breadth, experience, and independence. Means are converted to an integer profile value:

`score = round(((mean - 1) / 4) × 100)`

Every toolkit area has its own direct item. Project context, interests, growth choices, and judgment scenarios never change radar scores. The output is a formative reflection, not a grade, objective ability score, engineering type, or cross-department ranking.

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

