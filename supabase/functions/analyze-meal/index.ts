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
    const { description } = await req.json();

    const prompt = `Analyze this meal description and provide nutritional estimates: "${description}"

Please respond with ONLY a JSON object in this exact format:
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fats": number
}

Base your estimates on typical serving sizes. Be realistic but not overly precise. For example, if someone says "chicken breast with rice and broccoli", estimate for a normal meal portion.`;

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
            content: 'You are a nutritional analysis AI. You provide estimates for calories, protein, carbs, and fats based on meal descriptions. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 100,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.choices || !data.choices[0]) {
      throw new Error(`OpenAI API error: ${response.status} - ${data.error?.message || 'Unknown error'}`);
    }
    
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    const nutritionData = JSON.parse(content);

    return new Response(JSON.stringify(nutritionData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error analyzing meal:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze meal' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});