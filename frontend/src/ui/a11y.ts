// For keyboards and screen readers: where the focus goes when a sheet or menu opens and closes, and
// the styles for the focus ring, text only screen readers hear and reduced motion.

/** The element with the keyboard's focus, looking into shadow roots (the view lives in one). */
export function focused(): HTMLElement | null {
  let el = document.activeElement as HTMLElement | null;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement as HTMLElement;
  return el;
}

/** Whether `el` is inside `box`, counting what is in the shadow roots within it (Home Assistant's tiles). */
export function within(box: Node, el: Node | null): boolean {
  for (let n = el; n; n = n.parentNode ?? (n as ShadowRoot).host ?? null) if (n === box) return true;
  return false;
}

/** Moves the focus without scrolling: a sheet still sliding in would scroll the whole view. */
export function focusOn(el: Element | null | undefined): void {
  (el as HTMLElement | null)?.focus?.({ preventScroll: true });
}

/**
 * Something redrawn from scratch keeps the focus that was in it: on the element that took the
 * place of the focused one (the same `key` attribute, else the same place among its buttons).
 */
export function keepFocus(box: HTMLElement, redraw: () => void, key = "data-k"): void {
  const was = focused();
  if (!within(box, was)) return redraw();
  const id = was!.getAttribute(key);
  const all = () => [...box.querySelectorAll<HTMLElement>("button, input, select, a[href], [tabindex]")];
  const i = all().indexOf(was!);
  redraw();
  if (within(box, was)) return;
  const next = (id !== null ? all().find((el) => el.getAttribute(key) === id) : null) ?? all()[i] ?? box;
  focusOn(next);
}

// the focus ring; text only screen readers get; labels a 24px target; reduced motion
export const A11Y_CSS = /* css */ `
.vh-root { --vh-on-accent: #0c1220; }
.vh-root.day { --vh-on-accent: #fff; }
.vh-root :focus-visible { outline: 2px solid var(--vh-accent); outline-offset: 2px; }
.vh-root [tabindex="-1"] { outline: none; }
.vh-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.vh-label::before { content: ""; position: absolute; inset: -2px 0; }
@media (prefers-reduced-motion: reduce) { .vh-root * { animation: none !important; transition: none !important; } }
`;
