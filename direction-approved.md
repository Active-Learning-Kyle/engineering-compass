# Approved visual direction and V1.5 refinement

## Directions shown

- Direction A — professional editorial illustration: `design-demos/direction-a-editorial.html` / `design-demos/direction-a.png`
- Direction B — visible engineering growth journey: `design-demos/direction-b-journey.html` / `design-demos/direction-b.png`
- Direction C — Engineering Mode identity and team-formation system: `design-demos/direction-c-crew.html` / `design-demos/direction-c.png`

## User selection

User-approved direction, 3 September 2026:

> “A 的专业视觉 + C 的七种 Engineering Mode + B 的小型 Growth Stage 标签。 然后由于不知道是男生还是女生做这个，我想到时候结果就是随机的，有男有女可以吗？”

Follow-up colour decision:

> “每一种 Engineering Mode用的颜色主题色调能不能不要一样，可以是 红橙黄绿青蓝紫，选合适的，但是要区分开。”

V1.4 refinement, 3 September 2026:

> “首先在一个首页这个地方不需要放这些照片，就是不需要在这里展示出来，最后做完给他们看就行。你可以按照我的第一张图片的UI设计来。”

> “另外我这里其实也想让你去验证一下是否要分成七个角色。然后，就是真的最后是七个角色吗？可能我目前第一张截图的六个就可以了吧。另外你看看能不能去掉每个model不同颜色的设定，都用原本的颜色就行。”

V1.5 refinement, 3 September 2026:

> “首先能不能不要加上绿色的滤镜，用回正常的照片就行。”

> “另外第七张图片中这六个卡片鼠标只要放在上面就会出现一个有图片的对这个Model的介绍。然后第八张图片参考第九章图片的指南针设计。”

> “整个测试的UI色调风格参考一下 ENGG2202-Teach-to-Learn。”

Role-card motion refinement, 3 September 2026:

> “卡片……可能就是男生女生是渐变切换的。就它图片本身就是男生，然后会就渐变成女生，然后再渐变成男生。然后取决于这个人鼠标放在上面的时间多久，只要他放在上面，它就可以一直渐变。”

## Implementation interpretation

- Preserve the established HKU-inspired green/white system for global navigation, controls, charts, and the formal report.
- Use the reference screenshot's clear, professional homepage hierarchy and direct “Find Your Role in an Engineering Team” proposition.
- Keep character artwork out of the homepage hero. On the six role cards, reveal an editorial role image and fuller contribution description only on hover or keyboard focus.
- Provide six non-fixed Current Engineering Roles: Problem Framer, Project Navigator, Team Connector, Practical Builder, Prototype Explorer, and Solution Storyteller. Each maps to one measured competency; do not retain a seventh balanced-profile role without an independently measured construct.
- Add a compact four-step Engineering Growth Stage label: Exploring, Building, Practising, and Integrating.
- Each role has two randomly selected character presentations. The choice is visual only, is not inferred from the learner, and stays stable for one completed result.
- Use one shared HKU-inspired green/white colour system for all six roles. Differentiate them through icons and language, not separate palettes.
- Interest and growth questions allow unrestricted multi-selection. “Not sure yet” remains mutually exclusive where provided.
- Align the interface with the ENGG2202 site: modern system sans typography, deep forest-green surfaces, a restrained lime action accent, softer borders, generous rounded panels, and less editorial ornament.
- Present generated illustrations in their original colours, without green overlays or colour-blend filters.
- Simplify homepage navigation to How it works, Roles, and Take the assessment. Keep detailed toolkit content on the page without adding a redundant navigation item.
- Use the reference compass-rose structure in the homepage profile graphic while retaining the six role icons.
- Rename the four-step result label to Engineering Experience Level. It remains a formative scope-of-experience interpretation, not a professional engineer rank. Show each toolkit response as its corresponding five-level experience descriptor.
- While a role card is hovered or keyboard-focused, continuously crossfade between its two character variants. Stop and reset the animation when the card is no longer active; respect reduced-motion preferences.
