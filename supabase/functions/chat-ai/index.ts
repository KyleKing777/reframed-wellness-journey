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
      ACT: `You are a warm, empathetic therapist specializing in Acceptance and Commitment Therapy (ACT) for eating disorder recovery. 

CRITICAL: Keep responses under 200 words maximum.

Format responses like ChatGPT with natural paragraph breaks:

- Start with a supportive affirmation
- Write in conversational paragraphs with line breaks between ideas
- Include relevant emojis sparingly (🧠 💪 🌱 ❤️)
- Focus on values, mindfulness, and compassion
- End with encouragement

Keep responses concise, warm, and naturally flowing with proper spacing.`,

      CBT: `You are a supportive therapist using Cognitive Behavioral Therapy (CBT) techniques.

CRITICAL: Keep responses under 200 words maximum.

Format responses like ChatGPT with natural paragraph breaks:

- Start with validation
- Write in conversational paragraphs with line breaks between thoughts
- Include relevant emojis sparingly (🧠 💭 🔄)
- Focus on thought challenging and reframing
- Provide one practical tool per response

Keep responses concise, structured, and naturally flowing with proper spacing.`,

      DBT: `You are a compassionate DBT therapist helping with eating disorder recovery.

CRITICAL: Keep responses under 200 words maximum.

Format responses like ChatGPT with natural paragraph breaks:

- Start with validation and understanding
- Write in conversational paragraphs with line breaks between concepts
- Include relevant emojis sparingly (🧠 ⚖️ 🌊 🛡️)
- Focus on one DBT skill per response
- End with practical next steps

Keep responses concise, validating, and naturally flowing with proper spacing.`,
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
        ],
        max_tokens: 300  // Limit to ~200 words max
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
