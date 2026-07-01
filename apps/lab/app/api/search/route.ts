import { NextRequest, NextResponse } from "next/server";
import { callFidelApi } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const expand = searchParams.get("expand");

    if (!expand) {
      return NextResponse.json({ error: "Missing expand parameter" }, { status: 400 });
    }

    // Call normalize on Hono backend
    const normData = await callFidelApi("/normalize", {
      method: "POST",
      body: { text: expand, lang: "am" },
    });
    const normalized = normData.normalized;

    // Call stem on Hono backend
    const stemData = await callFidelApi("/stem", {
      method: "POST",
      body: { word: normalized, lang: "am" },
    });
    const baseStem = stemData.stem;

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
    ];

    const candidates = new Set<string>();
    const alternateBases = [expand, normalized, baseStem];

    // Spelling alternatives for homophones
    const chars = expand.split("");
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      if (["ሀ", "ሐ", "ሃ", "ኃ", "ኀ"].includes(c)) {
        ["ሀ", "ሐ", "ሃ", "ኃ", "ኀ"].forEach((h) => {
          const copy = [...chars];
          copy[i] = h;
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

    const expansions = Array.from(candidates);

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

    // Call index-documents on Hono backend
    const docsIndexData = await callFidelApi("/index-documents", {
      method: "POST",
      body: { docs: documents, lang: "am" },
    });

    // Call index-query on Hono backend
    const queryIndexData = await callFidelApi("/index-query", {
      method: "POST",
      body: { query, lang: "am" },
    });

    // Call weigh-terms on Hono backend for query
    const queryWeightsData = await callFidelApi("/weigh-terms", {
      method: "POST",
      body: { index: queryIndexData.index, type: "query" },
    });

    // Call weigh-terms on Hono backend for docs
    const docsWeightsData = await callFidelApi("/weigh-terms", {
      method: "POST",
      body: { index: docsIndexData.index, type: "doc" },
    });

    const queryWeights = queryWeightsData.weights || {};
    const docWeights = docsWeightsData.weights || {};

    const scoredDocs = documents.map((doc) => {
      const docTermMap = docWeights[doc.id] || {};
      let score = 0;
      const matchedStems: string[] = [];

      Object.keys(queryWeights).forEach((term) => {
        if (docTermMap[term]) {
          score += queryWeights[term] * docTermMap[term];
          matchedStems.push(term);
        }
      });

      return {
        id: doc.id,
        content: doc.content,
        score: score,
        matchedStems,
      };
    });

    const ranked = scoredDocs.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      query,
      queryStems: Object.keys(queryWeights),
      results: ranked,
      rawIndex: docsIndexData.index,
      rawWeights: docsWeightsData.weights,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
