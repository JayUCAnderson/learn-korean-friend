
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { interest, level, contentType } = await req.json();
    console.log("Received request with:", { interest, level, contentType });

    if (!openAIApiKey) {
      console.error("OpenAI API key is not set");
      throw new Error("OpenAI API key is not configured");
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
            content: `You are a Korean language education expert creating content at the ${level} level. Generate content that includes:
- A specific, unique title capturing the key learning point
- A clear explanation of lesson objectives
- Main lesson content focused on practical usage
- A curated list of vocabulary words with translations and pronunciations
- An image prompt that will help create visual aids for learning

Respond with a JSON object containing:
{
  "title": "string",
  "description": "string",
  "content": {
    "content": "string",
    "vocabulary": [
      {
        "korean": "string",
        "english": "string",
        "pronunciation": "string",
        "partOfSpeech": "string"
      }
    ]
  },
  "imagePrompt": "string"
}`
          },
          {
            role: 'user',
            content: `Create an engaging Korean lesson about ${interest} suitable for ${level} level students.`
          }
        ],
        temperature: 0.7,
      }),
    });

    console.log("OpenAI response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Received data from OpenAI");

    if (!data.choices?.[0]?.message?.content) {
      console.error("Invalid response structure from OpenAI:", data);
      throw new Error("Invalid response from OpenAI");
    }

    const generatedContent = JSON.parse(data.choices[0].message.content);
    console.log("Successfully parsed content");

    // Enhance the image prompt with Korean cultural elements if it exists
    if (generatedContent.imagePrompt) {
      generatedContent.imagePrompt = `Create a scene that showcases ${generatedContent.imagePrompt} while incorporating traditional Korean cultural elements. Use a vibrant color palette inspired by hanbok and temple architecture, balanced with modern aesthetics.`;
    }

    if (!generatedContent.title || !generatedContent.description) {
      throw new Error('Generated content missing required fields');
    }

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
