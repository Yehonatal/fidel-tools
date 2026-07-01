import { NextRequest, NextResponse } from "next/server";
import { callFidelApi } from "@/lib/api-client";

export async function POST(req: NextRequest) {
  try {
    const { text, steps, date } = await req.json();
    
    if (typeof text !== "string" || !Array.isArray(steps) || typeof date !== "string") {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // 1. Fetch the daily trace puzzle from the backend (Hono) to retrieve the correct steps
    const dailyData = await callFidelApi(`/puzzle/daily/trace?date=${date}`, {
      method: "GET",
    });

    const correctSteps = dailyData.payload.steps as string[];
    
    // 2. Evaluate Mastermind feedback (Green, Yellow, Black)
    const feedback: ("green" | "yellow" | "black")[] = steps.map((step, idx) => {
      if (step === correctSteps[idx]) return "green";
      if (correctSteps.includes(step)) return "yellow";
      return "black";
    });

    const isCorrectSequence = JSON.stringify(steps) === JSON.stringify(correctSteps);

    // 3. Call sequential pipeline execution to get the visual representation
    const pipelineData = await callFidelApi("/pipeline", {
      method: "POST",
      body: { text, steps, sequential: true, lang: "am" },
    });

    let output = pipelineData.result;
    if (Array.isArray(output)) {
      output = output.join(" · ");
    }

    return NextResponse.json({
      feedback,
      output,
      solved: isCorrectSequence,
      // Only reveal the correct steps if they solved it or if they ran out of guesses, but the client can check locally when game ends
      correctSteps: isCorrectSequence ? correctSteps : undefined
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
