import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import OpenAI from 'openai';
import { openai } from "@/lib/openai";

const AI_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-oss-20b:free";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function createCompletionWithRetry(
   payload: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
   const maxRetries = 1;

   for (let attempt = 0; ; attempt++) {
      try {
         return await openai.chat.completions.create(payload);
      } catch (error) {
         const status = error instanceof OpenAI.APIError ? error.status : undefined;
         const isRetryable = status === 429 || (typeof status === "number" && status >= 500);

         if (!isRetryable || attempt >= maxRetries) {
            throw error;
         }

         const retryAfterHeader =
            error instanceof OpenAI.APIError ? error.headers?.get("retry-after") : null;
         const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : NaN;
         const delayMs = Number.isFinite(retryAfterSeconds)
            ? Math.max(retryAfterSeconds, 1) * 1000
            : 700;

         await sleep(delayMs);
      }
   }
}

function extractTextFromMessage(message: OpenAI.Chat.Completions.ChatCompletionMessage): string {
   const contentText = typeof message.content === "string"
      ? message.content
      : Array.isArray(message.content)
         ? (message.content as Array<{ text?: string }>)
            .map((part: { text?: string }) => String(part.text ?? ""))
            .join(" ")
         : "";

   const extra = message as {
      reasoning?: string;
      reasoning_details?: Array<{ text?: string }>;
   };

   const reasoningText = Array.isArray(extra.reasoning_details)
      ? extra.reasoning_details.map((item) => item?.text ?? "").join(" ")
      : (extra.reasoning ?? "");

   return (contentText || reasoningText || "").trim();
}

const PROMPT=`You are an AI Trip Planner Agent. Your goal is to help the user plan a trip by asking one relevant trip-related question at a time.
Only ask questions about the following details in order, and wait for the user's answer before asking the next:

Starting location (source)

Destination city or country

Group Size (Solo, Couple, Family, Friends)

Budget/Expenses (Low, Medium, High)

Trip duration (number of days)

IMPORTANT: Track what information has already been collected from the conversation history. Ask ONLY for the next missing item. Do NOT skip any steps. ONLY respond with ui:"final" after ALL 5 details are collected.

After getting trip duration, immediately respond with ui:"final" so user can generate the trip.

Do not ask multiple questions at once, and never ask irrelevant questions.
If any answer is missing or unclear, politely ask the user to clarify before proceeding.
Always maintain a conversational, interactive style while asking questions.

Along with responses also send which UI component to display for generative UI (for example groupSize/budget/tripDuration/final), where Final means AI generating complete final output.

Once all required information is collected, generate and return a strict JSON response only (no explanations or extra text) with the following JSON schema:

{
  "resp": <Text Response>,
  "ui": "groupSize/budget/tripDuration/final"
}


`
const FINAL_PROMPT = `You are an AI Trip Planner Agent. Your ONLY task is to generate a STRICT JSON response. 

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no code blocks, no extra text before or after
2. Do NOT wrap the JSON in triple backticks
3. Do NOT add any explanation or commentary
4. Start with { and end with }
5. Ensure all quotes are properly escaped

Generate the following JSON structure:

{
  "trip_plan": {
    "destination": "string",
    "duration": "string",
    "origin": "string",
    "budget": "string",
    "group_size": "string",
    "hotels": [
      {
        "hotel_name": "string",
        "hotel_address": "string",
        "price_per_night": "string",
        "hotel_image_url": "string or empty",
        "geo_coordinates": {"latitude": 0, "longitude": 0},
        "rating": 0,
        "description": "string"
      }
    ],
    "itinerary": [
      {
        "day": 1,
        "day_plan": "string",
        "best_time_to_visit_day": "string",
        "activities": [
          {
            "place_name": "string",
            "place_details": "string",
            "place_image_url": "string or empty",
            "geo_coordinates": {"latitude": 0, "longitude": 0},
            "place_address": "string",
            "ticket_pricing": "string",
            "time_travel_each_location": "string",
            "best_time_to_visit": "string"
          }
        ]
      }
    ]
  }
}

RETURN ONLY THE JSON OBJECT ABOVE - NO OTHER TEXT.`


