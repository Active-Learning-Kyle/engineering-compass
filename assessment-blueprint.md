# Engineering Compass — Standard Assessment Blueprint

Version: Standard V1.2
Status: approved and implemented

## Purpose

Engineering Compass is a course-independent formative engineering self-assessment. It creates two related profiles:

1. a six-competency engineering profile;
2. a nine-area Technical Toolkit profile.

It also captures project context, interests, and self-selected growth priorities. It is not a grade, selection test, personality type, or professional certification.

## Fixed competency framework

The product retains exactly these six competencies:

1. Problem Identification
2. Proposal with Plan
3. Interdisciplinary Collaboration
4. Hands-on Skills
5. Design Thinking and Prototyping
6. Pitch for Engineering Solutions

No overall engineering score and no seventh competency will be created.

## Approved allocation of all 30 questions

| Question positions | Component                                                           |  Count | Response logic                        | Scoring role                                                                       |
| ------------------ | ------------------------------------------------------------------- | -----: | ------------------------------------- | ---------------------------------------------------------------------------------- |
| 1–15               | Mixed behavioural statements for the five non-hands-on competencies |     15 | Five-point self-description/agreement | Three items per competency form five radar axes                                    |
| 16–24              | Technical Toolkit                                                   |      9 | Five-point experience/independence    | One direct score per toolkit area; their mean forms the Hands-on Skills radar axis |
| 25–26              | Project-experience calibration                                      |      2 | Factual ordered choices               | Context and result-confidence interpretation only                                  |
| 27                 | Engineering interests                                               |      1 | Optional multi-select, up to three    | Personalisation only; not scored                                                   |
| 28                 | Desired growth areas                                                |      1 | Select 1–3, or Not sure yet           | Drives growth guidance; not scored                                                 |
| 29–30              | Cross-cutting engineering-judgment checks                           |      2 | Ordered scenario choices              | Evidence-orientation/context indicator only; no new radar axis                     |
|                    | **Total**                                                           | **30** |                                       |                                                                                    |

## Behavioural-item allocation

Each non-hands-on competency has three items tied to observable behaviours.

| Competency                      | Observable behaviours                                                                           | Item IDs      |
| ------------------------------- | ----------------------------------------------------------------------------------------------- | ------------- |
| Problem Identification          | investigate before solving; validate with evidence; frame causes, users, and constraints        | B01, B07, B14 |
| Proposal with Plan              | compare alternatives; define criteria and actions; anticipate feasibility, risk, and trade-offs | B04, B09, B13 |
| Interdisciplinary Collaboration | own responsibilities; integrate different perspectives; manage disagreement and dependencies    | B02, B06, B12 |
| Design Thinking and Prototyping | prototype early; test purposeful questions; diagnose and iterate from evidence                  | B05, B08, B11 |
| Pitch for Engineering Solutions | explain problem/solution/value; support claims; adapt detail while stating limitations          | B03, B10, B15 |

The learner sees the B items in the sequence shown above, but does not see the competency mapping. No two consecutive B items measure the same competency.

## HKU Active Learning alignment

Engineering Compass uses two related but non-competing layers:

- **Engineering Compass competencies** are the six learner-facing domains of observable engineering behaviour being assessed and reported.
- **HKU Active Learning Essentials** are higher-level pedagogical alignment metadata attached to relevant items.

