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
.vh-overlay { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.vh-label {
  position: absolute; left: 0; top: 0; white-space: nowrap; pointer-events: auto; cursor: pointer;
  padding: 3px 9px; border-radius: 10px; background: var(--vh-glass); color: var(--vh-text);
  font-size: 12px; line-height: 1.25; text-align: center; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  box-shadow: 0 1px 6px rgba(0,0,0,0.18); will-change: transform;
}
.vh-label b { font-weight: 600; display: block; }
.vh-label span { color: var(--vh-dim); font-size: 11px; }
.vh-floor-label { font-size: 13px; font-weight: 600; padding: 5px 12px; }
.vh-bar {
  position: absolute; top: 10px; left: 10px; right: 10px; display: flex; gap: 6px; align-items: center;
  pointer-events: none; flex-wrap: wrap;
}
.vh-bar > * { pointer-events: auto; }
.vh-chip {
  border: 0; border-radius: 16px; padding: 7px 13px; font: inherit; font-size: 13px; cursor: pointer;
  background: var(--vh-glass); color: var(--vh-text); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  box-shadow: 0 1px 6px rgba(0,0,0,0.16); display: inline-flex; gap: 6px; align-items: center;
}
.vh-chip.on { background: var(--vh-chip-on); box-shadow: inset 0 0 0 1.5px var(--vh-accent); }
.vh-spacer { flex: 1; }
.vh-tools { position: absolute; right: 10px; bottom: 12px; display: flex; flex-direction: column; gap: 8px; }
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
}
.vh-empty h2 { margin: 0 0 8px; font-size: 20px; }
.vh-empty p { margin: 0 0 14px; color: var(--vh-dim); max-width: 440px; }
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
.vh-stats { position: absolute; left: 10px; bottom: 10px; font: 11px/1.3 ui-monospace, monospace; color: var(--vh-dim); pointer-events: none; }
`;
