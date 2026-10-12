# Button State Builder - a visual editor for designing multi-state button flows

A Pen created on CodePen.

Original URL: [https://codepen.io/Margarita-the-solid/pen/XJpgEXm](https://codepen.io/Margarita-the-solid/pen/XJpgEXm).

Map out entire interaction sequences (idle → loading → success → reset) with per-state control over background (solid or animated gradient), icon, label, content type (text / spinner / dots / checkmark), hover behavior, border style, shadow, radius, font, and spring/easing curves for transitions between states.
Ships with 10 preset flows across real-world use cases: auth, checkout, download, deploy pipeline, AI generation, matchmaking, delete confirmation, newsletter signup, and like button. Each flow runs as a live simulation you can watch loop or step through manually.
The gallery view runs all presets simultaneously so you can see every button animating in context. Open any card into the editor panel, tweak a state, and watch the preview update live. States are named, reorderable nodes connected by transition arrows — add or remove states freely and rename them inline.
Built with zero dependencies: DM Sans + DM Mono, CSS custom properties, spring cubic-bezier easing, and hand-rolled animation keyframes for icon behaviors (float, wiggle, bounce, spin, pulse, shake) plus button-level effects (shimmer, ripple, glow, gradient sweep).