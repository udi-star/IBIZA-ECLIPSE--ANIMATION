
import { GoogleGenAI, Type } from "@google/genai";
import { EclipseStoryline } from "../types";

const SYSTEM_INSTRUCTION = `
Project name: Eclipse Storyline Slider
ROLE: Poetic experience designer.
TASK: Generate short, refined storytelling content for an interactive eclipse timeline.
CONSTRAINTS:
- No astronomy facts, dates, locations, or technical tone.
- No astrology, emojis, or motivational clichés.
- Minimal, calm, premium, timeless, emotion-first writing.
- Suitable for a luxury product called "Ibiza Total Solar Glasses".
STRUCTURE:
Exactly 6 phases in this order: Before, First Contact, During the Peak, Totality, Return of Light, Afterglow.
Each needs: 'sentence' (max 12 words), 'feeling' (2-3 keywords), 'reflection' (one gentle question).
TONE: Quiet museum wall text.
`;

export const fetchEclipseStoryline = async (): Promise<EclipseStoryline> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: 'Generate the poetic content for the Eclipse Storyline Slider with 6 distinct phases.',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          before: {
            type: Type.OBJECT,
            properties: {
              sentence: { type: Type.STRING },
              feeling: { type: Type.STRING },
              reflection: { type: Type.STRING }
            },
            required: ["sentence", "feeling", "reflection"]
          },
          first_contact: {
            type: Type.OBJECT,
            properties: {
              sentence: { type: Type.STRING },
              feeling: { type: Type.STRING },
              reflection: { type: Type.STRING }
            },
            required: ["sentence", "feeling", "reflection"]
          },
          during_peak: {
            type: Type.OBJECT,
            properties: {
              sentence: { type: Type.STRING },
              feeling: { type: Type.STRING },
              reflection: { type: Type.STRING }
            },
            required: ["sentence", "feeling", "reflection"]
          },
          totality: {
            type: Type.OBJECT,
            properties: {
              sentence: { type: Type.STRING },
              feeling: { type: Type.STRING },
              reflection: { type: Type.STRING }
            },
            required: ["sentence", "feeling", "reflection"]
          },
          return_of_light: {
            type: Type.OBJECT,
            properties: {
              sentence: { type: Type.STRING },
              feeling: { type: Type.STRING },
              reflection: { type: Type.STRING }
            },
            required: ["sentence", "feeling", "reflection"]
          },
          afterglow: {
            type: Type.OBJECT,
            properties: {
              sentence: { type: Type.STRING },
              feeling: { type: Type.STRING },
              reflection: { type: Type.STRING }
            },
            required: ["sentence", "feeling", "reflection"]
          }
        },
        required: ["before", "first_contact", "during_peak", "totality", "return_of_light", "afterglow"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}') as EclipseStoryline;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw e;
  }
};
