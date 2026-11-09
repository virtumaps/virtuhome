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
// raised from 1,555,108 for the devices, smart locks and media labels (1,707,428 measured), then from 1,600,000
// for ?bench (its own chunk), free trials in Extras and appliances (1,761,554 measured), then from 1,650,000 for
// German and Dutch: four chunks of text, each fetched only by people using that language (1,961,053 measured), then
// from 1,800,000 for gates, blinds and awnings that move: their drawing and their controls, each a chunk of its own
// (1,982,259 measured)
export const APP_BYTES = 1_820_000;
// raised from 1,123,987 for the devices (switches, fans, air conditioners, heating, hot water: 1,245,350 measured),
// then from 1,160,000 for the air quality maps and robots moving on the plan (1,277,740 measured), then from
// 1,190,000 for accessibility: names, focus and Escape for sheets and menus, and live regions, which are needed
// from the first frame (1,309,456 measured with the Tablet glass change; the CSS now ships minified, which won back about 4,500 bytes)
export const FIRST_LOAD_BYTES = 1_200_000;
