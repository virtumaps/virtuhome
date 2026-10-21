// Links into the user guide's website, built from docs/GUIDE.md on each release. `anchor` is the
// heading's anchor as GitHub gives it in GUIDE.md; the website's front page sends it on to the page
// the heading is on, so a link keeps working when a section moves to another part.
// test/guide-site.test.ts checks that every anchor used with it is a heading in the guide.
export const GUIDE_URL = "https://virtumaps.github.io/virtuhome/";

export const guideLink = (anchor: string): string => `${GUIDE_URL}#${anchor}`;
