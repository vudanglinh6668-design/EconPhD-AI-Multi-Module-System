
import { GoogleGenAI } from "@google/genai";
import { ModuleType } from "../types";
import { MODULES } from "../constants";

export const generateAnalysis = async (
  moduleType: ModuleType,
  userContent: string,
  onStream?: (text: string) => void
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const selectedModule = MODULES.find(m => m.id === moduleType);
  
  if (!selectedModule) throw new Error("Invalid module selection");

  try {
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: userContent,
      config: {
        systemInstruction: selectedModule.prompt,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        if (onStream) onStream(fullText);
      }
    }
    return fullText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
