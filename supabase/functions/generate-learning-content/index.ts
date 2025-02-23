
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define TOPIK level guidelines
const TOPIK_LEVEL_GUIDELINES = {
  topik1: {
    maxNewVocab: 8,
    sentenceLength: "~8-10 words",
    grammar: "Basic sentence structures; simple tenses without complex connectors",
    vocabulary: "Approximately 800 words focused on everyday and concrete topics"
  },
  topik2: {
    maxNewVocab: 10,
    sentenceLength: "~10-12 words",
    grammar: "Simple sentences with basic connectors; clear distinction between formal and informal expressions",
    vocabulary: "Approximately 1,500-2,000 words covering common daily situations"
  },
  topik4: {
    maxNewVocab: 15,
    sentenceLength: "~15-20 words",
    grammar: "Use of complex connectors (e.g., -는데, -니까), reported speech, and moderate honorifics in compound sentences",
    vocabulary: "Approximately 4,000 words including abstract concepts and formal language"
  }
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { interest, level, contentType } = await req.json();
    console.log("Generating content for:", { interest, level, contentType });
    
    // Map user level to TOPIK level
    let topikLevel: keyof typeof TOPIK_LEVEL_GUIDELINES;
    if (level === 'beginner') {
      topikLevel = 'topik1';
    } else if (level === 'intermediate') {
      topikLevel = 'topik2';
    } else if (level === 'advanced') {
      topikLevel = 'topik4';
    } else {
      // default to beginner if unrecognized
      topikLevel = 'topik1';
    }

    const guidelines = TOPIK_LEVEL_GUIDELINES[topikLevel];
    console.log("Using TOPIK guidelines:", guidelines);

    const systemPrompt = `You are a Korean language education expert creating scientifically-based, engaging, and practical lessons tailored to the user's interest in "${interest}". 
Follow these principles:
- Progressive Complexity: Begin with extremely simple language and gradually build complexity.
- Contextual Learning: Present vocabulary and grammar within realistic, everyday situations.
- Cultural Integration: Seamlessly incorporate relevant cultural context.
- Clear Structure: Organize the lesson with a logical flow and explicit connections.
- Engaging and Unique: Ensure the title and description are unique and directly related to the user's interest.

For this lesson, adhere to the following TOPIK guidelines for ${topikLevel.toUpperCase()}:
- Maximum new vocabulary: ${guidelines.maxNewVocab} words
- Sentence length: ${guidelines.sentenceLength}
- Grammar focus: ${guidelines.grammar}
- Vocabulary scope: ${guidelines.vocabulary}

Return ONLY a JSON object without any markdown formatting or code block indicators, using this exact structure:
{
  "title": "Unique, specific title capturing the lesson's focus",
  "description": "Clear, engaging description outlining the lesson's objectives and its real-life relevance",
  "dialogue": [
    {
      "speaker": "Name",
      "gender": "male|female",
      "koreanText": "Korean dialogue",
      "englishText": "English translation",
      "notes": "Pronunciation or cultural notes"
    }
  ],
  "vocabulary": [
    {
      "korean": "Korean word",
      "english": "English meaning",
      "pronunciation": "Romanization",
      "contextualUsage": "Example sentence or usage context"
    }
  ],
  "exercises": [
    {
      "type": "multiple-choice | fill-in-blank | matching",
      "question": "Question text",
      "options": ["Option1", "Option2"],
      "correctAnswer": "Correct answer"
    }
  ],
  "cultural_notes": ["Cultural context points"],
  "review_suggestions": ["Practical review activities"],
  "imagePrompt": "Short, focused description for visual representation"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Create an engaging ${level} level Korean lesson about "${interest}". Return ONLY the JSON object without any markdown formatting or code block indicators.`
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

    // Clean the response to ensure it's valid JSON
    let content = data.choices[0].message.content.trim();
    // Remove any markdown code block indicators if present
    content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    
    try {
      const parsedContent = JSON.parse(content);
      console.log("Successfully parsed content:", parsedContent);

      if (!parsedContent.title) {
        throw new Error("Generated content is missing required title");
      }

      return new Response(
        JSON.stringify({ content: parsedContent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.log("Raw content that failed to parse:", content);
      throw new Error(`Failed to parse OpenAI response: ${parseError.message}`);
    }

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
