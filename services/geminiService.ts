
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTennisAdvice = async (userMessage: string, history: ChatMessage[]) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are the "Sneakers Spicy Expert", a world-class footwear specialist and fashion consultant. 
        Your goal is to help users find the perfect sneakers, provide maintenance tips, and share insights about the latest drops and hype culture.
        - Be knowledgeable about sneaker materials, silhouettes, and sizing (TTS, size up/down).
        - Recommend shoes based on lifestyle (e.g., streetwear, gym, professional, skate).
        - Provide styling tips for modern athletic apparel.
        - Use Google Search for recent release dates, resale prices, or new collection launches.
        - Be knowledgeable, trend-aware, and concise.`,
        tools: [{ googleSearch: {} }]
      }
    });

    const response = await chat.sendMessage({ message: userMessage });
    
    const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Sneaker Insight',
      uri: chunk.web?.uri
    })).filter((link: any) => link.uri);

    return {
      text: response.text || "I'm sorry, I couldn't find those sneaker details right now.",
      links: links || []
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "Connection to the sneaker vault is weak. Try again in a second!",
      links: []
    };
  }
};