export async function POST(req: NextRequest) { 
   try {
      const { messages, isFinal } = await req.json();

      const completion = await createCompletionWithRetry({
         model: AI_MODEL,
         stream: false,
         messages: [
            {
               role: "system",
               content: isFinal ? FINAL_PROMPT : PROMPT,
            },
            ...messages,
         ],
      });

      console.log('💬 AI Model Response:', completion.choices[0].message);
      const message = completion.choices[0].message;
      const content = extractTextFromMessage(message);

      if (!isFinal && !content) {
         return NextResponse.json({
            resp: "Great, let's plan your trip. Where are you starting from?",
            ui: "",
         });
      }

      // Try to parse JSON safely
      try {
         const parsed = JSON.parse(content);
         return NextResponse.json(parsed);
      } catch (parseError) {
         console.error('❌ JSON Parse Error:', parseError);
         console.log('Raw content:', content);

         // Try multiple extraction strategies
         let extractedJson = content;
         
         // Strategy 1: Extract from markdown code blocks
         const jsonMatch = content?.match(/```(?:json)?\s*([\s\S]*?)```/);
         if (jsonMatch) {
            extractedJson = jsonMatch[1].trim();
            try {
               const parsed = JSON.parse(extractedJson);
               return NextResponse.json(parsed);
            } catch (e) {
               console.error('Failed to parse extracted JSON from markdown:', e);
            }
         }

         // Strategy 2: Find JSON object in the response
         const objectMatch = content?.match(/\{[\s\S]*\}/);
         if (objectMatch) {
            extractedJson = objectMatch[0];
            try {
               const parsed = JSON.parse(extractedJson);
               return NextResponse.json(parsed);
            } catch (e) {
               console.error('Failed to parse extracted JSON object:', e);
            }
         }

         // Strategy 3: Clean up common issues and try again
         const cleaned = content
            .replace(/^[^{]*/, '') // Remove everything before first {
            .replace(/[^}]*$/, '') // Remove everything after last }
            .trim();
         try {
            const parsed = JSON.parse(cleaned);
            return NextResponse.json(parsed);
         } catch (e) {
            console.error('Failed to parse cleaned JSON:', e);
         }

         // For chat steps (non-final), gracefully map plain text into expected schema.
         if (!isFinal) {
            const lower = content.toLowerCase();
            let inferredUi = "";
            
            // Infer which UI component based on content (source/destination are text input, not special UI)
            if (lower.includes("group") || lower.includes("solo") || lower.includes("couple") || lower.includes("family") || lower.includes("friend")) {
               inferredUi = "groupSize";
            } else if (lower.includes("budget") || lower.includes("expense") || lower.includes("cost") || lower.includes("price")) {
               inferredUi = "budget";
            } else if (lower.includes("duration") || lower.includes("days") || lower.includes("week") || lower.includes("nights")) {
               inferredUi = "tripDuration";
            }
            // If asking about source/destination, leave inferredUi empty (text input only)


            return NextResponse.json({
               resp: content || "Please share your trip details.",
               ui: inferredUi,
            });
         }

         // Return error response when final AI output doesn't generate proper JSON
         return NextResponse.json({
            error: "AI_PARSE_ERROR",
            raw_content: content,
         }, { status: 502 });
      }
   } catch (error) {
      console.error('❌ OpenAI API Error:', error);

      if (error instanceof OpenAI.APIError && (error.status === 429 || error.status === 402)) {
         const retryAfterHeader = error.headers?.get("retry-after");
         const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : null;
         const isQuotaStyleLimit = error.status === 402;

         return NextResponse.json(
            {
               error: "RATE_LIMITED",
               message: isQuotaStyleLimit
                  ? "Rate limit exceeded for free usage. Please try again later."
                  : "The AI provider is busy right now. Please retry in a few seconds.",
               retryAfterSeconds: Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : null,
               hint: "Using free model only. If this persists, wait for quota reset and retry.",
            },
            { status: 429 }
         );
      }

      return NextResponse.json(
         { error: "AI_PROVIDER_ERROR", message: "Failed to fetch AI response" },
         { status: 502 }
      );
   }
}