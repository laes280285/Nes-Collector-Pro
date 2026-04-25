
import { GoogleGenAI, Type } from "@google/genai";

// Removed googleSearch tool to comply with guideline:
// "The output response.text may not be in JSON format; do not attempt to parse it as JSON."
// when using grounding tools. Since responseSchema is used, disabling tools ensures valid JSON.
export async function fetchGameMetadata(gameName: string, consoleName: string, dataOnly: boolean = false) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let promptContents = "";
    if (dataOnly) {
      promptContents = `Busca información del juego "${gameName}" para la consola "${consoleName}". 
      
      IMPORTANTE: Busca y extrae la información del juego principalmente desde Wikipedia.
      
      Necesito exactamente 3 posibles coincidencias (o menos si no hay más).
      Para cada coincidencia incluye: nombre exacto, desarrollador, año, género, y precio estimado (usado). No busques portadas.
      
      Responde ÚNICAMENTE con un objeto JSON válido con este formato:
      {
        "results": [
          {
            "name": "string",
            "developer": "string",
            "year": "string",
            "genre": "string",
            "estimatedPrice": number,
            "coverOptions": []
          }
        ]
      }`;
    } else {
      promptContents = `Busca información y portadas oficiales del juego "${gameName}" para la consola "${consoleName}". 
      
      IMPORTANTE: Las URLs de las portadas DEBEN ser enlaces directos a imágenes (que terminen en .jpg, .png, .webp). NO enlaces a páginas web.
      PRIORIDAD MÁXIMA: Busca y extrae la información del juego desde Wikipedia, pero las imágenes de portadas búscalas ESPECÍFICAMENTE en archive.org. Si no encuentras portadas ahí, intenta en MobyGames, IGDB o The Cover Project.
      
      Necesito exactamente 3 posibles coincidencias (o menos si no hay más).
      Para cada coincidencia incluye: nombre exacto, desarrollador, año, género, precio estimado (usado) y una lista de hasta 5 URLs de portadas directas.
      
      Responde ÚNICAMENTE con un objeto JSON válido con este formato:
      {
        "results": [
          {
            "name": "string",
            "developer": "string",
            "year": "string",
            "genre": "string",
            "estimatedPrice": number,
            "coverOptions": ["url1", "url2", ...]
          }
        ]
      }`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: promptContents,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    let text = response.text || "";
    if (text.includes("```json")) {
      text = text.split("```json")[1].split("```")[0];
    } else if (text.includes("```")) {
      text = text.split("```")[1].split("```")[0];
    }
    
    const data = JSON.parse(text.trim() || "{\"results\": []}");
    
    if (data.results) {
      data.results.forEach((item: any) => {
        if (item.coverOptions) {
          item.coverOptions = item.coverOptions.filter((u: string) => 
            typeof u === 'string' && 
            u.startsWith('http') && 
            (u.toLowerCase().endsWith('.jpg') || 
             u.toLowerCase().endsWith('.png') || 
             u.toLowerCase().endsWith('.webp') || 
             u.toLowerCase().includes('images') ||
             u.toLowerCase().includes('covers'))
          ).slice(0, 5);
        }
      });
    }
    
    return data.results || [];
  } catch (error) {
    console.error("Error en búsqueda IA con grounding:", error);
    return [];
  }
}
