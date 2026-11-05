export function newLines(changelog: string, version: string): string[];
export function guideSections(guide: string): [string, string][];
export function news(changelog: string, guide: string, version: string): { text: string; anchor: string | null }[];
