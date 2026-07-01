export async function getRelevanceArenaPuzzle(date?: string) {
  const url = date ? `/api/puzzle/relevance-arena?date=${date}` : `/api/puzzle/relevance-arena`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to load Relevance Arena puzzle");
  }
  return res.json();
}

export async function getTracePuzzle(date?: string) {
  const url = date ? `/api/puzzle/trace?date=${date}` : `/api/puzzle/trace`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to load Trace puzzle");
  }
  return res.json();
}

export async function checkTraceGuess(text: string, steps: string[], date: string) {
  const res = await fetch("/api/puzzle/check-trace-guess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, steps, date }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to verify guess");
  }
  return res.json();
}
