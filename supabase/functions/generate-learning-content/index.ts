
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

    // First, generate the lesson title and description
    const titleDescResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are a Korean language tutor creating engaging lesson titles and descriptions. 
            Generate a title and description for a Korean language lesson about ${interest} for ${level} level students.
            Make them natural, engaging, and specific to the topic. The title should be concise (max 50 chars) and the description
            should be 1-2 sentences (max 150 chars). Respond in JSON format with "title" and "description" fields.`
          },
        ],
        temperature: 0.7,
      }),
    });

    const titleDescData = await titleDescResponse.json();
    const { title, description } = JSON.parse(titleDescData.choices[0].message.content);
    
    // Then generate the lesson content
    const contentResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: "You are a Korean language tutor specializing in creating personalized learning content. " +
                    "Your responses should be structured, educational, and engaging. " +
                    "Always include Korean text (in Hangul), romanization, and English translations. " +
                    "Format responses in clear sections for easy reading and learning."
          },
          { 
            role: 'user', 
            content: `Create a ${contentType} lesson about ${interest} for ${level} level students. Include relevant vocabulary and phrases.` 
          }
        ],
        temperature: 0.7,
      }),
    });

    const contentData = await contentResponse.json();
    const generatedContent = {
      title,
      description,
      content: contentData.choices[0].message.content,
      metadata: {
        model: 'gpt-4o-mini',
        interest,
        level,
        contentType,
        timestamp: new Date().toISOString()
      }
    };

    console.log("Successfully generated content with title:", title);

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
