
import { GoogleGenAI, Type } from "@google/genai";

export async function fetchGameMetadata(gameName: string, consoleName: string) {
  try {
    // Always initialize the GoogleGenAI client right before use to ensure it has the most up-to-date configuration.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find official metadata for the ${consoleName} game named: "${gameName}". Provide accurate details. Include an estimated current market price in USD based on recent PriceCharting trends for a "Loose" or "Standard" copy. Also, search for 4 distinct high-quality direct URLs to official ${consoleName} box art images.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            developer: { type: Type.STRING },
            year: { type: Type.STRING },
            genre: { type: Type.STRING },
            estimatedPrice: { 
              type: Type.NUMBER,
              description: "The estimated current market price in USD."
            },
            coverOptions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "An array of exactly 4 direct URLs to box art images."
            }
          },
          required: ["name", "developer", "year", "genre", "estimatedPrice", "coverOptions"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error fetching game metadata:", error);
    return null;
  }
}
