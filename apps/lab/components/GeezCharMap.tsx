import React, { useState } from "react";

export default function GeezCharMap() {
  const consonants = [
    { base: "ሀ", name: "Hä", row: ["ሀ", "ሁ", "ሂ", "ሃ", "ሄ", "ህ", "ሆ"] },
    { base: "ለ", name: "Lä", row: ["ለ", "ሉ", "ሊ", "ላ", "ሌ", "ል", "ሎ"] },
    { base: "ሐ", name: "Hä", row: ["ሐ", "ሑ", "ሒ", "ሓ", "ሔ", "ሕ", "ሖ"] },
    { base: "መ", name: "Mä", row: ["መ", "ሙ", "ሚ", "ማ", "ሜ", "ም", "ሞ"] },
    { base: "ሠ", name: "Sä", row: ["ሠ", "", "ሢ", "ሣ", "ሤ", "ሥ", "ሦ"] },
    { base: "ረ", name: "Rä", row: ["ረ", "ሩ", "ሪ", "ራ", "ሬ", "ር", "ሮ"] },
    { base: "ሰ", name: "Sä", row: ["ሰ", "ሱ", "ሲ", "ሳ", "ሴ", "ስ", "ሶ"] },
    { base: "ሸ", name: "Shä", row: ["ሸ", "ሹ", "ሺ", "ሻ", "ሼ", "ሽ", "ሾ"] },
    { base: "ቀ", name: "Qä", row: ["ቀ", "ቁ", "ቂ", "ቃ", "ቄ", "ቅ", "ቆ"] },
    { base: "በ", name: "Bä", row: ["በ", "ቡ", "ቢ", "ባ", "ቤ", "ብ", "ቦ"] },
    { base: "ተ", name: "Tä", row: ["ተ", "ቱ", "ቲ", "ታ", "ቴ", "ት", "ቶ"] },
    { base: "ቸ", name: "Chä", row: ["ቸ", "ቹ", "ቺ", "ቻ", "ቼ", "ች", "ቾ"] },
    { base: "ኀ", name: "Hä", row: ["ኀ", "ኁ", "ኂ", "ኃ", "ኄ", "ኅ", "ኆ"] },
    { base: "ነ", name: "Nä", row: ["ነ", "ኑ", "ኒ", "ና", "ኔ", "ን", "ኖ"] },
    { base: "ኘ", name: "Nyä", row: ["ኘ", "ኙ", "ኚ", "ኛ", "ኜ", "ኝ", "ኞ"] },
    { base: "አ", name: "Ä", row: ["አ", "ኡ", "ኢ", "አ", "ኤ", "እ", "ኦ"] },
    { base: "ከ", name: "Kä", row: ["ከ", "ኩ", "ኪ", "ካ", "ኬ", "ክ", "ኮ"] },
    { base: "ወ", name: "Wä", row: ["ወ", "ዉ", "ዊ", "ዋ", "ዌ", "ው", "ዎ"] },
    { base: "ዐ", name: "Ä", row: ["ዐ", "ዑ", "ዒ", "ዓ", "ዔ", "ዕ", "ዖ"] },
    { base: "ዘ", name: "Zä", row: ["ዘ", "ዙ", "ዚ", "ዛ", "ዜ", "ዝ", "ዞ"] },
    { base: "ዠ", name: "Zhä", row: ["ዠ", "ዡ", "ዢ", "ዣ", "ዤ", "ዥ", "ዦ"] },
    { base: "የ", name: "Yä", row: ["የ", "ዩ", "ዪ", "ያ", "ዬ", "ይ", "ዮ"] },
    { base: "ደ", name: "Dä", row: ["ደ", "ዱ", "ዲ", "ዳ", "ዴ", "ድ", "ዶ"] },
    { base: "ጀ", name: "Jä", row: ["ጀ", "ጁ", "ጂ", "ጃ", "ጄ", "ጅ", "ጆ"] },
    { base: "ገ", name: "Gä", row: ["ገ", "ጉ", "ጊ", "ጋ", "ጌ", "ግ", "ጎ"] },
    { base: "ጠ", name: "T'ä", row: ["ጠ", "ጡ", "ጢ", "ጣ", "ጤ", "ጥ", "ጦ"] },
    { base: "ጨ", name: "Ch'ä", row: ["ጨ", "ጩ", "ጪ", "ጫ", "ጬ", "ጭ", "ጮ"] },
    { base: "ጰ", name: "P'ä", row: ["ጰ", "ጱ", "ጲ", "ጳ", "ጴ", "ጵ", "ጶ"] },
    { base: "ጸ", name: "Ts'ä", row: ["ጸ", "ጹ", "ጺ", "ጻ", "ጼ", "ጽ", "ጾ"] },
    { base: "ፀ", name: "Ts'ä", row: ["ፀ", "ፁ", "ፂ", "ፃ", "ፄ", "ፅ", "ፇ"] },
    { base: "ፈ", name: "Fä", row: ["ፈ", "ፉ", "ፊ", "ፋ", "ፌ", "ፍ", "ፎ"] },
    { base: "ፐ", name: "Pä", row: ["ፐ", "ፑ", "ፒ", "ፓ", "ፔ", "ፕ", "ፖ"] },
  ].filter((c, idx, arr) => arr.findIndex((item) => item.base === c.base) === idx); // Deduplicate rows

  const vowels = ["1st (ä)", "2nd (u)", "3rd (i)", "4th (a)", "5th (e)", "6th (ə)", "7th (o)"];
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [seraValue, setSeraValue] = useState<string | null>(null);

  const handleCharClick = async (char: string) => {
    setSelectedChar(char);
    try {
      const response = await fetch("/api/transliterate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: char, direction: "to-sera" }),
      });
      const data = await response.json();
      if (data.result) {
        setSeraValue(data.result);
      } else {
        setSeraValue(null);
      }
    } catch {
      setSeraValue(null);
    }
  };

  return (
    <div className="premium-card p-5 transition-colors">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 border-b border-zinc-150 dark:border-zinc-900 pb-4">
        <div>
          <h4 className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            Ge&apos;ez / Ethiopic Character Map
          </h4>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold mt-1">
            Click any character to view its phonetic SERA transliteration.
          </p>
        </div>

        {selectedChar && (
          <div className="flex items-center gap-3.5 bg-blue-500/5 dark:bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20 font-mono text-sm">
            <span className="font-extrabold text-zinc-900 dark:text-white text-lg">
              {selectedChar}
            </span>
            <span className="text-blue-500 font-bold">&rarr;</span>
            <span className="font-black text-blue-600 dark:text-sky-400">{seraValue}</span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto max-h-[380px] overflow-y-auto pr-1">
        <table className="w-full text-center font-mono text-xs border-collapse min-w-[550px]">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-900">
              <th className="px-3 py-2 text-zinc-400 dark:text-zinc-500 text-left font-bold text-[9px] uppercase tracking-wider">
                Root
              </th>
              {vowels.map((v) => (
                <th
                  key={v}
                  className="px-2 py-2 text-zinc-400 dark:text-zinc-500 font-bold text-[9px] uppercase tracking-wider"
                >
                  {v}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-150 dark:divide-zinc-900/60">
            {consonants.map((c) => (
              <tr
                key={c.base}
                className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors"
              >
                <td className="px-3 py-1.5 font-bold text-left text-zinc-900 dark:text-white border-r border-zinc-150 dark:border-zinc-900/40 pr-4">
                  {c.base}{" "}
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-normal">
                    ({c.name})
                  </span>
                </td>
                {c.row.map((char, index) => (
                  <td key={index} className="px-1 py-1.5">
                    {char ? (
                      <button
                        onClick={() => handleCharClick(char)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md transition-all cursor-pointer font-bold text-sm ${
                          selectedChar === char
                            ? "bg-blue-600 text-white dark:bg-sky-400 dark:text-black shadow-xs scale-105"
                            : "text-zinc-800 dark:text-zinc-350 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        }`}
                      >
                        {char}
                      </button>
                    ) : (
                      <span className="text-zinc-300 dark:text-zinc-700">-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
