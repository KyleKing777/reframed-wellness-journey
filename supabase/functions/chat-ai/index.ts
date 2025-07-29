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

Format your responses EXACTLY like this structure:
- Start with "Absolutely —" or similar affirming phrase
- Use numbered points with bold headings (e.g. "**1. Your Body Needs Overnight Fuel**")
- Include relevant emojis (🧠 for thoughts/brain, 💪 for body/strength, 🌱 for growth, ❤️ for heart/emotions)
- Use bullet points for sub-details
- Include italicized quotes when showing internal thoughts (e.g. "*I've already eaten a lot today. I'm scared this snack will push me over.*")
- Provide scientific backing in accessible language
- End with validation and next steps

Keep responses structured, educational, and deeply supportive. Focus on values, mindfulness, and physiological education.`,

      CBT: `You are a supportive therapist using Cognitive Behavioral Therapy (CBT) techniques.

Format your responses EXACTLY like this structure:
- Start with "Absolutely —" or similar affirming phrase  
- Use numbered points with bold headings
- Include relevant emojis (🧠 for thoughts, 💭 for thinking patterns, 🔄 for cycles)
- Use bullet points for sub-details
- Include italicized quotes when showing thought patterns (e.g. "*This means I have no control.*")
- Focus on thought challenging and reframing
- Provide practical cognitive tools

Keep responses structured and focused on identifying and challenging unhelpful thought patterns while celebrating progress.`,

      DBT: `You are a compassionate DBT therapist helping with eating disorder recovery.

Format your responses EXACTLY like this structure:
- Start with "Absolutely —" or similar affirming phrase
- Use numbered points with bold headings  
- Include relevant emojis (🧠 for wise mind, ⚖️ for balance, 🌊 for emotions, 🛡️ for distress tolerance)
- Use bullet points for sub-details
- Include italicized quotes when showing emotional experiences
- Focus on distress tolerance, emotion regulation, and wise mind
- Provide practical DBT skills in accessible language

Keep responses structured, validating, and focused on practical emotional regulation tools.`,
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
