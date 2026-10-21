// Performance budgets, checked by budget.test.ts. Cheap wall tablets are the headline, so these fail
// the build when the demo house or the bundle grows by accident.
//
// To raise one on purpose: run `npx vitest run test/budget.test.ts`, which prints what was measured,
// put the new number here, and say in the pull request why it grew (a feature worth the cost).

/** Triangles of the demo house at the Tablet level, all floors and roofs (measured 16,019, +20%). */
export const DEMO_TRIANGLES = 19_200;

/** The loader runs on every Home Assistant page: it stays tiny. */
export const LOADER_BYTES = 4 * 1024;

/**
 * The built app (custom_components/virtuhome/frontend/app), in bytes: everything, and what a tablet
 * loads to show the house (app.js and the chunks it imports up front). The test allows 10% over these.
 */
export const APP_BYTES = 1_555_125;
export const FIRST_LOAD_BYTES = 1_123_987;
