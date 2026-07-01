import { NextRequest, NextResponse } from "next/server";
import { getStems, jaccardSimilarity } from "@/lib/similarity";

export async function POST(req: NextRequest) {
  try {
    const { textA, textB } = await req.json();
    if (typeof textA !== "string" || typeof textB !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid text inputs (textA and textB)" },
        { status: 400 },
      );
    }

    const stemsA = getStems(textA);
    const stemsB = getStems(textB);

    const setA = new Set(stemsA);
    const setB = new Set(stemsB);

    const similarity = jaccardSimilarity(setA, setB);

    const intersection = stemsA.filter((s) => setB.has(s));
    const uniqueA = stemsA.filter((s) => !setB.has(s));
    const uniqueB = stemsB.filter((s) => !setA.has(s));

    return NextResponse.json({
      similarity,
      stemsA,
      stemsB,
      intersection: Array.from(new Set(intersection)),
      uniqueA: Array.from(new Set(uniqueA)),
      uniqueB: Array.from(new Set(uniqueB)),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
