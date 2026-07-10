/** Detects "Hey Nana" (and variants) anywhere in a transcript. */
export const WAKE_WORD_PATTERN = /\b(?:hey|ok|okay)[,\s]+nana\b/i;

export function containsWakeWord(text: string): boolean {
  return WAKE_WORD_PATTERN.test(text);
}

export function extractCommandAfterWakeWord(text: string): string | null {
  const match = text.match(WAKE_WORD_PATTERN);
  if (!match || match.index === undefined) return null;
  const after = text.slice(match.index + match[0].length).trim();
  return after || null;
}
