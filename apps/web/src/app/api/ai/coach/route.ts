import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Ordered fallback chain — tries each model in sequence
const MODEL_CHAIN = [
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
];

async function generateWithFallback(apiKey: string, prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: Error | null = null;

  for (const modelName of MODEL_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (!text) throw new Error('Empty response');
      return text;
    } catch (err: any) {
      const status = err?.status ?? err?.httpErrorCode;
      const is503 = status === 503 || String(err?.message).includes('503') || String(err?.message).includes('high demand');

      if (is503) {
        // Model overloaded — try the next one
        console.warn(`[AI Coach] ${modelName} is overloaded (503), trying next model...`);
        lastError = err;
        continue;
      }

      // For other errors (auth, bad request, etc.) — fail immediately
      throw err;
    }
  }

  // All models failed with 503
  throw new Error('AI_OVERLOADED');
}

export async function POST(req: NextRequest) {
  try {
    const { habitStats } = await req.json();

    if (!habitStats || !Array.isArray(habitStats)) {
      return NextResponse.json({ error: 'Invalid habit statistics data' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        advice: "The Architect is currently offline. Please restart your dev server (npm run dev) so the API key in .env.local can be loaded correctly!"
      });
    }

    const prompt = `
      You are a warm, encouraging behavioral habit coach for an app called "Antigravity". 
      Your goal is to analyze a user's 30-day habit patterns and provide one concise, high-impact piece of advice.
      
      User Data:
      ${JSON.stringify(habitStats)}

      Guidelines:
      1. Be concise (max 2-3 sentences).
      2. Identify a "Vulnerability Zone" (a day of the week they struggle).
      3. Suggest a "Life-Flow" fix (e.g., shifting the habit to a different time or stacking it).
      4. Maintain an "Antigravity" persona (light, encouraging, spatial).
    `;

    const text = await generateWithFallback(apiKey, prompt);
    return NextResponse.json({ advice: text });

  } catch (error: any) {
    console.error('[AI Coach] Final error:', error?.message || error);

    // User-friendly message for overload
    if (error?.message === 'AI_OVERLOADED') {
      return NextResponse.json({
        advice: "The Architect is taking a breather — Google's AI servers are currently swamped. Try again in a moment. Your habits are looking great! 🚀"
      });
    }

    return NextResponse.json({
      error: 'Failed to generate coaching insight',
      details: error?.message || String(error)
    }, { status: 500 });
  }
}
