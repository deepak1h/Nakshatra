import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || ""
});

export async function getAstrologicalResponse(userMessage: string): Promise<string> {
  try {
    const systemPrompt = `You are Nakshatra AI, an ancient, wise, and benevolent astrological guide. Your responses should be:
    - Accurate and insightful from an astrological perspective
    - Concise but meaningful (2-3 sentences max unless detailed explanation requested)
    - Empathetic and encouraging
    - Include relevant planetary influences, signs, and houses when appropriate
    - Use mystical language with cosmic emojis sparingly
    - If question is outside astrology, gently redirect to astrological topics
    - Never make definitive predictions about specific future events
    - Focus on guidance and cosmic influences rather than fortune telling

    Respond to this user's question about astrology:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${systemPrompt}\n\nUser: ${userMessage}`,
    });

    return response.text || "🌟 The cosmic energies are unclear at this moment. Please try rephrasing your question or ask about specific astrological influences.";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "✨ The stars are temporarily obscured. Please try again in a moment, and I'll be happy to share cosmic insights with you.";
  }
}

export async function generateKundaliSummary(birthDetails: {
  fullName: string;
  birthDate: Date;
  birthTime: string;
  birthPlace: string;
  gender: string;
}): Promise<string> {
  try {
    const prompt = `As an expert Vedic astrologer, provide a brief summary for a Kundali reading based on these birth details:
    
    Name: ${birthDetails.fullName}
    Birth Date: ${birthDetails.birthDate.toDateString()}
    Birth Time: ${birthDetails.birthTime}
    Birth Place: ${birthDetails.birthPlace}
    Gender: ${birthDetails.gender}
    
    Provide a 2-3 paragraph summary highlighting:
    - Key personality traits based on likely sun sign
    - General life themes and strengths
    - Areas for growth and awareness
    
    Keep it encouraging and insightful, avoiding specific predictions.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Your cosmic blueprint reveals unique planetary influences that shape your spiritual journey.";
  } catch (error) {
    console.error("Gemini API error for Kundali summary:", error);
    return "The cosmic energies are aligning to reveal your celestial blueprint. A detailed analysis will be provided with your complete Kundali report.";
  }
}
