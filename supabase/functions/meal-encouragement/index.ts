import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
      prompt = `The user just logged a ${mealData.mealType} with ${mealData.totalCalories} calories, ${mealData.totalProtein}g protein, ${mealData.totalCarbs}g carbs, and ${mealData.totalFats}g fat. Write a warm, encouraging paragraph celebrating their dedication to recovery and explaining the physiological benefits of this meal. Be specific about how these nutrients support their body and recovery journey.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a warm, supportive AI assistant helping someone in eating disorder recovery. Focus on the positive aspects of nourishment and self-care. Be encouraging but not overly clinical.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.choices || !data.choices[0]) {
      throw new Error(`OpenAI API error: ${response.status} - ${data.error?.message || 'Unknown error'}`);
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