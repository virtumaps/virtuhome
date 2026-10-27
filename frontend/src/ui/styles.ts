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
  --vh-glass: rgba(255, 255, 255, 0.78); --vh-text: #1d232b; --vh-dim: #5a6573; --vh-accent: #2f7cf6;
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
.vh-root.day .vh-label .vh-heat.on { color: #d2501a; }
.vh-floor-label { font-size: 13px; font-weight: 600; padding: 5px 12px; }
/* a device shown by its value: icon and value on one line */
.vh-reading { display: flex; align-items: center; gap: 4px; padding: 3px 8px 3px 6px; font-weight: 600; }
.vh-reading svg { width: 14px; height: 14px; fill: var(--vh-accent); flex: none; }
.vh-reading span { color: inherit; font-size: 12px; }
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
  transform: translateY(calc(100% + 20px)); transition: transform 0.28s ease; overscroll-behavior: contain;
}
.vh-sheet.open { transform: none; }
.vh-sheet h3 { margin: 0 0 2px; font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.vh-sheet .sub { color: var(--vh-dim); font-size: 12px; margin-bottom: 10px; }
.vh-sheet .actions { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
.vh-tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 8px; }
.vh-row {
  display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 12px; background: var(--vh-chip);
  font-size: 13px; cursor: pointer;
}
.vh-row .state { margin-left: auto; color: var(--vh-dim); }
.vh-close { margin-left: auto; }
.vh-empty {
  position: absolute; inset: 0; display: grid; place-items: center; text-align: center; color: var(--vh-text); padding: 24px;
  /* only words: taps go through to the Edit button above it */
  pointer-events: none;
}
.vh-empty h2 { margin: 0 0 8px; font-size: 20px; }
.vh-empty p { margin: 0 0 14px; color: var(--vh-dim); max-width: 440px; }
.vh-start {
  pointer-events: auto; width: min(460px, 100%); max-height: 100%; overflow: auto; box-sizing: border-box;
  display: flex; flex-direction: column; gap: 8px; align-items: stretch; padding: 4px;
}
.vh-start p { margin: 0 auto 6px; }
.vh-start-choice {
  border: 0; border-radius: 14px; padding: 12px 16px; font: inherit; text-align: left; cursor: pointer;
  background: var(--vh-chip); color: var(--vh-text); box-shadow: inset 0 0 0 1px var(--vh-line);
  display: flex; flex-direction: column; gap: 2px;
}
.vh-start-choice b { font-size: 15px; }
.vh-start-choice span { color: var(--vh-dim); font-size: 13px; line-height: 1.35; }
.vh-start-choice:hover, .vh-start-choice:focus-visible { box-shadow: inset 0 0 0 1.5px var(--vh-accent); background: var(--vh-chip-on); outline: none; }
.vh-start-demo { align-self: center; border: 0; background: none; padding: 8px; font: inherit; font-size: 14px; color: var(--vh-accent); cursor: pointer; }
.vh-start-demo:hover, .vh-start-demo:focus-visible { text-decoration: underline; outline: none; }
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
.vh-root.editing .vh-sheet { display: none; }
.vh-alarm.armed { box-shadow: inset 0 0 0 1.5px #2bb673; }
.vh-alarm.alert { background: rgba(229,72,77,0.85); color: #fff; animation: vh-pulse 1s ease-in-out infinite alternate; }
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
  background: #e5484d; color: #fff; box-shadow: 0 4px 18px rgba(229,72,77,0.45); animation: vh-pulse 1.2s ease-in-out infinite alternate;
}
.vh-alert svg { width: 18px; height: 18px; fill: currentColor; flex: none; }
.vh-alert span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vh-root.editing .vh-status, .vh-root.editing .vh-alert { display: none; }
.vh-menu {
  position: absolute; right: 60px; bottom: 12px; width: 250px; padding: 6px; border-radius: 16px;
  background: var(--vh-glass); color: var(--vh-text); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.25); z-index: 3;
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
`;
