# Pro 60-question pilot — v0.3

Implemented 4 September 2026 at the owner's request. This supersedes the earlier “future Pro / not in this round” scope note in the Standard blueprint. Question wording and interpretation are an initial draft for review, not a validated diagnostic instrument.

## Structure

| Questions | Content                                                                                 | Result use                                                                              |
| --------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1–24      | Standard v1.7: recent-project behaviour frequency and original toolkit ratings          | Existing core mappings and formulas                                                     |
| 25–36     | PS01–PS12: two contextual decisions per competency, each with two defensible trade-offs | Benefit/cost feedback for the selected priority; no numeric score                       |
| 37–54     | PE01–PE18: two concrete practice-evidence reflections per toolkit area                  | Qualitative experience summary, next practice and broad/specific experience cross-check |
| 55–60     | Original six closing items: C01, C02, I01, G01, J01, J02                                | Project context, interests, growth priorities and closing judgment reflections          |

Scenario option values identify choices, not merit or ability. Both options must be defensible within the stated constraint, with similar length and an explicit cost. Do not use careless/unsafe/incompetent distractors or a longer “do everything correctly” answer. Scenarios explore priorities, not stable personality traits. Evidence options retain four factual anchors: no experience, guided participation, explained contribution and independently checked work. This is self-reported evidence: no uploads or verification are implied.

Pro deliberately keeps the same core scoring as Standard while the new bank is being piloted. No additional question changes the radar, toolkit scores, role or experience scope. Beside each broad self-rating, show how many of the two task answers describe independently checked work (anchor 4); the detailed reflection also counts explained contributions (anchors 3–4). These are literal task counts, not a validated evidence-depth scale. A high broad rating (4–5) and a new/guided specific task produces an invitation to reflect, not an automatic penalty. Incomplete task pairs do not receive a depth summary. A score of 100 is the top self-rating anchor, not proof of expertise.

## Version selection and storage

The homepage selects Standard (30) or Pro (60), updates statistics and purpose-based copy, then asks optional year context. The current draft identifies `standard-v1.7` or `pro-v0.3` in `engineering-compass-progress-v1.7`. Resuming restores its edition. Old drafts in `engineering-compass-progress-v1.6` are preserved, with a visible notice, but cannot resume into the revised wording/choice meanings. No answer migration is attempted. Language preference uses its own key and never changes responses.

## Interpretation boundaries

- The five behavioural competencies still use three items each; Hands-on still derives from the nine toolkit ratings. The frequency wording is new, but numeric mappings are not.
- Current Experience Scope retains the old heuristic (projects 25%, responsibility 50%, toolkit mean 25%; boundaries 1.8 / 2.8 / 3.8). It is explicitly approximate; no rank fraction is displayed.
- Equal displayed leading scores show joint modes. All six equal scores show a balanced profile. A sole leader is accompanied by the next-highest mode(s), including their scores. We do not invent a 5- or 10-point “close” rule; any future near-tie interpretation needs pilot evidence.
- Exact ties at the second-highest strength score are all retained rather than truncated by array order. The portrait remains decorative and does not resolve a tie.
- The original Standard closing judgment pair is retained in both editions. It has not been converted to forced choice in this revision.

## Review priorities

- Start with 8–15 students across disciplines and experience levels for comprehension/usability interviews, not a validation claim.
- Ask students to explain both options before choosing, and why they chose. Flag any pair where one seems obviously more competent or the decision depends on missing context.
- Check for length cues, repeated option-position preferences, unrealistic constraints and cases where both actions could easily be done together. Do not interpret choices as validated performance.
- Check English/Traditional Chinese equivalence, especially whether translated options preserve the same benefit, constraint and cost.
- Ask whether frequency answers refer to actual recent work or an ideal self, and whether limited opportunities (rather than behaviour) drive low ratings.
- Review technical-task coverage and the independence anchors for each toolkit.
- Review completion time; 18–25 minutes is a provisional planning estimate.
- Revisit whether/how evidence should affect scoring only after evidence and explicit approval.

## Presentation updates

- Role portrait starting order: problem/collaboration/design use A (male) first; planning/handsOn/pitch use B (female) first. The second portrait crossfades on homepage hover/focus and continuously on results. Reduced-motion preferences retain the first portrait. Image export omits the second layer to avoid a blended portrait in the saved PNG.
- Growth actions are specific to each chosen area; strengths and growth are full-width stacked sections.
- Project counts explicitly say “completed projects”, with a separate responsibility label.
- A subtle sixteen-point compass rose sits behind a continuously driven underdamped spring needle. Each shuffled six-target cycle covers every role and avoids a repeated target at cycle boundaries. Reduced motion disables movement.
- Needle targets now change every 650–900 ms with a faster spring and stronger flutter. Toolkit contents are visible without hover in a responsive 3/2/1-column grid, with distinct field icons. Hero notes sit under the compass statistics; the start button spans the edition selector width.
- Export explicitly measures the full result width/height and resets cloned margins (including logical margins), transforms and maximum width. The prior computed centering margins could offset content inside the export SVG and clip the right edge. PNG Blob downloads avoid large data-URL links; canvas size is bounded proportionally to 12 megapixels and 16000 pixels per dimension, without cropping.

## Automated checks

Run `node --test tests/assessment.test.mjs` on Node 24, plus TypeScript and production build. Tests verify exact counts, item IDs, coverage, all feedback branches, core-score invariance, portrait order/assets and specific growth guidance.
