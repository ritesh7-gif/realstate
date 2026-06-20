import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Security Middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "wss:", "https:"],
      },
    },
  }));

  const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: { error: "Too many requests from this IP, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // API constraints
  app.post("/api/gemini/chat", chatLimiter, async (req, res) => {
    try {
      const { message, history } = req.body;

      // Input Validation
      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: "Invalid message format. 'message' must be a string." });
        return;
      }
      if (message.length > 2000) {
        res.status(400).json({ error: "Message too long. Please keep it under 2000 characters." });
        return;
      }
      
      const apiKey = process.env.OPENAI_API_KEY;
      const model = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";

      if (!apiKey) {
        throw new Error("Missing OPENAI_API_KEY environment variable");
      }

      // System Instructions
      const systemInstruction = `You are a premium luxury real estate consultant (LuxeReal).

The user has already completed a guided property finder wizard providing their initial requirements (Property Type, Location, Budget) via UI form.
They will send you their initial requirements as their first message.

Your FIRST response MUST immediately use the 'recommendProperties' tool to display matching property cards based on their criteria. 
Do NOT ask any follow-up questions before showing properties.
When returning properties, do NOT say "I found these recommendations", "Here are some options", or "Searching database". You can literally just use the tool without any conversational text. Let the properties speak for themselves.

After properties are displayed, the onboarding is OVER. The chat interface becomes active.
Your role now shifts to an expert real estate consultant. The user will ask follow-up questions about the properties (e.g., comparing appreciation, investment advice, road connectivity, legal queries, nearby facilities, negotiation advice). 
In this active chat phase, answer their questions professionally, directly, and without filler. Use the 'answerQuestion' tool for these. Do NOT ask any more onboarding questions or repeat questions unless they start a completely new search.

CRITICAL RULES:
1. Do NOT behave like a chatbot.
2. Remove all long paragraphs and assistant messages.
3. Do not say "It is a pleasure to assist you...", "To ensure I curate...", or "Could you please...".
4. Immediately show properties without asking questions.
5. Never repeat onboarding questions once properties have been shown.
6. The experience should feel like a premium property wizard and then a professional consultant, not a chatty assistant.
7. STRICT FOCUS ON REAL ESTATE: You only answer queries related to real estate, properties, rooms, land, locations, investment advice, and nearby facilities.
8. REFUSE UNRELATED TOPICS: If the user asks about anything unrelated to real estate (e.g. general knowledge, programming/coding, history, science, politics, weather, recipes, personal tasks, general chats unrelated to properties/rooms), you MUST politely refuse to answer. You should reply: "As a premium real estate consultant, I specialize exclusively in luxury properties, rooms, and real estate investments. I'd be delighted to assist you with any real estate queries or property searches. How can I help you find your dream property today?" and use the 'answerQuestion' tool to return this refusal, along with 2-4 real-estate suggestions (e.g. "Explore Premium Villas", "View Farm Plots in Mulshi", "Search Commercial Spaces").`;

      // Convert frontend history format to OpenAI messages format
      const openaiMessages = [
        { role: "system", content: systemInstruction }
      ];

      for (const h of (history || [])) {
        openaiMessages.push({
          role: h.role === 'ai' ? 'assistant' : 'user',
          content: h.content || ""
        });
      }

      openaiMessages.push({
        role: "user",
        content: message
      });

      // Determine tools and tool_choice based on history.
      // If history is empty, it's the first onboarding search, so we force recommendation of properties.
      // If history has messages, properties have already been shown, so we must never update or show new properties again.
      // Hence, we exclude the "recommendProperties" tool to prevent the model from generating new properties in follow-ups.
      const hasHistory = Array.isArray(history) && history.length > 0;
      
      const tools = [];
      let toolChoice: any = "auto";

      const recommendPropertiesTool = {
        type: "function",
        function: {
          name: "recommendProperties",
          description: "Returns a list of recommended real estate properties based on the user's needs. You must act as a premium real estate agent when responding.",
          parameters: {
            type: "object",
            properties: {
              reply: { 
                type: "string", 
                description: "Your conversational message to the user introducing the properties. Write this as a highly professional, polite real estate agent. Make sure to ask a follow-up question to keep them engaged!" 
              },
              properties: {
                type: "array",
                description: "Array of exactly 2 to 4 luxury property recommendations.",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", description: "A unique short id, e.g., prop-1" },
                    name: { type: "string", description: "Catchy property name (e.g., 'The Azure Villa')" },
                    type: { type: "string", description: "Property type: Villa, Land, Commercial, etc." },
                    location: { type: "string", description: "Location string (e.g., Pune, Mumbai, London)" },
                    price: { type: "string", description: "Price formatted as string with currency (e.g., '$2,500,000' or '₹ 5.5 Cr')" },
                    area: { type: "string", description: "Area in Sq Ft or Acres (e.g., '4,500 Sq Ft' or '2 Acres')" },
                    shortDescription: { type: "string", description: "One sentence compelling description." },
                    longDescription: { type: "string", description: "A full paragraph describing the property in detail." },
                    features: {
                      type: "array",
                      items: { type: "string" },
                      description: "Key features/amenities like 'Private Pool', 'Ocean View', '24/7 Security'"
                    },
                    imageUrl: { type: "string", description: "A highly realistic descriptor to use for a placeholder image. Instead of URL, just indicate context (e.g., 'modern villa exterior'). This will be replaced by the frontend." },
                    investmentHighlights: {
                      type: "array",
                      items: { type: "string" },
                      description: "Investment/ROI highlights"
                    },
                    investmentScore: { type: "number", description: "Investment score out of 10. E.g. 8.5 or 9" },
                    isRoadTouch: { type: "boolean", description: "Whether the property is adjacent to a main road" },
                    isPmrdaApproved: { type: "boolean", description: "Whether the property is approved by the planning authority" },
                    isVerified: { type: "boolean", description: "Whether the property is verified by the platform" }
                  },
                  required: [
                    "id", "name", "type", "location", "price", "area", "shortDescription", "longDescription", 
                    "features", "imageUrl", "investmentHighlights", "investmentScore", "isRoadTouch", 
                    "isPmrdaApproved", "isVerified"
                  ],
                  additionalProperties: false
                }
              }
            },
            required: ["reply", "properties"],
            additionalProperties: false
          }
        }
      };

      const askWithSuggestionsTool = {
        type: "function",
        function: {
          name: "askWithSuggestions",
          description: "Ask the user a quick question and provide clickable suggestions to gather information easily. Use this whenever asking a question.",
          parameters: {
            type: "object",
            properties: {
              reply: { type: "string", description: "Your conversational message to the user." },
              suggestions: {
                type: "array",
                description: "Array of 2-5 short text options (e.g. ['Mumbai', 'Pune'] or ['Under ₹1 Cr', '₹1-3 Cr'])",
                items: { type: "string" }
              }
            },
            required: ["reply", "suggestions"],
            additionalProperties: false
          }
        }
      };

      const answerQuestionTool = {
        type: "function",
        function: {
          name: "answerQuestion",
          description: "Respond to general questions, provide advice, compare properties, or address concerns. Use this for ANY conversation that DOES NOT explicitly require listing new properties.",
          parameters: {
            type: "object",
            properties: {
              reply: { type: "string", description: "Your conversational and professional answer to the user's query." },
              suggestions: {
                type: "array",
                description: "Array of 2-5 short text options for follow-up questions.",
                items: { type: "string" }
              }
            },
            required: ["reply"],
            additionalProperties: false
          }
        }
      };

      if (!hasHistory) {
        // First turn: Force recommending properties
        tools.push(recommendPropertiesTool);
        toolChoice = { type: "function", function: { name: "recommendProperties" } };
      } else {
        // Subsequent turns: Exclude recommendProperties, only allow answering/asking
        tools.push(askWithSuggestionsTool);
        tools.push(answerQuestionTool);
        toolChoice = "auto";
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: openaiMessages,
          tools: tools.length > 0 ? tools : undefined,
          tool_choice: tools.length > 0 ? toolChoice : undefined,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      const choice = responseData.choices?.[0];
      const assistantMessage = choice?.message;

      if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
        const toolCall = assistantMessage.tool_calls[0];
        const name = toolCall.function.name;
        let args: any = {};
        try {
          args = JSON.parse(toolCall.function.arguments);
        } catch (e) {
          console.error("Failed to parse tool call arguments:", e);
        }

        if (name === "recommendProperties") {
          const processedProperties = Array.isArray(args.properties)
            ? args.properties.map((p: any) => ({
                ...p,
                investmentScore: typeof p.investmentScore === 'number' ? p.investmentScore : (8 + Math.floor(Math.random() * 20) / 10),
                isRoadTouch: p.isRoadTouch !== false,
                isPmrdaApproved: p.isPmrdaApproved !== false,
                isVerified: p.isVerified !== false,
              }))
            : [];

          return res.json({
            text: args.reply || "I've carefully selected a few incredible properties that match your lifestyle and needs. Please take a moment to review these exclusive listings, and let me know which ones resonate with you.",
            functionCall: {
              name: "recommendProperties",
              arguments: {
                ...args,
                properties: processedProperties
              }
            }
          });
        }

        if (name === "answerQuestion") {
          return res.json({
            text: args.reply || "I see. Let me expand on that.",
            suggestions: args.suggestions
          });
        }

        if (name === "askWithSuggestions") {
          return res.json({
            text: args.reply || "Sure.",
            suggestions: args.suggestions
          });
        }
      }

      return res.json({
        text: assistantMessage?.content || "I understand.",
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
