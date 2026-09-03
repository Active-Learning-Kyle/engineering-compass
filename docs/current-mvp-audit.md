# Engineering Compass — Current MVP Audit

Status: review draft  
Scope: the deployed MVP before the Standard assessment refactor

## Executive finding

The current site is a functional technical prototype: it has a complete browser-only flow, 30 answerable questions, scoring, a radar profile, toolkit bars, responsive interaction, a speed nudge, and automated GitHub Pages deployment. It is not yet the agreed Standard assessment model.

The central issue is structural rather than cosmetic. The current implementation treats the assessment as six equal blocks of five self-description questions. That gives Hands-on Skills only five prompts, derives eight toolkit scores from those five answers, exposes the competency being measured, and leaves no room inside the 30 questions for project calibration, interests, chosen growth areas, or cross-cutting evidence checks.

## Requirement-by-requirement audit

| Area                         | Canonical direction                                                            | Current MVP evidence                                                                                            | Status                                 | Required change                                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Product scope                | Standalone and course-independent                                              | Landing page says `ENGG1101 · FORMATIVE REFLECTION`; metadata and README also identify ENGG1101                 | Change required                        | Remove course-specific identity from the product surface; mention ENGG1101/2202 only as possible contexts     |
| Competency model             | Keep exactly the six official competencies                                     | Six competency keys and six radar axes are present                                                              | Keep                                   | Preserve names; do not add an overall score or seventh competency                                             |
| 30-question structure        | Mixed blueprint with more technical coverage                                   | `questions` contains five consecutive items for each of six competencies                                        | Major refactor                         | Replace the equal 6 × 5 structure with the reviewed allocation in `assessment-blueprint.md`                   |
| Non-hands-on coverage        | Small representative set of observable behaviours                              | Each non-hands-on competency has five items                                                                     | Refine                                 | Use three representative behavioural items per competency                                                     |
| Hands-on coverage            | Detailed Technical Toolkit evidence                                            | Hands-on has five items                                                                                         | Major refactor                         | Use nine distinct technical items, one for each agreed toolkit area                                           |
| Toolkit taxonomy             | Nine agreed areas, including Physical Computing, AI/CV, and System Integration | Current eight areas include Embedded Systems and Data & Analysis; AI/CV, IoT, and System Integration are absent | Major refactor                         | Restore the nine-area taxonomy                                                                                |
| Toolkit independence         | Meaningful evidence per displayed area                                         | Q17 feeds CAD and Fabrication; Q19 feeds Programming and Embedded Systems; Q20 feeds Sensors and Data           | Major refactor                         | Give each displayed toolkit area its own direct response                                                      |
| Response logic               | Agreement for competencies; experience/independence for technical skills       | One `Not yet` to `Consistent` scale is used for every item                                                      | Change required                        | Implement two distinct scales with a shared lightweight five-position UI                                      |
| Measurement visibility       | Hide competency labels and mix behavioural items                               | Sidebar and question heading display the current competency; items appear in six blocks                         | Major refactor                         | Mix behavioural items and show neutral progress only; label only the Technical Toolkit section                |
| Project calibration          | Capture project volume and responsibility/independence                         | No factual calibration items                                                                                    | Missing                                | Add two contextual calibration items; do not turn them into a seventh score                                   |
| Interests                    | Capture what engineering work the learner is drawn toward                      | No interest item                                                                                                | Missing                                | Add one multi-select engineering-interest item                                                                |
| Desired growth               | Capture what the learner explicitly wants to improve                           | Growth is inferred only from the lowest competency score                                                        | Missing                                | Add one multi-select growth-priority item and use it in interpretation                                        |
| Cross-cutting evidence check | Include at least one evidence-based engineering decision/check                 | No scenario or cross-check item                                                                                 | Missing                                | Add two short engineering-judgment scenarios, used as interpretation/calibration rather than a new competency |
| Field selection              | Four main fields plus Other and Skip; context only                             | Present, optional, and not used by scoring                                                                      | Keep                                   | Preserve unchanged                                                                                            |
| Results                      | Six-competency radar, toolkit, strengths, and growth areas                     | All four concepts are present                                                                                   | Refine                                 | Remove fixed “compass points to” typing; base growth guidance on chosen priorities plus profile evidence      |
| Overall score/type           | No overall engineering score or fixed type                                     | No overall score, but the highest axis is used as a directional type statement                                  | Change required                        | Retain separate profiles; soften interpretation to current evidence and priorities                            |
| Visual direction             | HKU-inspired green/white, academic, modern, engineering-focused                | Current primary system is burgundy/ivory                                                                        | Change required after content approval | Replace palette without adding Green Technology cues or character illustrations                               |
| Privacy and delivery         | Browser-only standalone project on GitHub Pages                                | Implemented and deployed                                                                                        | Keep                                   | Preserve the current delivery model                                                                           |
| Speed reflection             | Gently nudge unusually fast response patterns                                  | Implemented after repeated sub-1.8-second responses                                                             | Keep                                   | Recalibrate only if pilot evidence suggests a change                                                          |
| Architecture                 | Separate definitions and support a future Pro version                          | Product definitions, questions, scales, scoring, and interpretation are concentrated in `app/page.tsx`          | Major refactor after approval          | Split domain data and logic before implementing the revised bank                                              |

## What is already strong enough to preserve

- The four-field optional background step, Other, and Skip.
- The field choice being excluded from scoring.
- Browser-only responses and no required account.
- The one-question-at-a-time mobile interaction.
- Back/next navigation and completion progress.
- The response-speed reflection nudge.
- The six-axis radar and technical-profile presentation concepts.
- Downloadable summary, subject to revised result interpretation.
- Static GitHub Pages deployment from the standalone repository.

## Main implementation risks

1. **False precision:** one answer currently becomes two separate technical scores in three places.
2. **Construct cueing:** visible competency labels can encourage learners to answer toward the desirable construct.
3. **Experience bias:** confidence scores are interpreted without knowing whether the learner has completed zero projects or several independent projects.
4. **Growth misinterpretation:** the lowest measured score is not necessarily the area the learner wants or needs to develop next.
5. **Future Pro migration:** keeping questions and scoring inside one page will make cross-checks, scenarios, versions, and longitudinal comparison difficult to add safely.

## Recommended approval gate

Do not rewrite the production assessment until the following are approved:

1. the 30-position allocation;
2. the two response scales;
3. the proposed question wording and options;
4. which contextual items affect interpretation but not competency scoring;
5. the nine Technical Toolkit labels.
