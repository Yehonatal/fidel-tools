import { nlp } from "./nlp";

export function indexDocument(text: string): string[] {
  const normalized = nlp.normalize(text);
  const lexed = nlp.lexAnalyze(normalized);
  const cleaned = nlp.removeStopwords(lexed);
  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => nlp.stem(w));
}

export function processQuery(query: string): string[] {
  return indexDocument(query);
}

export function score(docStems: string[], queryStems: string[]): number {
  if (queryStems.length === 0) return 0;
  const docSet = new Set(docStems);
  const matches = queryStems.filter((s) => docSet.has(s)).length;
  return matches / queryStems.length;
}
