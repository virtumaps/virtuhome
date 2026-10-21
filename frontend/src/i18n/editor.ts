// t() and th() for the editor's modules: the view's keys and the editor's own. Importing this loads
// the editor's English (en-editor.ts), so only modules in the editor's chunk may import it.
import { EN } from "./en";
import { EN_EDITOR } from "./en-editor";
import { esc, translate, type Args, type Table } from "./index";

export { esc };

type Both = typeof EN & typeof EN_EDITOR;
export type EditorKey = keyof Both;

const english = (key: string) => (EN_EDITOR as Table)[key] ?? (EN as Table)[key];

/** A text in the user's language. */
export function t<K extends EditorKey>(key: K, ...args: Args<Both[K]>): string {
  return translate(key, english(key), args[0]);
}

/** A text in the user's language, escaped for innerHTML. */
export function th<K extends EditorKey>(key: K, ...args: Args<Both[K]>): string {
  return esc(translate(key, english(key), args[0]));
}
