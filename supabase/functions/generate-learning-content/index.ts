
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DIFFICULTY_MAPPINGS = {
  'beginner': {
    maxNewVocab: 5,
    sentenceLength: 'very short (2-3 words)',
    grammar: 'basic particles (은/는, 이/가) and simple verb endings (-어/아요)',
  },
  'intermediate': {
    maxNewVocab: 8,
    sentenceLength: 'short to medium (3-5 words)',
    grammar: 'past tense, connectors (고, 지만), and basic honorifics',
  },
  'advanced': {
    maxNewVocab: 12,
    sentenceLength: 'natural length',
    grammar: 'all grammar patterns appropriate to context',
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { interest, level, contentType } = await req.json();
    console.log("Generating content for:", { interest, level, contentType });

    // Determine difficulty parameters
    const difficultyParams = DIFFICULTY_MAPPINGS[level.toLowerCase()] || DIFFICULTY_MAPPINGS.beginner;

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

For ${level} level content about ${interest}, follow these specific guidelines:
- Maximum new vocabulary: ${difficultyParams.maxNewVocab} words
- Sentence length: ${difficultyParams.sentenceLength}
- Grammar focus: ${difficultyParams.grammar}

Generate a lesson in JSON format with this structure:
{
  "title": "unique, specific title incorporating the topic and key learning point",
  "description": "clear, specific description of what will be learned and how it connects to real-life usage",
  "setting": "specific context where the dialogue takes place",
  "dialogue": [
    {
      "speaker": "string (specify name)",
      "gender": "male or female",
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
  "imagePrompt": "Design/create a scene showing ${interest} that blends traditional Korean cultural elements with modern K-pop aesthetics. Use a vibrant color palette inspired by hanbok and temple architecture"
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
