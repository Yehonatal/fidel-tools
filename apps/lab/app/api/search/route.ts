import { NextRequest, NextResponse } from "next/server";
import { indexDocument, processQuery, score } from "@/lib/search";
import { nlp } from "@/lib/nlp";
import amPack from "@fidel-tools/lang-am/am.json";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const expand = searchParams.get("expand");

    if (!expand) {
      return NextResponse.json({ error: "Missing expand parameter" }, { status: 400 });
    }

    const normalized = nlp.normalize(expand);
    const baseStem = nlp.stem(normalized);

    const prefixes = ["የ", "በ", "ለ", "ከ", "ስለ", "እነ", "የሚ", "የማይ"];
    const suffixes = [
      "ች",
      "ዎች",
      "ኦች",
      "ው",
      "ኡ",
      "ዋ",
      "ኝ",
      "ነት",
      "አችን",
      "አቸው",
      "አችሁ",
      "ዎችን",
      "ዎቹን",
      "ውን",
      "ኡን",
      "ዋን",
      "አችንን",
      "አቸውን",
    ];

    const candidates = new Set<string>();
    const userWords = [expand, normalized, baseStem];

    // Spelling alternatives for homophones
    const chars = expand.split("");
    const alternateBases = [expand];
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      if (["ሀ", "ሐ", "ሃ", "ኃ", "ኀ"].includes(c)) {
        ["ሀ", "ሐ", "ሃ", "ኃ", "ኀ"].forEach((h) => {
          const copy = [...chars];
          copy[i] = h;
          alternateBases.push(copy.join(""));
        });
      }
      if (["ሰ", "ሠ"].includes(c)) {
        ["ሰ", "ሠ"].forEach((s) => {
          const copy = [...chars];
          copy[i] = s;
          alternateBases.push(copy.join(""));
        });
      }
      if (["አ", "ዐ"].includes(c)) {
        ["አ", "ዐ"].forEach((a) => {
          const copy = [...chars];
          copy[i] = a;
          alternateBases.push(copy.join(""));
        });
      }
      if (["ጸ", "ፀ"].includes(c)) {
        ["ጸ", "ፀ"].forEach((z) => {
          const copy = [...chars];
          copy[i] = z;
          alternateBases.push(copy.join(""));
        });
      }
    }

    alternateBases.forEach((w) => {
      candidates.add(w);
      prefixes.forEach((p) => candidates.add(p + w));
      suffixes.forEach((s) => candidates.add(w + s));
      prefixes.forEach((p) => {
        suffixes.forEach((s) => candidates.add(p + w + s));
      });
    });

    const stopwords = (amPack as any).stopwords || [];
    stopwords.forEach((w: string) => candidates.add(w));

    const exceptions = (amPack as any).tokenization?.exceptions || {};
    Object.keys(exceptions).forEach((k) => {
      candidates.add(k);
      exceptions[k].forEach((w: string) => candidates.add(w));
    });

    const expansions = Array.from(candidates).filter((candidate) => {
      try {
        return nlp.stem(nlp.normalize(candidate)) === baseStem;
      } catch {
        return false;
      }
    });

    return NextResponse.json({
      stem: baseStem,
      expansions: Array.from(new Set([expand, ...expansions])),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      query,
      documents,
    }: { query: string; documents: Array<{ id: string; content: string }> } = await req.json();

    if (typeof query !== "string" || !Array.isArray(documents)) {
      return NextResponse.json(
        { error: "Missing or invalid query or documents list" },
        { status: 400 },
      );
    }

    const queryStems = processQuery(query);

    const scoredDocs = documents.map((doc) => {
      const docStems = indexDocument(doc.content);
      const similarityScore = score(docStems, queryStems);
      return {
        id: doc.id,
        content: doc.content,
        score: similarityScore,
        matchedStems: queryStems.filter((s) => docStems.includes(s)),
      };
    });

    const ranked = scoredDocs.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      query,
      queryStems,
      results: ranked,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
