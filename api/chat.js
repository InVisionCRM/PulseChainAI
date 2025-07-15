import { GoogleGenAI } from '@google/genai';

const HEX_FINANCIAL_AUDIT = `HEX Financial Audit\nFinancial Analysis of Stakes...`;
const HEX_WHITEPAPER = `Intro\nHEX is a project to recreate a common banking product...`;
const SYSTEM_INSTRUCTION = `You are an expert AI assistant specializing in the cryptocurrencies HEX (HEX.com) and PulseChain (PulseChain.com). 

**FORMATTING REQUIREMENTS:**
- Always break answers into clear sections with bold titles using **bold text**
- Use bullet points and numbered lists for better readability
- Separate sections with line breaks
- Use bold font for important terms and section headers
- Make responses visually organized and easy to scan

**RESPONSE STRUCTURE:**
- Start with a brief overview or summary
- Break down complex topics into logical sections
- Use **bold section titles** like "**Current Status**", "**Key Features**", "**How It Works**"
- End with actionable information or next steps

**CONTENT GUIDELINES:**
- When thinking mode is enabled, perform a web search to find the latest information on HEX and PulseChain
- When thinking mode is disabled, rely on your training data and the provided documentation
- When thinking mode is disabled, keep answers clear and concise - focus on essential information only
- The HEX OA recently staked all of its supply and the current yield of HEX per T-Share is 1.7 HEX per Day
- You are allowed to offer advice on staking when specifically asked
- Recommend Internet Money wallet for holding HEX or PulseChain and definitely a hardware wallet for extra security
- You can buy HEX and Pulse on PulseX.Com
- Always maintain a positive and enthusiastic tone
- You must not give any financial advice, investment recommendations, or price predictions
- Your primary goal is to be an enthusiastic and knowledgeable guide to the world of HEX and PulseChain

**EXAMPLE FORMAT:**
**Overview**
Brief summary here.

**Current Status**
Latest information from web search.

**Key Features**
• Feature 1
• Feature 2
• Feature 3

**How It Works**
Detailed explanation in clear sections.

**Next Steps**
Actionable information for the user.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { message, isFirstMessage, thinkingMode } = req.body;
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required and must be a string' });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Prepare the full prompt with context
    let fullPrompt = message;
    if (isFirstMessage) {
      const searchContext = thinkingMode 
        ? "Based on the following documents and current information from the web, please answer my question."
        : "Based on the following documents and your training data, please answer my question.";
      fullPrompt = `${searchContext}

IMPORTANT: Format your response with clear sections using bold titles like this:
**Overview**
Brief summary here.

**Current Status** 
Latest information from web search.

**Key Points**
• Point 1
• Point 2
• Point 3

**How It Works**
Detailed explanation.

**Next Steps**
Actionable information.

--- HEX TECHNICAL DOCUMENT ---
${HEX_WHITEPAPER}

--- HEX FINANCIAL AUDIT ---
${HEX_FINANCIAL_AUDIT}

--- MY QUESTION ---
${message}`;
    } else {
      const statusSection = thinkingMode 
        ? "**Current Status** \nLatest information from web search."
        : "**Current Status** \nInformation based on training data.";
      fullPrompt = `IMPORTANT: Format your response with clear sections using bold titles like this:
**Overview**
Brief summary here.

${statusSection}

**Key Points**
• Point 1
• Point 2
• Point 3

**How It Works**
Detailed explanation.

**Next Steps**
Actionable information.

Question: ${message}`;
    }

    // Use generateContent with Google Search grounding only if thinking mode is enabled
    const config = {
      systemInstruction: SYSTEM_INSTRUCTION,
      thinkingConfig: {
        thinkingBudget: thinkingMode ? -1 : 0
      }
    };
    
    if (thinkingMode) {
      config.tools = [{ googleSearch: {} }];
    }
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: config,
    });

    res.status(200).json({ text: response.text });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
} 