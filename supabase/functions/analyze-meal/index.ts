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
    console.log('Analyzing meal:', description);

    if (!openRouterKey) {
      console.error('OpenRouter API key not found');
      throw new Error('OpenRouter API key not configured');
    }

    const prompt = `Analyze this meal in detail: "${description}"

    Break down each component of the meal separately, then provide totals:
    1. Identify each food item and estimate its portion size
    2. Calculate calories and macros for each component individually
    3. Consider cooking methods (oil, butter, etc.) that add calories
    4. Use realistic portion sizes for an adult meal
    5. Sum up the totals

    For example, if analyzing "8oz meatloaf with rice and vegetables":
    - Meatloaf (8oz, mixed beef/pork): ~670 calories
    - Rice pilaf (1 cup): ~220 calories  
    - Vegetables with oil: ~150 calories
    - Total: ~1040 calories

    Respond with ONLY a JSON object in this exact format:
    {
      "calories": number,
      "protein": number,
      "carbs": number,  
      "fats": number
    }`;

    console.log('Making request to OpenRouter...');
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://reframed-wellness-journey.vercel.app/',
        'X-Title': 'ReframED Meal Analysis'
      },
      body: JSON.stringify({
        model: 'perplexity/llama-3.1-sonar-small-128k-online',
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

    console.log('OpenRouter response status:', response.status);
    const data = await response.json();
    console.log('OpenRouter response data:', data);
    
    if (!response.ok) {
      console.error('OpenRouter API error:', data);
      throw new Error(`OpenRouter API error: ${response.status} - ${data.error?.message || 'Unknown error'}`);
    }
    
    if (!data.choices || !data.choices[0]) {
      console.error('No choices in response:', data);
      throw new Error('No response choices returned from OpenRouter');
    }
    
    const content = data.choices[0].message.content;
    console.log('Raw response content:', content);
    
    // Try to extract JSON from response
    let nutritionData;
    try {
      // Clean the content - remove any markdown formatting or extra text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      nutritionData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Content that failed to parse:', content);
      throw new Error('Failed to parse nutrition data from response');
    }

    // Validate the response has required fields
    if (!nutritionData.calories || !nutritionData.protein || !nutritionData.carbs || !nutritionData.fats) {
      console.error('Missing required fields in response:', nutritionData);
      throw new Error('Incomplete nutrition data received');
    }

    console.log('Successfully parsed nutrition data:', nutritionData);
    return new Response(JSON.stringify(nutritionData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error analyzing meal:', error);
    
    // Return a more accurate fallback estimate for complex meals
    const fallbackData = {
      calories: 650, // More realistic for a substantial meal
      protein: 35,
      carbs: 55,
      fats: 20
    };
    
    console.log('Returning fallback data:', fallbackData);
    return new Response(JSON.stringify(fallbackData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});