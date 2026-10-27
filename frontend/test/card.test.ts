import { describe, expect, it } from "vitest";
import { inPanelView } from "../src/ui/card";

/** A node of a page: its tag, and its parent or (for a shadow root) its host. */
const node = (localName: string | null, parentNode: unknown = null, host: unknown = undefined) => ({ localName, parentNode, host }) as unknown as Node;

describe("the card in a panel view", () => {
  it("finds the panel view from inside its shadow root", () => {
    // as Home Assistant has it: virtuhome-card > hui-card > (shadow root) > hui-panel-view
    const view = node("hui-panel-view", node("hui-view"));
    const card = node("virtuhome-card", node("hui-card", node(null, null, view)));
    expect(inPanelView(card)).toBe(true);
  });

  it("is not in one in a masonry or sections view", () => {
    const view = node("hui-masonry-view", node("hui-view"));
    const card = node("virtuhome-card", node("hui-card", node(null, null, view)));
    expect(inPanelView(card)).toBe(false);
    expect(inPanelView(node("virtuhome-card"))).toBe(false);
  });
});
