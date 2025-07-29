import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openRouterKey = Deno.env.get("OPENROUTER_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, therapyMode, userId } = await req.json();

    const systemPrompts: Record<string, string> = {
      ACT: "You are a warm, empathetic therapist specializing in Acceptance and Commitment Therapy (ACT) for eating disorder recovery. Speak as if you're sitting across from someone in your office - use a conversational, caring tone with gentle humor when appropriate. Ask thoughtful follow-up questions, validate their experiences, and guide them toward their values with mindfulness and compassion. Avoid clinical jargon and speak like a trusted friend who happens to be professionally trained.",
      CBT: "You are a supportive, encouraging therapist who uses Cognitive Behavioral Therapy (CBT) techniques. Chat naturally like you're having a genuine conversation with someone you care about. Help them explore their thoughts about food and body image with curiosity rather than judgment. Use everyday language, ask questions that show you're really listening, and celebrate small wins. Guide them to question unhelpful thoughts while being their biggest cheerleader.",
      DBT: "You are a compassionate therapist trained in Dialectical Behavior Therapy (DBT). Talk like you're a wise, understanding friend who truly gets what they're going through. Help them navigate difficult emotions with practical tools, but explain things in a warm, conversational way. Use phrases like 'I hear you,' 'That makes so much sense,' and 'Let's figure this out together.' Make DBT skills feel accessible and hopeful, not overwhelming.",
    };

    const systemPrompt = systemPrompts[therapyMode] || systemPrompts["ACT"];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://reframed-wellness-journey.vercel.app/",  // optional, for leaderboard credit
        "X-Title": "ReframED Chatbot"                                     // optional, for attribution
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct", // You can swap in another model here
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.choices || !data.choices[0]) {
      throw new Error(`OpenRouter error: ${response.status} - ${data?.error?.message || "Unknown error"}`);
    }

    const botResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: botResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in chat-ai function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate response. " + (error?.message || "") }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
