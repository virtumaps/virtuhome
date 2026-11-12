export const VIEW_CSS = /* css */ `
:host { display: block; }
[hidden] { display: none !important; }
.vh-root {
  position: relative; width: 100%; height: 100%; overflow: hidden; border-radius: inherit;
  font-family: var(--ha-font-family-body, Roboto, system-ui, sans-serif);
  -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent;
  --vh-glass: rgba(14, 20, 32, 0.62); --vh-text: #eef3fb; --vh-dim: #9fb0c8; --vh-accent: #56c7ff;
  --vh-chip: rgba(255,255,255,0.08); --vh-chip-on: rgba(86,199,255,0.22); --vh-line: rgba(255,255,255,0.12);
}
.vh-root.day {
  --vh-glass: rgba(255, 255, 255, 0.78); --vh-text: #1d232b; --vh-dim: #46505d; --vh-accent: #1a5fcc;
  --vh-chip: rgba(0,0,0,0.05); --vh-chip-on: rgba(47,124,246,0.16); --vh-line: rgba(0,0,0,0.08);
}
.vh-canvas { position: absolute; inset: 0; }
.vh-root.vh-new .vh-canvas, .vh-root.vh-new .vh-tools { visibility: hidden; }
/* the 3D view's own sky is hidden: the first run needs a background in the theme's colours */
.vh-root.vh-new { background: #0c1220; }
.vh-root.vh-new.day { background: #e4e8ee; }
.vh-overlay { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.vh-label {
  position: absolute; left: 0; top: 0; white-space: nowrap; pointer-events: auto; cursor: pointer;
  padding: 3px 9px; border-radius: 10px; background: var(--vh-glass); color: var(--vh-text);
  font-size: 12px; line-height: 1.25; text-align: center; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  box-shadow: 0 1px 6px rgba(0,0,0,0.18); will-change: transform;
}
.vh-label b { font-weight: 600; display: block; }
.vh-label span { color: var(--vh-dim); font-size: 11px; }
/* a bigger target than the text, without moving it */
.vh-label .vh-heat { display: inline-block; padding: 6px 4px; margin: -6px -4px; }
.vh-label .vh-heat.on { color: #ff8a4c; }
.vh-root.day .vh-label .vh-heat.on { color: #b03d0c; }
.vh-label .vh-heat.warn { color: #f0b23c; }
.vh-root.day .vh-label .vh-heat.warn { color: #8a4b00; }
.vh-floor-label { font-size: 13px; font-weight: 600; padding: 5px 12px; }
/* a device shown by its value: icon and value on one line */
.vh-reading { display: flex; align-items: center; gap: 4px; padding: 3px 8px 3px 6px; font-weight: 600; }
.vh-reading svg { width: 14px; height: 14px; fill: var(--vh-accent); flex: none; }
.vh-reading span { color: inherit; font-size: 12px; }
/* an extension's tag over a piece of furniture; lit while there is something to do (a bin to put out) */
.vh-tag { font-weight: 600; }
.vh-tag.lit { background: #f2b33a; color: #1d232b; box-shadow: 0 1px 10px rgba(242,179,58,0.5); }
.vh-label[hidden] { display: none; }
/* a label giving way to another (or back again) fades */
.vh-label { transition: opacity .2s, visibility 0s; }
.vh-label.vh-gone { opacity: 0; visibility: hidden; pointer-events: none; transition: opacity .2s, visibility 0s .2s; }
/* what a TV or speaker plays: its artwork or icon, and the title */
.vh-media span { max-width: 190px; overflow: hidden; text-overflow: ellipsis; }
.vh-media img { width: 26px; height: 26px; border-radius: 4px; object-fit: cover; flex: none; margin: -1px 0; }
/* a smart lock on its door: an icon in its state's colour */
.vh-lock { display: grid; place-items: center; width: 26px; height: 26px; padding: 0; border-radius: 50%; }
.vh-lock svg { width: 16px; height: 16px; fill: #8a94a3; }
.vh-lock[data-kind="locked"] svg { fill: #2bb673; }
.vh-lock[data-kind="unlocked"] svg, .vh-lock[data-kind="open"] svg { fill: #f07a3a; }
.vh-lock[data-kind="moving"] svg { fill: #f2a33a; }
.vh-lock[data-kind="jammed"], .vh-lock[data-kind="problem"] { box-shadow: 0 0 0 2px #e5484d, 0 1px 6px rgba(0,0,0,0.18); }
.vh-lock[data-kind="jammed"] svg, .vh-lock[data-kind="problem"] svg { fill: #e5484d; }
/* by day, darker: an icon needs 3:1 against the light glass */
.vh-root.day .vh-lock svg { filter: brightness(0.72); }
.vh-pop-head { padding: 6px 10px 4px; }
.vh-pop-head b { display: block; font-size: 13px; font-weight: 600; }
.vh-pop-head small { display: block; font-size: 11px; color: var(--vh-dim); }
.vh-pop input { box-sizing: border-box; width: calc(100% - 12px); margin: 4px 6px; padding: 7px 9px; border-radius: 10px; border: 1px solid var(--vh-chip); background: transparent; color: inherit; font: inherit; }
/* who is in the room: faces over its name, or alone over the room in the house view */
.vh-who { display: flex; justify-content: center; margin: 1px 0 3px; }
.vh-face {
  width: 22px; height: 22px; border-radius: 50%; overflow: hidden; display: grid; place-items: center; flex: none;
  font: 600 10px/1 system-ui, sans-serif; font-style: normal; background: var(--vh-chip-on); color: var(--vh-text);
  box-shadow: 0 0 0 1.5px #2bb673;
}
.vh-face + .vh-face { margin-left: -5px; }
.vh-face img { width: 100%; height: 100%; object-fit: cover; }
.vh-faces { padding: 4px 6px; border-radius: 16px; }
.vh-faces .vh-who { margin: 0; }
.vh-bar {
  /* on a phone the sidebar's menu button sits at the top left (panel.ts sets the room it needs) */
  position: absolute; top: 10px; left: max(10px, var(--vh-bar-left, 0px)); right: 10px; display: flex; gap: 6px; align-items: center;
  pointer-events: none; flex-wrap: wrap;
}
.vh-bar > * { pointer-events: auto; }
.vh-chip {
  border: 0; border-radius: 16px; padding: 7px 13px; font: inherit; font-size: 13px; cursor: pointer;
  background: var(--vh-glass); color: var(--vh-text); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  box-shadow: 0 1px 6px rgba(0,0,0,0.16); display: inline-flex; gap: 6px; align-items: center;
}
.vh-chip.on { background: var(--vh-chip-on); box-shadow: inset 0 0 0 1.5px var(--vh-accent); }
.vh-edit.dot { position: relative; }
.vh-edit.dot::after { content: ""; position: absolute; top: 2px; right: 2px; width: 9px; height: 9px; border-radius: 50%; background: #e5484d; box-shadow: 0 0 0 2px var(--vh-glass); }
.vh-spacer { flex: 1; }
/* from under the status row (view.ts sets top) to the bottom: on a short view they wrap into another column */
.vh-tools {
  position: absolute; right: 10px; top: 56px; bottom: 12px; display: flex; flex-direction: column; flex-wrap: wrap-reverse;
  justify-content: flex-end; align-content: flex-start; gap: 8px; pointer-events: none;
}
.vh-tools > * { pointer-events: auto; }
.vh-icon {
  width: 40px; height: 40px; border-radius: 50%; border: 0; cursor: pointer; display: grid; place-items: center;
  background: var(--vh-glass); color: var(--vh-text); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  box-shadow: 0 1px 6px rgba(0,0,0,0.18); padding: 0;
}
.vh-icon svg { width: 22px; height: 22px; fill: currentColor; }
.vh-icon.on { color: var(--vh-accent); }
.vh-sheet {
  position: absolute; left: 10px; right: 60px; bottom: 10px; max-height: 58%; overflow: auto;
  background: var(--vh-glass); color: var(--vh-text); border-radius: 18px; padding: 12px 14px 14px;
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  transform: translateY(calc(100% + 20px)); transition: transform 0.28s ease, visibility 0s 0.28s; overscroll-behavior: contain;
  /* closed, its buttons can't be tabbed to: focus there would scroll the whole view up */
  visibility: hidden;
}
.vh-sheet.open { transform: none; visibility: visible; transition: transform 0.28s ease; }
.vh-sheet h3 { margin: 0 0 2px; font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.vh-sheet .sub { color: var(--vh-dim); font-size: 12px; margin-bottom: 10px; }
.vh-sheet .actions { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
.vh-tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 8px; }
.vh-row {
  display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 12px; background: var(--vh-chip);
  font: inherit; font-size: 13px; cursor: pointer; border: 0; color: inherit; text-align: left; width: 100%;
}
.vh-row .state { margin-left: auto; color: var(--vh-dim); }
.vh-alarm-panel { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
.vh-alarm-panel .sub { color: var(--vh-dim); font-size: 12px; padding: 0 4px; }
.vh-alarm-panel .actions { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.vh-alarm-panel .actions .sub { flex-basis: 100%; }
.vh-code { width: 120px; padding: 7px 10px; border-radius: 12px; border: 0; background: var(--vh-chip); color: inherit; font: inherit; }
.vh-close { margin-left: auto; }
.vh-empty {
  position: absolute; inset: 0; display: grid; place-items: center; text-align: center; color: var(--vh-text); padding: 24px;
  /* only words: taps go through to the Edit button above it */
  pointer-events: none;
}
.vh-empty h2 { margin: 0 0 8px; font-size: 20px; }
/* the editor on a home with no room yet: the note keeps to where the house will stand, beside the editor's panel */
.vh-blank svg { width: 44px; height: 44px; fill: var(--vh-dim); opacity: 0.7; }
.vh-blank h2 { margin-top: 6px; }
@media (min-width: 601px) { .vh-root.editing .vh-empty { right: min(380px, 100%); } }
@media (max-width: 600px) { .vh-root.editing .vh-empty { bottom: 62%; } }
.vh-empty p { margin: 0 0 14px; color: var(--vh-dim); max-width: 440px; }
/* the demo home covers the view, which stays hidden (and draws nothing) underneath */
.vh-root.vh-demo-on > :not(.vh-demo) { display: none !important; }
.vh-toast {
  position: absolute; left: 50%; bottom: 18px; transform: translate(-50%, 30px); opacity: 0; transition: all 0.25s;
  background: var(--vh-glass); color: var(--vh-text); border-radius: 14px; padding: 8px 14px; font-size: 13px; pointer-events: none;
}
.vh-toast.show { transform: translate(-50%, 0); opacity: 1; }
@media (min-width: 601px) {
  .vh-root.editing .vh-canvas, .vh-root.editing .vh-overlay { right: min(380px, 100%); }
  .vh-root.editing .vh-tools { right: calc(min(380px, 100%) + 10px); }
}
/* on a phone the editor's drawer takes the bottom: the house shows above it, as the 2D plan does */
@media (max-width: 600px) {
  .vh-root.editing .vh-canvas, .vh-root.editing .vh-overlay { bottom: 62%; }
  .vh-root.editing .vh-tools, .vh-root.editing .vh-menu { bottom: calc(62% + 10px); }
}
.vh-root.editing .vh-sheet { display: none; }
.vh-alarm.armed { box-shadow: inset 0 0 0 1.5px #2bb673; }
.vh-alarm.alert { background: rgba(209,52,56,0.92); color: #fff; animation: vh-pulse 1s ease-in-out infinite alternate; }
@keyframes vh-pulse { from { opacity: 1; } to { opacity: 0.6; } }
.vh-status { position: absolute; right: 10px; top: 56px; display: flex; gap: 6px; align-items: center; flex-direction: row-reverse; flex-wrap: wrap; max-width: calc(100% - 20px); pointer-events: none; }
.vh-status > * { pointer-events: auto; }
.vh-lights span { font-variant-numeric: tabular-nums; }
.vh-lights svg { color: #f2a33a; }
.vh-person {
  width: 32px; height: 32px; border-radius: 50%; border: 0; padding: 0; cursor: pointer; overflow: hidden; display: grid; place-items: center;
  background: var(--vh-glass); color: var(--vh-text); box-shadow: 0 0 0 2px #2bb673, 0 1px 6px rgba(0,0,0,0.2); font: 600 12px/1 system-ui, sans-serif;
}
.vh-person.away { box-shadow: 0 0 0 2px var(--vh-dim), 0 1px 6px rgba(0,0,0,0.2); opacity: 0.7; }
.vh-person img { width: 100%; height: 100%; object-fit: cover; }
.vh-person.away img { filter: grayscale(1); }
.vh-person i { font-style: normal; }
.vh-alert {
  position: absolute; left: 50%; top: 54px; transform: translateX(-50%); display: inline-flex; gap: 8px; align-items: center; z-index: 4;
  border: 0; border-radius: 18px; padding: 9px 16px; font: inherit; font-weight: 600; cursor: pointer; max-width: calc(100% - 40px);
  background: #d13438; color: #fff; box-shadow: 0 4px 18px rgba(229,72,77,0.45); animation: vh-pulse 1.2s ease-in-out infinite alternate;
}
.vh-alert svg { width: 18px; height: 18px; fill: currentColor; flex: none; }
.vh-alert span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vh-root.editing .vh-status, .vh-root.editing .vh-alert { display: none; }
.vh-legend {
  position: absolute; left: 10px; bottom: 10px; z-index: 2; display: flex; flex-direction: column; gap: 3px;
  padding: 8px 10px; border-radius: 12px; background: var(--vh-glass); color: var(--vh-text); font-size: 12px;
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); pointer-events: none;
}
.vh-legend i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 6px; vertical-align: -1px; }
.vh-legend .ramp { display: flex; align-items: center; gap: 6px; }
.vh-legend .ramp i { width: 90px; height: 8px; border-radius: 4px; margin: 0; }
.vh-root.editing .vh-legend, .vh-root.editing .vh-find-btn { display: none; }
@media (max-width: 600px) { .vh-root.mapped .vh-toast { bottom: 112px; } }
.vh-updated {
  position: absolute; left: 50%; bottom: 18px; transform: translateX(-50%); z-index: 6; max-width: calc(100% - 40px);
  border: 0; border-radius: 18px; padding: 9px 16px; font: inherit; font-weight: 600; cursor: pointer;
  background: var(--vh-accent); color: var(--vh-on-accent); box-shadow: 0 4px 18px rgba(0,0,0,0.3);
}
.vh-menu {
  position: absolute; right: 60px; bottom: 12px; width: 250px; padding: 6px; border-radius: 16px;
  background: var(--vh-glass); color: var(--vh-text); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.25); z-index: 3;
}
.vh-pop {
  position: absolute; min-width: 190px; max-width: min(280px, calc(100% - 16px)); padding: 6px; border-radius: 16px;
  background: var(--vh-glass); color: var(--vh-text); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.25); z-index: 4;
}
.vh-menu-title { font-size: 12px; color: var(--vh-dim); padding: 6px 10px 4px; }
.vh-menu-row {
  display: flex; align-items: center; gap: 8px; width: 100%; border: 0; background: none; color: inherit; font: inherit;
  text-align: left; padding: 7px 8px; border-radius: 10px; cursor: pointer;
}
.vh-menu-row:hover, .vh-menu-row.on { background: var(--vh-chip); }
.vh-menu-row b { display: block; font-size: 13px; font-weight: 600; }
.vh-menu-row small { display: block; font-size: 11px; color: var(--vh-dim); }
.vh-menu-row .tick { width: 18px; height: 18px; flex: none; color: var(--vh-accent); }
.vh-menu-row .tick svg { width: 18px; height: 18px; fill: currentColor; }
@media (min-width: 601px) { .vh-root.editing .vh-menu { right: calc(min(380px, 100%) + 60px); } }
.vh-stats { position: absolute; left: 10px; bottom: 10px; font: 11px/1.3 ui-monospace, monospace; color: var(--vh-dim); pointer-events: none; }
.vh-bench { position: absolute; z-index: 6; left: 10px; right: 10px; bottom: 10px; max-width: 720px; padding: 10px 12px; border-radius: 12px;
  background: rgba(10,15,26,.88); color: #eef3fb; }
.vh-bench pre { margin: 0 0 8px; font: 12px/1.45 ui-monospace, monospace; white-space: pre-wrap; }
.vh-bench div { display: flex; gap: 8px; }
.vh-bench button { border: 0; border-radius: 8px; padding: 6px 12px; background: rgba(255,255,255,.14); color: inherit; font: inherit; cursor: pointer; }
` +
// Tablet graphics (view.ts sets solid): no frosted glass. Each frame the house moves, the blur behind
// every label and button is worked out again, more than a Fire tablet's graphics keep up with. Nearly
// opaque colours read as well (the selected chip's too, with no glass under it), and the labels that
// move with the house lose their shadows (a jammed lock keeps its red ring as a border).
/* css */ `.vh-root.solid{--vh-glass:rgba(16,22,34,.9);--vh-chip-on:#1f3d53}
.vh-root.solid.day{--vh-glass:rgba(250,251,253,.94);--vh-chip-on:#dae7fc}
.vh-root.solid *{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
.vh-root.solid .vh-label{box-shadow:none}
.vh-root.solid .vh-lock[data-kind=jammed],.vh-root.solid .vh-lock[data-kind=problem]{border:2px solid #e5484d}
`;
