import type { Lang } from "../store/langStore";

/** Use Hindi/Devanagari names from API when UI is Hindi or Marathi (no separate Marathi copy on API yet). */
export function preferDevanagari(lang: Lang): boolean {
  return lang === "hi" || lang === "mr";
}
