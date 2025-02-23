
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TOPIK_LEVEL_GUIDELINES = {
  'topik1': {
    maxNewVocab: 5,
    sentenceLength: '~5 words max',
    grammar: 'Basic particles (은/는, 이/가, 을/를), simple present tense (-아/어요), basic questions (-이에요/예요), numbers (1-100)',
    vocabulary: '800 basic words focused on daily life',
  },
  'topik2': {
    maxNewVocab: 8,
    sentenceLength: '~8 words',
    grammar: 'Past tense (-았/었어요), future tense (-을 거예요), basic connectors (-고, -지만), giving reasons (-아/어서)',
    vocabulary: '1,500-2,000 words including daily life, hobbies, and basic emotions',
  },
  'topik3': {
    maxNewVocab: 10,
    sentenceLength: '~12 words',
    grammar: 'Complex connectors (-는데, -니까), reported speech, honorifics, desires (-고 싶다)',
    vocabulary: '2,000-3,000 words including abstract concepts and formal situations',
  },
  'topik4': {
    maxNewVocab: 12,
    sentenceLength: 'natural length',
    grammar: 'Advanced grammatical patterns, passive/causative, formal writing styles',
    vocabulary: '3,000-4,000 words including academic and professional contexts',
  }
};

serve(async (req) => {
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

    // Transform the image prompt to be surrounded by the hardcoded context
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
