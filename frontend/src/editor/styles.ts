export const EDITOR_CSS = /* css */ `
.ed {
  position: absolute; top: 0; right: 0; bottom: 0; width: min(380px, 100%); z-index: 5; display: flex; flex-direction: column;
  background: var(--vh-glass); color: var(--vh-text); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  box-shadow: -6px 0 24px rgba(0,0,0,0.25); font-size: 13px;
}
.ed-head { display: flex; align-items: center; gap: 6px; padding: 10px 10px 6px 14px; }
.ed-head b { font-size: 15px; margin-right: auto; }
.ed-modes { display: flex; gap: 2px; margin: 0 10px 8px; padding: 3px; border-radius: 12px; background: var(--vh-chip); }
.ed-mode { flex: 1; border: 0; border-radius: 9px; padding: 6px; background: none; color: var(--vh-dim); font: inherit; font-weight: 600; cursor: pointer; }
.ed-mode.on { background: var(--vh-glass); color: var(--vh-text); box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
.vh-root.plan2d .vh-tools, .vh-root.plan2d .vh-bar, .vh-root.plan2d .vh-overlay, .vh-root.plan2d .vh-menu { display: none; }
.ed-tabs { display: flex; gap: 4px; padding: 0 10px 8px; border-bottom: 1px solid var(--vh-line); }
.ed-tab { flex: 1; border: 0; border-radius: 10px; padding: 7px 4px; background: transparent; color: var(--vh-dim); font: inherit; cursor: pointer; }
.ed-tab.on { background: var(--vh-chip-on); color: var(--vh-text); font-weight: 600; }
.ed-body { flex: 1; overflow: auto; padding: 4px 14px 14px; overscroll-behavior: contain; }
.ed-body h4 { margin: 14px 0 6px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vh-dim); }
.ed-foot { padding: 8px 14px; border-top: 1px solid var(--vh-line); color: var(--vh-dim); min-height: 18px; }
.ed-hint { color: var(--vh-dim); margin: 2px 0 8px; line-height: 1.4; }
.ed-row { display: flex; gap: 6px; align-items: center; margin: 5px 0; flex-wrap: wrap; }
.ed-row label { color: var(--vh-dim); min-width: 52px; }
.ed-check { display: flex; gap: 6px; align-items: center; margin: 4px 0 6px; cursor: pointer; }
.ed-card { background: var(--vh-chip); border-radius: 12px; padding: 8px 10px; margin: 6px 0; }
.ed-card.on { box-shadow: inset 0 0 0 1.5px var(--vh-accent); }
.ed-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 10px; background: var(--vh-chip); margin: 4px 0; cursor: pointer; }
.ed-item span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ed-item small { color: var(--vh-dim); }
.ed-in {
  flex: 1; min-width: 0; font: inherit; color: var(--vh-text); background: var(--vh-chip); border: 1px solid var(--vh-line);
  border-radius: 8px; padding: 6px 8px;
}
.ed-in.num { flex: 0 0 64px; }
.ed-in option { color: #111; }
.ed-grow { flex: 1; display: flex; min-width: 0; }
.ed-btn {
  border: 0; border-radius: 10px; padding: 8px 12px; font: inherit; cursor: pointer; background: var(--vh-accent); color: #fff; font-weight: 600;
}
.ed-btn.ghost { background: var(--vh-chip); color: var(--vh-text); font-weight: 500; }
.ed-btn.danger { background: #d9534f; }
.ed-btn.small { padding: 5px 9px; font-size: 12px; }
.ed-ib { width: 34px; height: 34px; border-radius: 50%; border: 0; display: grid; place-items: center; background: var(--vh-chip); color: var(--vh-text); cursor: pointer; padding: 0; }
.ed-ib.small { width: 28px; height: 28px; }
.ed-ib svg, .ed-save svg { width: 18px; height: 18px; fill: currentColor; }
.ed-save { display: inline-flex; gap: 6px; align-items: center; border: 0; border-radius: 17px; padding: 7px 12px; background: var(--vh-accent); color: #fff; font: inherit; font-weight: 600; cursor: pointer; }
.ed-save:disabled { background: rgba(127,127,127,0.32); color: rgba(255,255,255,0.7); cursor: default; }
.ed-hb {
  display: inline-flex; align-items: center; gap: 4px; border: 0; border-radius: 17px; padding: 6px 10px 6px 8px;
  background: var(--vh-chip); color: var(--vh-text); font: inherit; font-size: 12px; cursor: pointer;
}
.ed-hb svg { width: 17px; height: 17px; fill: currentColor; }
.ed-hb:disabled { opacity: 0.38; cursor: default; }
.ed-ib.on { color: var(--vh-accent); box-shadow: inset 0 0 0 1.5px var(--vh-accent); }
.ed-sub { margin: 10px 0 4px; font-size: 12px; color: var(--vh-dim); }
.ed-chips { display: flex; flex-wrap: wrap; gap: 5px; margin: 4px 0; }
.ed-chips.scroll { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
.ed-chip {
  display: inline-flex; align-items: center; gap: 6px; border: 0; border-radius: 14px; padding: 5px 10px; white-space: nowrap;
  background: var(--vh-chip); color: var(--vh-text); font: inherit; font-size: 12px; cursor: pointer;
}
.ed-chip i { width: 12px; height: 12px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.2); }
.ed-chip.on { background: var(--vh-chip-on); box-shadow: inset 0 0 0 1.5px var(--vh-accent); font-weight: 600; }
.ed-swatches { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0; }
.ed-sw {
  width: 26px; height: 26px; border-radius: 50%; border: 0; padding: 0; cursor: pointer; position: relative;
  background: var(--c, #fff); box-shadow: inset 0 0 0 1px rgba(0,0,0,0.18);
}
.ed-sw.on { box-shadow: 0 0 0 2px var(--vh-glass), 0 0 0 4px var(--vh-accent); }
.ed-sw.none { background: linear-gradient(135deg, transparent 45%, #d9534f 45%, #d9534f 55%, transparent 55%), var(--vh-chip); }
.ed-sw.custom { background: var(--c, conic-gradient(red, yellow, lime, cyan, blue, magenta, red)); overflow: hidden; }
.ed-sw.custom input { opacity: 0; width: 100%; height: 100%; cursor: pointer; }
.ed-search { display: flex; align-items: center; gap: 6px; margin: 4px 0 6px; }
.ed-search span svg { width: 18px; height: 18px; fill: var(--vh-dim); display: block; }
.ed-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 6px; margin-top: 6px; max-height: 280px; overflow: auto; }
.ed-pick {
  display: grid; grid-template-columns: 18px 1fr; grid-template-rows: auto auto; column-gap: 6px; text-align: left; border: 0;
  border-radius: 10px; padding: 6px 8px; background: var(--vh-chip); color: var(--vh-text); font: inherit; cursor: pointer;
}
.ed-pick span { grid-row: span 2; align-self: center; }
.ed-pick span svg { width: 16px; height: 16px; fill: var(--vh-accent); display: block; }
.ed-pick b { font-size: 12px; font-weight: 600; }
.ed-pick small { font-size: 11px; color: var(--vh-dim); }
.ed-pick:hover { box-shadow: inset 0 0 0 1.5px var(--vh-accent); }
.ed-report { margin-top: 8px; color: var(--vh-dim); line-height: 1.45; }
.ed-list { margin-top: 4px; }
.ed-confirm {
  position: absolute; left: 12px; right: 12px; bottom: 54px; padding: 12px 14px; border-radius: 14px; z-index: 6;
  background: var(--vh-glass); box-shadow: 0 6px 24px rgba(0,0,0,0.35); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
}
.ed-confirm p { margin: 0 0 8px; }
@media (max-width: 600px) {
  .ed { top: auto; height: 62%; width: 100%; border-radius: 18px 18px 0 0; }
}
`;
