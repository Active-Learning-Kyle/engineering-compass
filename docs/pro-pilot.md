# Pro 60-question pilot — v0.2

Implemented 4 September 2026 at the owner's request. This supersedes the earlier “future Pro / not in this round” scope note in the Standard blueprint. Question wording and interpretation are an initial draft for review, not a validated diagnostic instrument.

## Structure

| Questions | Content | Result use |
| --- | --- | --- |
| 1–24 | Standard behavioural and toolkit core, unchanged | Existing six-competency radar, nine-area toolkit and role |
| 25–36 | PS01–PS12: two contextual decisions per competency | Feedback for each selected first action; no numeric score |
| 37–54 | PE01–PE18: two concrete practice-evidence reflections per toolkit area | Qualitative experience summary, next practice and broad/specific experience cross-check |
| 55–60 | Original six closing items: C01, C02, I01, G01, J01, J02 | Project context, interests, growth priorities and closing judgment reflections |

Scenario option values identify choices, not merit or ability. Scenario answers have distinct feedback. Evidence options distinguish no experience, guided participation, explained contribution and independently checked work. This is self-reported evidence: no uploads or verification are implied.

Pro deliberately keeps the same core scoring as Standard while the new bank is being piloted. No additional question changes the radar, toolkit scores, role or experience stage. Compare the two task-specific evidence answers with the existing broad toolkit response only in words. A high broad rating and a new/guided specific task produces an invitation to reflect, not an automatic penalty.

## Version selection and storage

The homepage selects Standard (30) or Pro (60), updates the statistics and start button, then asks optional year context. There is one device-local draft containing its edition/version. Resuming restores the draft's edition, even if a different edition is selected on the homepage. Existing Standard v1.6 drafts remain compatible; new Pro drafts identify themselves as `pro-v0.2`. Old Pro v0.1 drafts retain answers by stable item ID and resume the first unanswered item in the reordered bank, rather than accidentally skipping the middle questions.

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
- Needle targets now change every 650–900 ms with a faster spring and stronger flutter. Toolkit contents are visible without hover in a responsive 3/2/1-column grid, with distinct field icons. Hero notes sit under the compass statistics; the start button spans the edition selector width.
- Export explicitly measures the full result width/height and resets cloned margins (including logical margins), transforms and maximum width. The prior computed centering margins could offset content inside the export SVG and clip the right edge. PNG Blob downloads avoid large data-URL links; canvas size is bounded proportionally to 12 megapixels and 16000 pixels per dimension, without cropping.

## Automated checks

Run `node --test tests/assessment.test.mjs` on Node 24, plus TypeScript and production build. Tests verify exact counts, item IDs, coverage, all feedback branches, core-score invariance, portrait order/assets and specific growth guidance.
