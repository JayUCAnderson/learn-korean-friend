
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TOPIK_GUIDELINES = {
  beginner: {
    sentenceLength: "~8-10 words",
    grammar: "Basic sentence structures; simple tenses without complex connectors",
    vocabulary: "Approximately 800 words focused on everyday and concrete topics"
  },
  intermediate: {
    sentenceLength: "~12-15 words",
    grammar: "Combination of simple and compound sentences; beginning use of connectors and basic reported speech",
    vocabulary: "Approximately 3,000 words including some abstract and situational vocabulary"
  },
  advanced: {
    sentenceLength: "~20-25 words",
    grammar: "Advanced grammatical structures with nuanced connectors, subordinate clauses, and refined honorific usage",
    vocabulary: "Approximately 6,000 words covering technical, academic, and professional topics"
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { interest, level, contentType } = await req.json();
    console.log("Generating content for:", { interest, level, contentType });

    const guidelines = TOPIK_GUIDELINES[level as keyof typeof TOPIK_GUIDELINES] || TOPIK_GUIDELINES.beginner;
    
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
            content: `You are a Korean language education expert crafting engaging dialogue-based lessons. 
            
Level Guidelines:
- Sentence Length: ${guidelines.sentenceLength}
- Grammar Complexity: ${guidelines.grammar}
- Vocabulary Range: ${guidelines.vocabulary}

Create a unique lesson that:
1. Has a specific, memorable title related to ${interest}
2. Includes a clear, focused description of what will be learned
3. Features a natural dialogue between two speakers
4. Introduces 5-8 relevant vocabulary words
5. Generates one image prompt to illustrate a key scene

Format the response as a JSON object with:
{
  "title": "Unique, specific title",
  "description": "Clear learning objectives and context",
  "content": {
    "setting": "Brief scene description",
    "dialogue": [
      {
        "speaker": "Name",
        "koreanText": "Korean dialogue",
        "englishText": "English translation"
      }
    ],
    "vocabulary": [
      {
        "korean": "word",
        "english": "translation",
        "pronunciation": "romanization",
        "partOfSpeech": "grammar category"
      }
    ]
  },
  "imagePrompt": "Detailed scene description for image generation"
}`
          },
          {
            role: 'user',
            content: `Create a Korean lesson about ${interest} for ${level} level students. Make the title and description unique and specific to this particular lesson, not generic.`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI API error:", response.status);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Received response from OpenAI");

    if (!data.choices?.[0]?.message?.content) {
      console.error("Invalid response structure from OpenAI:", data);
      throw new Error("Invalid response from OpenAI");
    }

    const content = JSON.parse(data.choices[0].message.content);
    console.log("Successfully parsed content:", content);

    return new Response(
      JSON.stringify(content),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in generate-learning-content function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