The Essentials metadata is hidden from learners, creates no additional score, does not change radar or toolkit calculations, and is not a second visible assessment framework. It maps selected items to the six Essentials described by [HKU Engineering Active Learning](https://activelearning.engg.hku.hk/#about): Design & Innovation, Problem Solving, Interdisciplinary Thinking, Value & Attitude, Communication, and Lifelong Learning.

| Item | Active Learning Essential tags                  |
| ---- | ----------------------------------------------- |
| B01  | Problem Solving                                 |
| B02  | Value & Attitude                                |
| B03  | Communication                                   |
| B04  | Problem Solving; Design & Innovation            |
| B05  | Design & Innovation; Lifelong Learning          |
| B06  | Interdisciplinary Thinking                      |
| B07  | Problem Solving; Value & Attitude               |
| B08  | Design & Innovation; Problem Solving            |
| B09  | Problem Solving                                 |
| B10  | Communication; Value & Attitude                 |
| B11  | Design & Innovation; Lifelong Learning          |
| B12  | Interdisciplinary Thinking; Value & Attitude    |
| B13  | Problem Solving; Value & Attitude               |
| B14  | Problem Solving                                 |
| B15  | Communication; Value & Attitude                 |
| T05  | Lifelong Learning                               |
| T08  | Design & Innovation; Lifelong Learning          |
| T09  | Design & Innovation; Interdisciplinary Thinking |
| G01  | Lifelong Learning                               |
| J01  | Problem Solving; Lifelong Learning              |
| J02  | Value & Attitude; Design & Innovation           |

Items without a tag are intentionally left unmapped rather than forcing a weak association.

## Technical Toolkit allocation

| Toolkit area                     | Item ID | Evidence sought                                                           |
| -------------------------------- | ------- | ------------------------------------------------------------------------- |
| Mechanical Assembly & Mechanisms | T01     | safe assembly, adjustment, alignment, and troubleshooting                 |
| CAD & 3D Modelling               | T02     | turning dimensions or sketches into an editable, manufacturable model     |
| Digital Fabrication              | T03     | preparing and producing parts with appropriate fabrication settings       |
| Electronics                      | T04     | wiring, measuring, soldering, and troubleshooting basic circuits          |
| Programming                      | T05     | reading, modifying, writing, and debugging code                           |
| Physical Computing               | T06     | using Raspberry Pi, Arduino, ESP32, or similar platforms with I/O         |
| Sensors, Data & IoT              | T07     | connecting/calibrating sensors and collecting or transmitting useful data |
| AI / Computer Vision             | T08     | preparing inputs, applying a model or CV pipeline, and evaluating output  |
| System Integration & Automation  | T09     | connecting subsystems into a reliable end-to-end behaviour                |

Each displayed toolkit result comes from its own direct item. Related skills may still be discussed together in result text, but one response must not be duplicated into two independent bars.

## Response scales

### Scale A — behavioural self-description

Prompt: **How well does this describe how you usually work?**

| Value | Meaning              |
| ----: | -------------------- |
|     1 | Not like me yet      |
|     2 | Occasionally like me |
|     3 | Sometimes like me    |
|     4 | Usually like me      |
|     5 | Consistently like me |

The interface should show five simple positions. A compact endpoint legend is sufficient; do not repeat long explanations beneath every number.

### Scale B — technical experience and independence

Prompt: **What best describes your current experience?**

| Value | Meaning                                                  |
| ----: | -------------------------------------------------------- |
|     1 | No direct experience yet                                 |
|     2 | Tried with step-by-step guidance                         |
|     3 | Can complete familiar tasks with some help               |
|     4 | Can work independently and troubleshoot common issues    |
|     5 | Can adapt, integrate, or guide others in unfamiliar work |

The UI may again show five positions, with concise endpoints and an expandable or section-level explanation.

## Scoring and interpretation rules

### Five non-hands-on competency axes

For each competency, calculate the mean of its three B items and convert it to an integer 0–100 profile value:

`round(((mean - 1) / 4) × 100)`

### Hands-on Skills axis

Calculate the mean of T01–T09 using the technical experience scale, then use the same 0–100 conversion. Label the output as a current experience/independence profile, not an objective skills test.

### Technical Toolkit

Display T01–T09 separately. Because each area has one direct self-report item in Standard, show integer values but avoid claims of diagnostic precision. A future Pro version may add multiple evidence and scenario items per area.

### Context and checks

- C01 and C02 do not add points. They qualify the interpretation of self-reported confidence.
- I01 does not add points. It describes areas the learner wants to explore.
- G01 does not add points. Its selected priorities should appear before any automatically inferred low-score suggestion.
- J01 and J02 do not create a seventh score and do not silently change radar scores. They provide a small “engineering evidence practice” interpretation and can flag an inconsistency for reflective wording.
- Engineering-field selection remains background context only and never affects any score.

## Results-page contract

The Standard results page should contain:

- six-competency radar profile;
- nine-area Technical Toolkit profile;
- two or three current strengths supported by profile evidence;
- learner-selected growth priorities, paired with relevant profile evidence and one practical next step;
- optional contextual note about project experience;
- a light evidence-practice reflection from J01/J02;
- explicit statement that results are formative self-report, not a grade or fixed engineering type.

Do not display:

- an overall engineering score;
- an engineer level;
- a fixed “Your compass points to X” type based only on the highest axis;
- a claim that the learner’s lowest score is automatically their required growth area.

## Learner-facing sequence

1. Welcome: course-independent Engineering Compass identity.
2. Optional engineering field: four main cards, Other, or Skip.
3. How You Work: 15 mixed behavioural items with neutral progress only.
4. Technical Toolkit: nine clearly labelled technical items using the independence scale.
5. Project Context: two factual items.
6. Interests and Growth: two multi-select items.
7. Engineering Judgment: two short scenarios.
8. Results.

Competency names may appear on the welcome and results pages, but not while B01–B15 are being answered.

## Response-quality handling

Keep the current gentle speed nudge. The nudge should ask the learner to picture a real project example and reconsider if needed. It must not block completion or alter scores automatically.

For Standard V1.2, response-quality signals should be transparent and limited to:

- repeated unusually fast answers;
- unanswered required items;
- contextual mismatch worth wording carefully, such as high independence with no completed project experience.

Do not present these signals as dishonesty detection.

## Future Pro compatibility

Pro is not part of this implementation round. The data model should nevertheless support an `assessmentVersion`, item type, scale type, scoring mappings, optional cross-check relationships, and multiple items per toolkit area.

The future Pro assessment is expected to be approximately 50–60 questions and to add scenario-based decisions, cross-check items, evidence of engineering work, failure diagnosis, teamwork situations, project responsibility, safety/limitations, communication transfer, and possible pre/post comparison. It should not be implemented as a duplicated or merely lengthened Standard bank.

