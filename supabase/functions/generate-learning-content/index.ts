
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateDialogue(interest: string, level: string) {
  console.log("Generating dialogue for:", { interest, level });
  
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
          content: `You are a Korean language education expert creating natural, engaging dialogues for language learners.
          
          Create an extended, natural dialogue about "${interest}" that:
          - Has 8-10 back-and-forth exchanges between two speakers
          - Uses realistic, natural conversation flows
          - Gradually introduces new vocabulary and grammar patterns
          - Maintains appropriate language level for ${level} learners
          - Includes cultural context when relevant
          
          Return ONLY a JSON object with this structure:
          {
            "dialogue": [
              {
                "speaker": "Name",
                "gender": "male|female",
                "koreanText": "Korean dialogue line",
                "englishText": "English translation",
                "notes": "Optional pronunciation or cultural notes"
              }
            ]
          }`
        }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    console.error("OpenAI API error in dialogue generation:", response.status);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  console.log("Received dialogue response from OpenAI");
  const dialogueContent = JSON.parse(data.choices[0].message.content.trim());
  return dialogueContent.dialogue;
}

async function generateLessonContent(interest: string, level: string, dialogue: any) {
  console.log("Generating lesson content based on dialogue");
  
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
          content: `You are a Korean language education expert creating comprehensive lesson content based on an existing dialogue.
          
          Analyze the provided dialogue and create supplementary learning materials that:
          - Extract key vocabulary and grammar points
          - Provide clear explanations and examples
          - Include relevant cultural context
          - Match the ${level} skill level
          
          Return ONLY a JSON object with this structure:
          {
            "title": "Unique, specific title capturing the lesson's focus",
            "description": "Clear description outlining objectives and real-life relevance",
            "vocabulary": [
              {
                "korean": "Korean word",
                "english": "English meaning",
                "pronunciation": "Romanization",
                "contextualUsage": "Example sentence or usage context"
              }
            ],
            "cultural_notes": ["Cultural context points"],
            "review_suggestions": ["Practical review activities"]
          }`
        },
        {
          role: 'user',
          content: JSON.stringify({ dialogue, interest, level })
        }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    console.error("OpenAI API error in lesson content generation:", response.status);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  console.log("Received lesson content response from OpenAI");
  return JSON.parse(data.choices[0].message.content.trim());
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { interest, level, contentType } = await req.json();
    console.log("Generating content for:", { interest, level, contentType });

    // Step 1: Generate the dialogue first
    const dialogue = await generateDialogue(interest, level);
    console.log("Generated dialogue with", dialogue.length, "exchanges");

    // Step 2: Generate the rest of the lesson content based on the dialogue
    const lessonContent = await generateLessonContent(interest, level, dialogue);
    console.log("Generated lesson content with title:", lessonContent.title);

    // Combine the results
    const finalContent = {
      ...lessonContent,
      dialogue
    };

    return new Response(
      JSON.stringify({ content: finalContent }),
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
