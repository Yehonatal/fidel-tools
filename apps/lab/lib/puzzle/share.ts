export function renderShareGrid(
  puzzleName: string,
  dayNumber: number,
  tiles: ("green" | "yellow" | "black")[] | ("green" | "yellow" | "black")[][],
  footer: string
): string {
  const emoji = { green: "🟩", yellow: "🟨", black: "⬛" };
  
  let gridStr = "";
  if (Array.isArray(tiles[0])) {
    // 2D Array (Multi-row guess grid)
    gridStr = (tiles as ("green" | "yellow" | "black")[][])
      .map((row) => row.map((t) => emoji[t]).join(""))
      .join("\n");
  } else {
    // 1D Array (Single row of rounds or guesses)
    gridStr = (tiles as ("green" | "yellow" | "black")[]).map((t) => emoji[t]).join("");
  }

  return `Fidel Lab: ${puzzleName} #${dayNumber}\n${gridStr}\n${footer}\nfidel.tools/lab/puzzle`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    return false;
  }
}
