import { GoogleGenAI, Type } from "@google/genai";

export async function fetchGameMetadata(gameName: string, consoleName: string) {
  try {
    // Always initialize the GoogleGenAI client right before use to ensure it has the most up-to-date configuration.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `STRICT SEARCH: Find metadata and cover art ONLY for the original ${consoleName} version of the game named: "${gameName}". 
      
      CRITICAL RULES:
      1. DO NOT return results for other platforms (e.g., no versions for modern consoles, mobile, or PC unless it is specifically the ${consoleName} release).
      2. If the game doesn't exist for ${consoleName}, return null or zeroed fields, but DO NOT provide data for a different platform.
      3. The box art URLs (coverOptions) MUST be images of the ${consoleName} physical box or cartridge.
      4. Provide accurate details for ${consoleName} release year and developer.
      5. Include an estimated current market price in USD based on recent PriceCharting trends for a "Loose" copy of the ${consoleName} version.`,
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
              description: "The estimated current market price in USD for this specific platform version."
            },
            coverOptions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "An array of exactly 4 direct URLs to box art images for this specific console."
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