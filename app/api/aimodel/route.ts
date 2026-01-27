import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import OpenAI from 'openai';
import { aj } from "../arcjet/route";
import { openai } from "@/lib/openai";

const PROMPT=`You are an AI Trip Planner Agent. Your goal is to help the user plan a trip by asking one relevant trip-related question at a time.
Only ask questions about the following details in order, and wait for the user's answer before asking the next:

Starting location (source)

Destination city or country

Group Size (Solo, Couple, Family, Friends)

Budget (Low, Medium, High)

Trip duration (number of days)

After getting trip duration, immediately respond with ui:"final" so user can generate the trip.

Do not ask multiple questions at once, and never ask irrelevant questions.
If any answer is missing or unclear, politely ask the user to clarify before proceeding.
Always maintain a conversational, interactive style while asking questions.

Along with responses also send which UI component to display for generative UI (for example budget/groupSize/tripDuration/final), where Final means AI generating complete final output.

Once all required information is collected, generate and return a strict JSON response only (no explanations or extra text) with the following JSON schema:

{
  "resp": <Text Response>,
  "ui": "budget/groupSize/tripDuration/final"
}


`
const FINAL_PROMPT = `You are an AI Trip Planner Agent. Your ONLY task is to generate a STRICT JSON response. No explanations, no markdown code blocks, no extra text - ONLY valid JSON.

Generate the following JSON structure with real data based on the conversation:

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
        "hotel_image_url": "string (or empty string if not available)",
        "geo_coordinates": {
          "latitude": 0,
          "longitude": 0
        },
        "rating": 0,
        "description": "string"
      }
    ]
  },
  "itinerary": [
    {
      "day": 1,
      "day_plan": "string",
      "best_time_to_visit_day": "string",
      "activities": [
        {
          "place_name": "string",
          "place_details": "string",
          "place_image_url": "string (or empty string if not available)",
          "geo_coordinates": {
            "latitude": 0,
            "longitude": 0
          },
          "place_address": "string",
          "ticket_pricing": "string",
          "time_travel_each_location": "string",
          "best_time_to_visit": "string"
        }
      ]
    }
  ]
}

IMPORTANT: Return ONLY the JSON object, nothing else. No markdown, no backticks, no explanation.`

export async function POST(req: NextRequest) { 
   const { messages, isFinal } = await req.json();
   try {
      const completion = await openai.chat.completions.create({
         model: "openai/gpt-oss-20b:free",
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

      // Try to parse JSON safely
      try {
         const parsed = JSON.parse(message.content || '{}');
         return NextResponse.json(parsed);
      } catch (parseError) {
         console.error('❌ JSON Parse Error:', parseError);
         console.log('Raw content:', message.content);

         // Try to extract JSON from the response if it contains markdown code blocks
         let extractedJson = message.content;
         const jsonMatch = message.content?.match(/```(?:json)?\s*([\s\S]*?)```/);
         if (jsonMatch) {
            extractedJson = jsonMatch[1].trim();
            try {
               const parsed = JSON.parse(extractedJson);
               return NextResponse.json(parsed);
            } catch (e) {
               console.error('Failed to parse extracted JSON:', e);
            }
         }

         // Return error response when AI doesn't generate proper JSON
         return NextResponse.json({
            error: "AI_PARSE_ERROR",
            raw_content: message.content,
         });
      }
   } catch (error) {
      console.error('❌ OpenAI API Error:', error);
      return NextResponse.json({ error: "Failed to fetch AI response" });
   }
}