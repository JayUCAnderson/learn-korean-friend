
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TOPIK_LEVEL_GUIDELINES = {
  'beginner': {
    maxNewVocab: 8,
    sentenceLength: "~8-10 words",
    grammar: "Basic sentence structures; simple tenses without complex connectors",
    vocabulary: "Approximately 800 words focused on everyday and concrete topics"
  },
  'intermediate': {
    maxNewVocab: 12,
    sentenceLength: "~12-15 words",
    grammar: "Combination of simple and compound sentences; beginning use of connectors",
    vocabulary: "Approximately 3,000 words including some abstract vocabulary"
  },
  'advanced': {
    maxNewVocab: 15,
    sentenceLength: "~15-20 words",
    grammar: "Complex connectors, reported speech, and advanced honorifics",
    vocabulary: "Approximately 5,000+ words including formal and specialized terms"
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      console.error("OpenAI API key is not set");
      throw new Error("OpenAI API key is not configured");
    }

    const { interest, level, contentType } = await req.json();
    console.log("Received request with:", { interest, level, contentType });

    const difficulty = TOPIK_LEVEL_GUIDELINES[level];
    if (!difficulty) {
      console.error("Invalid level provided:", level);
      throw new Error("Invalid difficulty level");
    }

    console.log("Using difficulty parameters:", difficulty);
    
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
            content: `You are a Korean language education expert creating content at the ${level} level. Follow these guidelines:
- Maximum new vocabulary: ${difficulty.maxNewVocab} words
- Sentence length: ${difficulty.sentenceLength}
- Grammar focus: ${difficulty.grammar}
- Vocabulary scope: ${difficulty.vocabulary}

Generate a response in this exact JSON format:
{
  "title": "string (specific, unique title capturing the key learning point)",
  "description": "string (clear explanation of lesson objectives)",
  "content": {
    "content": "string (the main lesson content)",
    "vocabulary": [
      {
        "korean": "string",
        "english": "string",
        "pronunciation": "string",
        "partOfSpeech": "string"
      }
    ]
  }
}`
          },
          {
            role: 'user',
            content: `Create an engaging Korean lesson about ${interest}. Focus on practical usage while maintaining ${level} level difficulty.`
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

    const content = JSON.parse(data.choices[0].message.content);
    console.log("Successfully parsed content");

    // Generate image prompt based on the title and description
    const imagePrompt = `Create an engaging educational illustration for a Korean language lesson titled "${content.title}" that captures the essence of learning about ${interest} at a ${level} level.`;

    return new Response(
      JSON.stringify({ content, imagePrompt }),
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
