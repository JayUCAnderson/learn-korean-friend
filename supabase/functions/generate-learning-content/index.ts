
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TOPIK_LEVEL_GUIDELINES = {
  'topik1': {
    maxNewVocab: 8,
    sentenceLength: "~8-10 words",
    grammar: "Basic sentence structures; simple tenses without complex connectors",
    vocabulary: "Approximately 800 words focused on everyday and concrete topics"
  },
  'topik2': {
    maxNewVocab: 10,
    sentenceLength: "~10-12 words",
    grammar: "Simple sentences with basic connectors; clear distinction between formal and informal expressions",
    vocabulary: "Approximately 1,500-2,000 words covering common daily situations"
  },
  'topik3': {
    maxNewVocab: 12,
    sentenceLength: "~12-15 words",
    grammar: "Combination of simple and compound sentences; beginning use of connectors and basic reported speech",
    vocabulary: "Approximately 3,000 words including some abstract and situational vocabulary"
  },
  'topik4': {
    maxNewVocab: 15,
    sentenceLength: "~15-20 words",
    grammar: "Use of complex connectors (e.g., -는데, -니까), reported speech, and moderate honorifics in compound sentences",
    vocabulary: "Approximately 4,000 words including abstract concepts and formal language"
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { interest, level, contentType } = await req.json();
    console.log("Generating content for:", { interest, level, contentType });

    // Map user level to TOPIK level
    const topikLevel = level === 'beginner' ? 'topik1' : 
                      level === 'intermediate' ? 'topik2' : 'topik3';
    
    const difficultyParams = TOPIK_LEVEL_GUIDELINES[topikLevel];
    console.log("Using TOPIK level parameters:", difficultyParams);

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
            content: `You are a Korean language education expert creating scientifically-based, engaging content. Follow these principles:

1. Progressive Complexity: Start extremely simple and gradually build up
2. Contextual Learning: Present vocabulary and grammar in realistic, relatable situations
3. Cultural Integration: Weave in cultural context naturally
4. Clear Structure: Organize content logically with explicit connections
5. Scaffolding: Support new concepts with familiar elements

For ${level} level content about ${interest}, follow these specific TOPIK guidelines:
- Maximum new vocabulary: ${difficultyParams.maxNewVocab} words
- Sentence length: ${difficultyParams.sentenceLength}
- Grammar focus: ${difficultyParams.grammar}
- Vocabulary scope: ${difficultyParams.vocabulary}

Generate a lesson in JSON format with this structure:
{
  "title": "unique, specific title that captures the key learning point",
  "description": "clear, specific description of what will be learned and how it connects to real-life usage",
  "dialogue": [
    {
      "speaker": "string (specify name)",
      "koreanText": "Korean dialogue",
      "englishText": "English translation",
      "notes": "pronunciation/cultural notes"
    }
  ],
  "vocabulary": [
    {
      "korean": "Korean word",
      "english": "English meaning",
      "pronunciation": "romanization",
      "contextualUsage": "example usage"
    }
  ],
  "exercises": [
    {
      "type": "multiple-choice | fill-in-blank | matching",
      "question": "question text",
      "options": ["array of options"],
      "correctAnswer": "correct answer"
    }
  ],
  "cultural_notes": ["cultural context points"],
  "review_suggestions": ["practical review activities"],
  "imagePrompt": "Generate a short, focused description based on the title's unique aspects for visual representation. This should capture the essence of the lesson's topic and learning goal."
}`
          },
          {
            role: 'user',
            content: `Create an engaging ${level} level Korean lesson about ${interest}. Focus on practical, everyday usage while maintaining appropriate difficulty for the level. Make the title and description specific and unique to this particular lesson's content.`
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log("OpenAI response:", data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    const generatedContent = JSON.parse(data.choices[0].message.content);
    console.log("Successfully parsed generated content:", generatedContent);

    // Store only the original image prompt from OpenAI
    const imagePrompt = generatedContent.imagePrompt || '';
    delete generatedContent.imagePrompt; // Remove it from the content to be stored

    if (!generatedContent.title || !generatedContent.description) {
      throw new Error('Generated content missing required fields');
    }

    // Return both the content and the original image prompt separately
    return new Response(
      JSON.stringify({ 
        content: generatedContent,
        imagePrompt: imagePrompt 
      }),
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
