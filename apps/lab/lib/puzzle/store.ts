export interface PuzzleResult {
  puzzleId: string;        // "relevance-arena" | "trace"
  dateStr: string;         // "2026-07-01"
  completed: boolean;
  won?: boolean;
  attempts: number;
  grid: string;            // emoji string, already rendered
  agreementRate?: number;  // Relevance Arena only
  guesses?: string[][];    // Trace only, raw guesses for stats
}

export interface PuzzleHistory {
  schemaVersion: number;
  results: PuzzleResult[];
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
}

const CURRENT_SCHEMA_VERSION = 1;

function getStorageKey(puzzleId: string): string {
  return `fidel-lab:puzzle:${puzzleId}`;
}

export function loadPuzzleHistory(puzzleId: string): PuzzleHistory {
  if (typeof window === "undefined") {
    return { schemaVersion: CURRENT_SCHEMA_VERSION, results: [], currentStreak: 0, longestStreak: 0, lastPlayedDate: null };
  }

  const key = getStorageKey(puzzleId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return { schemaVersion: CURRENT_SCHEMA_VERSION, results: [], currentStreak: 0, longestStreak: 0, lastPlayedDate: null };
    }

    const data = JSON.parse(raw) as PuzzleHistory;
    
    // Check version & migrate if necessary
    if (data.schemaVersion !== CURRENT_SCHEMA_VERSION) {
      // In version 1, if it's different, just discard/reset to current schema format
      return { schemaVersion: CURRENT_SCHEMA_VERSION, results: [], currentStreak: 0, longestStreak: 0, lastPlayedDate: null };
    }

    return data;
  } catch (err) {
    console.error(`Failed to load history for ${puzzleId}:`, err);
    return { schemaVersion: CURRENT_SCHEMA_VERSION, results: [], currentStreak: 0, longestStreak: 0, lastPlayedDate: null };
  }
}

export function savePuzzleHistory(puzzleId: string, history: PuzzleHistory): void {
  if (typeof window === "undefined") return;

  const key = getStorageKey(puzzleId);
  try {
    localStorage.setItem(key, JSON.stringify(history));
  } catch (err) {
    console.error(`Failed to save history for ${puzzleId}:`, err);
  }
}

// Check UTC date difference to check if streak is consecutive
function isConsecutiveDay(lastDateStr: string, currentDateStr: string): boolean {
  const last = new Date(`${lastDateStr}T00:00:00Z`);
  const current = new Date(`${currentDateStr}T00:00:00Z`);
  const diffTime = current.getTime() - last.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

export function addPuzzleResult(puzzleId: string, result: PuzzleResult): PuzzleHistory {
  const history = loadPuzzleHistory(puzzleId);
  
  // Prevent duplicate entries for the same date
  const existingIdx = history.results.findIndex(r => r.dateStr === result.dateStr);
  if (existingIdx !== -1) {
    history.results[existingIdx] = result;
  } else {
    history.results.push(result);
  }

  // Update streaks
  if (result.completed && result.won !== false) { // won defaults to true if not specified
    if (history.lastPlayedDate === null) {
      history.currentStreak = 1;
    } else if (isConsecutiveDay(history.lastPlayedDate, result.dateStr)) {
      history.currentStreak += 1;
    } else if (history.lastPlayedDate === result.dateStr) {
      // Already played today, streak remains same
    } else {
      // Gap of 2+ days, reset
      history.currentStreak = 1;
    }
    
    history.longestStreak = Math.max(history.longestStreak, history.currentStreak);
    history.lastPlayedDate = result.dateStr;
  } else if (result.completed && result.won === false) {
    // Loss resets current streak
    history.currentStreak = 0;
    history.lastPlayedDate = result.dateStr;
  }

  savePuzzleHistory(puzzleId, history);
  return history;
}
