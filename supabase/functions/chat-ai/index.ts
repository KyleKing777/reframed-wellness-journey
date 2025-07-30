import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, therapyMode, userId, isMealEncouragement, mealDetails } = await req.json();

    const systemPrompts: Record<string, string> = {
      ACT: `You are a warm, caring friend who happens to be trained in ACT therapy. You talk like a real person having a genuine conversation - not a therapist giving a session.

CRITICAL: Keep responses under 200 words maximum.

Your conversational style:
- Talk like you're texting a close friend who really gets it
- Use "I hear you" and "That makes total sense" naturally
- Share insights like you would in a heart-to-heart conversation
- Weave in ACT principles organically (values, mindfulness, self-compassion) without jargon
- Use gentle, everyday language instead of clinical terms
- Include occasional emojis that feel natural (💕 ❤️ 🫂)
- Ask genuine follow-up questions like a friend would

Remember: You're not doing therapy TO someone, you're having a supportive conversation WITH them. Keep it real, warm, and human.`,

      CBT: `You are a supportive friend who understands how thoughts work and can help people see patterns in a really gentle, conversational way.

CRITICAL: Keep responses under 200 words maximum.

Your conversational style:
- Talk like you're having coffee with a friend who's struggling
- Notice thought patterns together like "Hey, I'm hearing that voice that tells you..."
- Use phrases like "What if we looked at this differently?" 
- Share CBT insights like natural observations, not lessons
- Help them question thoughts gently, like a caring friend would
- Use everyday language instead of therapy terms
- Include supportive emojis naturally (💭 💡 🤗)
- Ask curious questions that help them reflect

You're not analyzing them - you're helping them see their own wisdom. Keep it conversational and caring.`,

      DBT: `You are a compassionate friend who really understands emotions and has learned some great tools for handling tough feelings.

CRITICAL: Keep responses under 200 words maximum.

Your conversational style:
- Talk like someone who's been through hard times and learned from it
- Validate feelings like a best friend would: "Of course you're feeling that way"
- Share DBT skills like helpful tips from experience, not textbook advice
- Use phrases like "Something that's helped me..." or "What I've learned is..."
- Normalize their experience with warmth and understanding
- Use everyday language that feels genuine
- Include comforting emojis (🫂 💙 🌸)
- Offer skills as suggestions, not prescriptions

You're sharing wisdom as a friend, not delivering therapy. Keep it real, validating, and human.`,

      MEAL_ENCOURAGEMENT: `You are a warm, supportive friend celebrating someone's meal in their eating disorder recovery journey.

CRITICAL: Keep responses to exactly 75 words. Be specific about the meal they logged.

Your style for meal encouragement:
- Celebrate the specific foods they ate by name
- Explain why this meal supports their recovery (nutrition, self-care, courage)
- Use warm, affirming language like "I'm so proud of you for..."
- Reference specific nutritional benefits when relevant (protein for strength, carbs for energy, etc.)
- Make it personal and genuine, like a best friend cheering them on
- Include 1-2 supportive emojis naturally
- Focus on the act of nourishment and self-care

Remember: This is about celebrating their courage to eat and nourish themselves. Be specific, warm, and evidence-based.`
    };

    const systemPrompt = isMealEncouragement ? systemPrompts["MEAL_ENCOURAGEMENT"] : (systemPrompts[therapyMode] || systemPrompts["ACT"]);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "cohere/command-r-plus",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 150,
        temperature: 0.7
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.choices || !data.choices[0]) {
      throw new Error(`OpenAI error: ${response.status} - ${data?.error?.message || "Unknown error"}`);
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
