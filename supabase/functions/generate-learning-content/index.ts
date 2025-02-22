
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { interest, level, contentType } = await req.json();
    console.log("Generating content for:", { interest, level, contentType });

    // Create a contextual system prompt based on content type
    let systemPrompt = "You are a Korean language tutor specializing in creating personalized learning content. ";
    systemPrompt += "Your responses should be structured, educational, and engaging. ";
    systemPrompt += "Always include Korean text (in Hangul), romanization, and English translations. ";
    systemPrompt += "Format responses in clear sections for easy reading and learning.";

    // Create a specific prompt based on content type
    let promptPrefix = "";
    switch (contentType) {
      case "vocabulary":
        promptPrefix = "Create a list of 10 Korean vocabulary words related to";
        break;
      case "grammar":
        promptPrefix = "Explain a Korean grammar pattern commonly used in";
        break;
      case "conversation":
        promptPrefix = "Create a practical dialogue scenario about";
        break;
      case "culture":
        promptPrefix = "Explain a Korean cultural aspect related to";
        break;
    }

    // Add level-specific instructions
    const levelInstructions = {
      beginner: "Use basic vocabulary and simple sentence structures. Include lots of examples.",
      intermediate: "Use moderate vocabulary and introduce some complex grammar patterns.",
      advanced: "Use sophisticated vocabulary and advanced grammar constructions."
    };

    const prompt = `${promptPrefix} ${interest} for ${level} level students. ${levelInstructions[level]}`;
    console.log("Using prompt:", prompt);

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
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      throw new Error(error.error?.message || 'Failed to generate content');
    }

    const data = await response.json();
    const generatedContent = {
      content: data.choices[0].message.content,
      metadata: {
        model: 'gpt-4o-mini',
        interest,
        level,
        contentType,
        timestamp: new Date().toISOString()
      }
    };

    console.log("Successfully generated content");

    return new Response(
      JSON.stringify(generatedContent),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in generate-learning-content:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
