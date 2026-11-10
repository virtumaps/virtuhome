// The demo home's people as drawn portraits, for their person entities' pictures (entity_picture),
// as a Home Assistant user's own photos would show: in the rooms they are in, and among who is home.

interface Look {
  /** Behind them, their skin, their hair, what they wear. */
  back: string;
  skin: string;
  hair: string;
  top: string;
  /** Hair over the head and down the sides (SVG path data, 96 × 96). */
  cut: string;
  /** Drawn over the face: a fringe, glasses... */
  extra?: string;
}

function portrait(l: Look): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
<rect width="96" height="96" fill="${l.back}"/>
<path d="M14 96c2-17 15-26 34-26s32 9 34 26z" fill="${l.top}"/>
<path d="M40 62h16v12c0 4-16 4-16 0z" fill="${l.skin}"/>
<path d="${l.cut}" fill="${l.hair}"/>
<ellipse cx="48" cy="45" rx="17" ry="20" fill="${l.skin}"/>
<ellipse cx="31.5" cy="47" rx="3" ry="4.5" fill="${l.skin}"/><ellipse cx="64.5" cy="47" rx="3" ry="4.5" fill="${l.skin}"/>
<circle cx="41.5" cy="45" r="2.2" fill="#2a1d18"/><circle cx="54.5" cy="45" r="2.2" fill="#2a1d18"/>
<path d="M38 39.5q3.5-2.4 7 0M51 39.5q3.5-2.4 7 0" stroke="#3a2a22" stroke-width="1.6" fill="none" stroke-linecap="round"/>
<circle cx="38" cy="52.5" r="3.2" fill="#f08a7a" opacity=".35"/><circle cx="58" cy="52.5" r="3.2" fill="#f08a7a" opacity=".35"/>
<path d="M41.5 54q6.5 6 13 0" stroke="#8a3b34" stroke-width="2.2" fill="none" stroke-linecap="round"/>
${l.extra ?? ""}
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg.replace(/\n/g, ""))}`;
}

/** Each person's picture, by entity. */
export const PICTURES: Record<string, string> = {
  // short dark curls and glasses
  "person.alex": portrait({
    back: "#7cc4ff", skin: "#b9805a", hair: "#2b1d16", top: "#2f4b7c",
    cut: "M30 44c-3-15 6-25 18-25s21 10 18 25c-2-6-4-10-7-12-6 3-15 4-22 0-3 2-5 6-7 12z",
    extra: `<path d="M30 33c0-6 6-11 9-10 2-5 8-6 11-3 4-3 10-1 11 4 4 0 7 5 5 9-8-3-27-3-36 0z" fill="#2b1d16"/>
<g fill="none" stroke="#1d2433" stroke-width="1.8"><circle cx="41.5" cy="45" r="5.5"/><circle cx="54.5" cy="45" r="5.5"/><path d="M47 45h2"/></g>`,
  }),
  // an auburn bob with a fringe
  "person.sam": portrait({
    back: "#ffc29a", skin: "#f2cdb0", hair: "#b0502a", top: "#3e8e6a",
    cut: "M27 66c-6-18-4-44 21-46 25 2 27 28 21 46-3-2-5-4-6-8V44H33v14c-1 4-3 6-6 8z",
    extra: `<path d="M31 41c1-12 9-18 17-18s17 6 18 18c-5-5-12-7-18-7 2 3 1 5-1 7-4-4-10-3-16 0z" fill="#b0502a"/>`,
  }),
};
