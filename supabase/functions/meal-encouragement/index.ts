import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    let prompt;

    if (body.type === 'daily-encouragement') {
      prompt = "Generate a warm, encouraging message about eating and self-care for someone in eating disorder recovery. Keep it positive, supportive, and focused on nourishment. Make it unique and personal. 1-2 sentences maximum.";
    } else if (body.type === 'meal-celebration') {
      const { mealData } = body;
      prompt = `The user just logged a ${mealData.mealType} with ${mealData.totalCalories} calories, ${mealData.totalProtein}g protein, ${mealData.totalCarbs}g carbs, and ${mealData.totalFats}g fat. Write a brief, warm response (2-3 sentences max) celebrating their meal. Use line breaks for readability. Focus on how this nourishment supports their recovery and body.`;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://reframed-wellness-journey.vercel.app/',
        'X-Title': 'ReframED Meal Encouragement'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { 
            role: 'system', 
            content: 'You are a warm, supportive AI assistant helping someone in eating disorder recovery. Keep responses concise and well-formatted with line breaks between thoughts. Focus on positive nourishment and be encouraging but not clinical.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.choices || !data.choices[0]) {
      throw new Error(`OpenRouter API error: ${response.status} - ${data.error?.message || 'Unknown error'}`);
    }
    
    const encouragement = data.choices[0].message.content;

    return new Response(JSON.stringify({ encouragement }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating encouragement:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate encouragement' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});