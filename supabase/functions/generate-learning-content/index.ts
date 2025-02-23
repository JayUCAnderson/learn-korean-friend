
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VOICE_OPTIONS = {
  female: ['AW5wrnG1jVizOYY7R1Oo', 'z6Kj0hecH20CdetSElRT'],
  male: ['nbrxrAz3eYm9NgojrmFK', '4JJwo477JUAx3HV0T7n7']
};

interface LearningContext {
  fundamentalVocab: string[];
  interestVocab: string[];
  knownStructures: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { interest, level, contentType } = await req.json();

    console.log("Generating content for:", { interest, level, contentType });

    // Structure the prompt to get scientifically-backed lesson structure
    const prompt = `Generate a Korean language lesson focused on "${interest}" for a ${level} level student.
    Follow these principles:
    1. Introduce 7±2 new vocabulary items (Miller's Law for cognitive load)
    2. Include 60% known material and 40% new material (Krashen's i+1 theory)
    3. Follow spaced repetition intervals for review
    4. Use comprehensible input theory - context before grammar
    5. Structure the content for both implicit and explicit learning

    The lesson should include:
    - A dialogue incorporating the target vocabulary and grammar
    - Cultural context relevant to ${interest}
    - Practice exercises following the topic progression
    - Assessment aligned with TOPIK test formats

    Format the response as a structured JSON object.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert Korean language curriculum designer.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate content');
    }

    const data = await response.json();
    const lessonContent = JSON.parse(data.choices[0].message.content);

    // Generate audio content for dialogue sections
    const dialogueAudio = await Promise.all(
      lessonContent.dialogue.map(async (part: any) => {
        const voiceId = VOICE_OPTIONS[part.speaker.includes('여자') ? 'female' : 'male'][0];
        
        const audioResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('ELEVEN_LABS_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: part.koreanText,
            voice_settings: {
              stability: 0.75,
              similarity_boost: 0.75
            }
          })
        });

        if (!audioResponse.ok) {
          console.error('Error generating audio for dialogue part:', part);
          return null;
        }

        const audioBuffer = await audioResponse.arrayBuffer();
        return {
          speaker: part.speaker,
          audioContent: Buffer.from(audioBuffer).toString('base64')
        };
      })
    );

    // Structure the final lesson content
    const finalContent = {
      title: lessonContent.title,
      description: lessonContent.description,
      content: {
        ...lessonContent,
        dialogue: lessonContent.dialogue.map((part: any, index: number) => ({
          ...part,
          audioContent: dialogueAudio[index]?.audioContent
        })),
        metadata: {
          level,
          topic: interest,
          targetVocabulary: lessonContent.vocabulary.map((v: any) => ({
            korean: v.korean,
            english: v.english,
            difficulty: v.difficulty || 'normal'
          }))
        }
      }
    };

    console.log("Successfully generated lesson content");

    return new Response(JSON.stringify(finalContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error generating content:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
