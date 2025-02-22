
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
            content: `You are a Korean language tutor creating personalized lessons. Generate a lesson in JSON format with the following structure:
            {
              "title": "string (max 50 chars)",
              "description": "string (max 150 chars)",
              "setting": "string describing the conversation context",
              "dialogue": [
                {
                  "speaker": "string (character name)",
                  "koreanText": "string (Korean dialogue)",
                  "englishText": "string (English translation)"
                }
              ],
              "vocabulary": [
                {
                  "korean": "string (Korean word)",
                  "english": "string (English meaning)",
                  "pronunciation": "string (romanization)",
                  "partOfSpeech": "string (noun/verb/etc)",
                  "difficulty": "number (1-5)"
                }
              ],
              "exercises": [
                {
                  "type": "multiple-choice",
                  "question": "string",
                  "options": ["string"],
                  "correctAnswer": "string",
                  "explanation": "string"
                }
              ]
            }`
          },
          {
            role: 'user',
            content: `Create an engaging ${level} level Korean lesson about ${interest}. Include natural dialogue, essential vocabulary, and practice exercises.`
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const generatedContent = JSON.parse(data.choices[0].message.content);

    console.log("Successfully generated content with title:", generatedContent.title);

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
