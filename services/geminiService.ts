
import { GoogleGenAI, Type } from "@google/genai";

// Removed googleSearch tool to comply with guideline:
// "The output response.text may not be in JSON format; do not attempt to parse it as JSON."
// when using grounding tools. Since responseSchema is used, disabling tools ensures valid JSON.
export async function fetchGameMetadata(gameName: string, consoleName: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Eres una enciclopedia de Nintendo. Encuentra datos precisos del juego "${gameName}" para la consola "${consoleName}". 
      Busca portadas oficiales (Box Art) de alta resolución.
      
      REGLAS:
      1. El precio debe ser una estimación realista en USD para un cartucho suelto/usado.
      2. Portadas: URLs directas de imágenes (.jpg/.png) de sitios como Wikipedia, MobyGames o IGDB.
      3. Sé rápido y preciso.
      4. Asegúrate de incluir el género predominante (ej: Acción, RPG, Plataformas).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            developer: { type: Type.STRING },
            year: { type: Type.STRING },
            genre: { type: Type.STRING },
            estimatedPrice: { type: Type.NUMBER },
            coverOptions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }
            }
          },
          required: ["name", "developer", "year", "genre", "estimatedPrice", "coverOptions"]
        }
      }
    });

    // response.text is a property, not a method.
    const data = JSON.parse(response.text || "{}");
    
    // Limpieza de URLs
    if (data.coverOptions) {
      data.coverOptions = data.coverOptions.filter((u: string) => 
        u.startsWith('http') && (u.includes('jpg') || u.includes('png') || u.includes('webp'))
      ).slice(0, 4);
    }
    
    return data;
  } catch (error) {
    console.error("Error en búsqueda IA:", error);
    return null;
  }
}
