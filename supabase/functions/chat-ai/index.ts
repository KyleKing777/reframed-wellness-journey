
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, therapyMode, userId } = await req.json();

    // Create system prompts based on therapy mode
    const systemPrompts = {
      ACT: "You are a compassionate AI assistant trained in Acceptance and Commitment Therapy (ACT) approaches for eating disorder recovery. Focus on helping users identify their values, practice psychological flexibility, and take committed action toward recovery. Use mindfulness and acceptance-based strategies. Keep responses supportive, non-judgmental, and focused on values-based living. Always remind users that you're supplemental support and encourage professional help when needed.",
      CBT: "You are a supportive AI assistant trained in Cognitive Behavioral Therapy (CBT) approaches for eating disorder recovery. Help users identify and challenge unhelpful thought patterns, examine evidence for and against their thoughts, and develop more balanced perspectives. Focus on the connection between thoughts, feelings, and behaviors. Keep responses encouraging and educational. Always remind users that you're supplemental support and encourage professional help when needed.",
      DBT: "You are a caring AI assistant trained in Dialectical Behavior Therapy (DBT) approaches for eating disorder recovery. Focus on teaching distress tolerance, emotion regulation, interpersonal effectiveness, and mindfulness skills. Help users practice radical acceptance and find the wise mind. Use validation and practical coping strategies. Keep responses warm and skills-focused. Always remind users that you're supplemental support and encourage professional help when needed."
    };

    const systemPrompt = systemPrompts[therapyMode] || systemPrompts.ACT;

    console.log(`Processing ${therapyMode} chat request for user ${userId}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.choices || !data.choices[0]) {
      throw new Error(`OpenAI API error: ${response.status} - ${data.error?.message || 'Unknown error'}`);
    }

    const botResponse = data.choices[0].message.content;

    console.log('Successfully generated AI response');

    return new Response(JSON.stringify({ response: botResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-ai function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate response. Please try again.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
