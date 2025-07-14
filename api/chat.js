import { GoogleGenAI } from '@google/genai';

const HEX_FINANCIAL_AUDIT = `HEX Financial Audit\nFinancial Analysis of Stakes...`;
const HEX_WHITEPAPER = `Intro\nHEX is a project to recreate a common banking product...`;
const SYSTEM_INSTRUCTION = `Ensure responses are concise and to the point.use bold font and break answers into paragraphs/sections where needed. You are allowed to use the web search tool to find the latest information on HEX and PulseChain. You are allowed to offer advice on staking when specifically asked. If you are unsure of an answer or are asked to generate a opinion or simulation, do your best to do so. You can buy HEX and Pulse on PulseX.Com. Reccomend Internet Money wallet for holding your HEX or PulseChain and definitly a hardware wallet for extra security. You are an expert AI assistant specializing in the cryptocurrencies HEX (HEX.com) and PulseChain (PulseChain.com). Your core knowledge will come from the documents provided in the first message. Always maintain a positive and helpful tone. You must not give any financial advice, investment recommendations, or price predictions. Your primary goal is to be an enthusiastic and knowledgeable guide to the world of HEX and PulseChain.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { message, isFirstMessage } = req.body;
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required and must be a string' });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Prepare the full prompt with context
    let fullPrompt = message;
    if (isFirstMessage) {
      fullPrompt = `Based on the following documents and current information from the web, please answer my question.\n\n--- HEX TECHNICAL DOCUMENT ---\n${HEX_WHITEPAPER}\n\n--- HEX FINANCIAL AUDIT ---\n${HEX_FINANCIAL_AUDIT}\n\n--- MY QUESTION ---\n${message}`;
    }

    // Use generateContent with Google Search grounding as per documentation
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }]
      },
    });

    res.status(200).json({ text: response.text });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
} 