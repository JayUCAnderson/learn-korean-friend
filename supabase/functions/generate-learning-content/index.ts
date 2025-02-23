
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Available voices for matching with dialogues
const FEMALE_VOICES = [
  { name: 'Jennie', id: 'z6Kj0hecH20CdetSElRT' },
  { name: 'JiYoung', id: 'AW5wrnG1jVizOYY7R1Oo' },
  { name: 'Anna', id: 'uyVNoMrnUku1dZyVEXwD' }
];

const MALE_VOICES = [
  { name: 'Min-Joon', id: 'nbrxrAz3eYm9NgojrmFK' },
  { name: 'Yohan', id: '4JJwo477JUAx3HV0T7n7' },
  { name: 'June', id: '3MTvEr8xCMCC2mL9ujrI' }
];

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
            content: `You are a Korean language tutor creating scientifically-based language learning content. Follow these principles:

1. Progressive Complexity: Introduce concepts from simple to complex
2. Spaced Repetition: Reintroduce previously learned vocabulary naturally
3. Contextual Learning: Present vocabulary and grammar in realistic situations
4. Frequency-Based Selection: Prioritize common, useful expressions
5. Cultural Integration: Include cultural context when relevant

Generate a lesson in JSON format with this structure:
{
  "title": "string (max 50 chars)",
  "description": "string (max 150 chars)",
  "setting": "string describing the conversation context",
  "difficulty_level": "number (1-5)",
  "target_skills": ["listening", "speaking", "reading", "writing"],
  "key_points": ["string"],
  "dialogue": [
    {
      "speaker": "string (specify name from list: ${[...FEMALE_VOICES, ...MALE_VOICES].map(v => v.name).join(', ')})",
      "gender": "string (must be 'male' or 'female')",
      "koreanText": "string (Korean dialogue)",
      "englishText": "string (English translation)",
      "notes": "string (optional pronunciation or cultural notes)"
    }
  ],
  "vocabulary": [
    {
      "korean": "string (Korean word)",
      "english": "string (English meaning)",
      "pronunciation": "string (romanization)",
      "partOfSpeech": "string (noun/verb/etc)",
      "difficulty": "number (1-5)",
      "contextualUsage": "string (example usage)",
      "relatedWords": ["string"]
    }
  ],
  "exercises": [
    {
      "type": "multiple-choice | fill-in-blank | matching",
      "question": "string",
      "options": ["string"],
      "correctAnswer": "string",
      "explanation": "string"
    }
  ],
  "cultural_notes": ["string"],
  "review_suggestions": ["string"]
}`
          },
          {
            role: 'user',
            content: `Create an engaging ${level} level Korean lesson about ${interest}. Include natural dialogue, essential vocabulary, and practice exercises. Focus on practical, everyday usage while maintaining appropriate difficulty for the level.`
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const generatedContent = JSON.parse(data.choices[0].message.content);
    
    // Match voice IDs to speakers
    generatedContent.dialogue = generatedContent.dialogue.map((entry: any) => {
      const voiceList = entry.gender === 'female' ? FEMALE_VOICES : MALE_VOICES;
      const voice = voiceList.find(v => v.name === entry.speaker) || voiceList[0];
      return {
        ...entry,
        voiceId: voice.id
      };
    });

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
