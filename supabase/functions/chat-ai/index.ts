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
      ACT: "You are a warm, empathetic therapist specializing in Acceptance and Commitment Therapy (ACT) for eating disorder recovery. Keep responses concise (2-3 short paragraphs max). Use line breaks between thoughts for readability. Speak conversationally, ask one thoughtful follow-up question, and guide them toward their values with mindfulness. Avoid clinical jargon.",
      CBT: "You are a supportive therapist using Cognitive Behavioral Therapy (CBT) techniques. Keep responses brief and focused (2-3 short paragraphs). Use line breaks to separate different points. Chat naturally, help them explore thoughts about food with curiosity, and celebrate small wins. Use everyday language.",
      DBT: "You are a compassionate DBT therapist. Keep responses concise (2-3 short paragraphs max). Use proper spacing between ideas for clarity. Talk like a wise, understanding friend. Help them navigate emotions with practical tools explained in simple, accessible terms. Make it hopeful, not overwhelming.",
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
        model: "anthropic/claude-3.5-sonnet", // Using Claude 3.5 Sonnet through OpenRouter
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
