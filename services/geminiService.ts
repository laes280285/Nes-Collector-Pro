
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function fetchGameMetadata(gameName: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find official metadata for the NES (Nintendo Entertainment System) game named: "${gameName}". Provide accurate details.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            developer: { type: Type.STRING },
            year: { type: Type.STRING },
            genre: { type: Type.STRING },
            coverUrl: { type: Type.STRING, description: "Suggest a high quality direct URL to the game's official NES box art image." }
          },
          required: ["name", "developer", "year", "genre", "coverUrl"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error fetching game metadata:", error);
    return null;
  }
}
