# Pro 60-question pilot — v0.1

Implemented 4 September 2026 at the owner's request. This supersedes the earlier “future Pro / not in this round” scope note in the Standard blueprint. Question wording and interpretation are an initial draft for review, not a validated diagnostic instrument.

## Structure

| Questions | Content | Result use |
| --- | --- | --- |
| 1–30 | Existing Standard core, unchanged | Existing six-competency radar, nine-area toolkit, role, experience stage, interests and growth |
| 31–42 | PS01–PS12: two contextual decisions per competency | Feedback for each selected first action; no numeric score |
| 43–60 | PE01–PE18: two concrete practice-evidence reflections per toolkit area | Qualitative experience summary, next practice and broad/specific experience cross-check |

Scenario option values identify choices, not merit or ability. Scenario answers have distinct feedback. Evidence options distinguish no experience, guided participation, explained contribution and independently checked work. This is self-reported evidence: no uploads or verification are implied.

Pro deliberately keeps the same core scoring as Standard while the new bank is being piloted. No additional question changes the radar, toolkit scores, role or experience stage. Compare the two task-specific evidence answers with the existing broad toolkit response only in words. A high broad rating and a new/guided specific task produces an invitation to reflect, not an automatic penalty.

## Version selection and storage

The homepage selects Standard (30) or Pro (60), updates the statistics and start button, then asks optional year context. There is one device-local draft containing its edition/version. Resuming restores the draft's edition, even if a different edition is selected on the homepage. Existing Standard v1.6 drafts remain compatible; Pro drafts identify themselves as `pro-v0.1`.

## Review priorities

- Pilot with students from different engineering disciplines and experience levels.
- Check comprehension and plausible alternative actions; do not interpret scenario choices as validated performance.
- Review technical-task coverage and the independence anchors for each toolkit.
- Review completion time; 18–25 minutes is a provisional planning estimate.
- Revisit whether/how evidence should affect scoring only after evidence and explicit approval.

## Presentation updates

- Role portrait starting order: problem/collaboration/design use A (male) first; planning/handsOn/pitch use B (female) first. The second portrait crossfades on homepage hover/focus and continuously on results. Reduced-motion preferences retain the first portrait. Image export omits the second layer to avoid a blended portrait in the saved PNG.
- Growth actions are specific to each chosen area; strengths and growth are full-width stacked sections.
- Project counts explicitly say “completed projects”, with a separate responsibility label.
- A subtle sixteen-point compass rose sits behind a continuously driven underdamped spring needle. Each shuffled six-target cycle covers every role and avoids a repeated target at cycle boundaries. Reduced motion disables movement.

## Automated checks

Run `node --test tests/assessment.test.mjs` on Node 24, plus TypeScript and production build. Tests verify exact counts, item IDs, coverage, all feedback branches, core-score invariance, portrait order/assets and specific growth guidance.
