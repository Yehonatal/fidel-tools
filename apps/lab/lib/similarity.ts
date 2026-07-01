import { nlp } from "./nlp";

export function getStems(text: string): string[] {
  const normalized = nlp.normalize(text);
  const lexed = nlp.lexAnalyze(normalized);
  const cleaned = nlp.removeStopwords(lexed);
  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => nlp.stem(w));
}

export function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 1;
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}
