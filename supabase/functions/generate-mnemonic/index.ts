
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { fal } from 'https://esm.sh/@fal-ai/client@0.8.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const falApiKey = Deno.env.get('FAL_AI_API_KEY')
  if (!falApiKey) {
    console.error('FAL_AI_API_KEY not found')
    return new Response(
      JSON.stringify({ error: 'API key not configured' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  try {
    const { character, basePrompt } = await req.json()
    
    // Configure fal client
    fal.config({ credentials: falApiKey });

    // First check if we already have a mnemonic image for this character
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseServiceRole) throw new Error('Supabase credentials not found')
    
    const supabase = createClient(supabaseUrl, supabaseServiceRole)
    
    // Check if mnemonic image already exists
    const { data: existingImage } = await supabase
      .from('mnemonic_images')
      .select('id, image_url')
      .eq('character', character)
      .maybeSingle()

    if (existingImage) {
      console.log('Found existing mnemonic image:', existingImage)
      return new Response(
        JSON.stringify({ 
          success: true, 
          imageUrl: existingImage.image_url,
          imageId: existingImage.id,
          isNew: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate a structured prompt for the mnemonic image
    const structuredPrompt = generateMnemonicPrompt(character, basePrompt)
    console.log('Generated prompt:', structuredPrompt)

    // Generate image using fal.ai Flux model
    const result = await fal.subscribe('fal-ai/flux/schnell', {
      input: {
        prompt: structuredPrompt,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    })

    if (!result.data?.images?.[0]) {
      throw new Error('No image generated')
    }

    const imageUrl = result.data.images[0]
    console.log('Generated image URL:', imageUrl)
    
    // Store result in Supabase
    const { data: imageRecord, error: insertError } = await supabase
      .from('mnemonic_images')
      .insert({
        image_url: imageUrl,
        prompt: structuredPrompt,
        character: character
      })
      .select('id')
      .single()

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: imageUrl,
        imageId: imageRecord.id,
        isNew: true,
        requestId: result.requestId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-mnemonic function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function generateMnemonicPrompt(character: string, basePrompt: string): string {
  // Create a structured prompt template for mnemonic images
  const promptTemplate = `Create a memorable visual mnemonic for the Korean character "${character}". 
The image should be clear, distinctive, and help learners remember both the shape and sound of the character.

Requirements:
- The Korean character should be visually incorporated into the scene
- Image should be high quality, clear, and focused
- Use vibrant colors and contrasting elements
- Create a simple, uncluttered composition
- Ensure the image is culturally appropriate

Additional context: ${basePrompt}

Style specifications:
- Photographic quality
- Clear lighting
- Sharp focus
- Simple background
- Center composition`

  return promptTemplate
}
