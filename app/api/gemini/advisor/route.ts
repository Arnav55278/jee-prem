import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, history, studentContext, model } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { text: "AI Academic Advisor is ready. (Note: Server GEMINI_API_KEY environment variable is not configured. Here is an academic strategy diagnostic: maintain 30+ daily Level 3 JEE Advanced problems in Physics Rotational Motion and Mathematics Definite Integration)." },
        { status: 200 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are KINETIC JEE's Elite Academic Advisor & STEM Specialist for an ambitious student preparing for JEE Advanced (targeting AIR < 500, IIT Bombay).
Student current context: ${JSON.stringify(studentContext || {})}

Guidelines:
1. Provide mathematically rigorous, step-by-step first-principles explanations.
2. If the user asks about problem solving, show clear diagrams/steps in text and key insights.
3. If the user asks for a study plan or diagnostic analysis, analyze their Physics, Chemistry, and Mathematics balance.
4. Keep advice sharp, motivating, and strictly oriented to JEE Advanced standards.`;

    let userContent = prompt || "Analyze my JEE progress and provide recommendations.";
    if (history && Array.isArray(history) && history.length > 0) {
      const recentHistory = history.map(h => `${h.role}: ${h.text}`).join("\n");
      userContent = `Conversation context:\n${recentHistory}\n\nStudent message:\n${userContent}`;
    }

    const response = await ai.models.generateContent({
      model: model || "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemInstruction}\n\n${userContent}` }]
        }
      ]
    });

    return NextResponse.json({ text: response.text || "Academic diagnostic generated successfully." });
  } catch (error: any) {
    console.error("Gemini Advisor Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate AI response" },
      { status: 500 }
    );
  }
}
