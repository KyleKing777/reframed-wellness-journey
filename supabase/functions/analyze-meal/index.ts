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
    const { description } = await req.json();

    const prompt = `Search for accurate nutritional information for this meal: "${description}". 
    
    Look up current nutritional data from reliable sources and provide accurate estimates based on typical restaurant or homemade portions. Consider all ingredients and cooking methods.

    Respond with ONLY a JSON object in this exact format:
    {
      "calories": number,
      "protein": number,
      "carbs": number,  
      "fats": number
    }`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://reframed-wellness-journey.vercel.app/',
        'X-Title': 'ReframED Meal Analysis'
      },
      body: JSON.stringify({
        model: 'perplexity/llama-3.1-sonar-large-128k-online',
        messages: [
          { 
            role: 'system', 
            content: 'You are a nutritional analysis expert with access to current nutritional databases. Search for accurate nutritional information and provide realistic estimates based on typical serving sizes. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.2,
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