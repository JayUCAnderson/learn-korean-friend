
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { character, basePrompt, characterType } = await req.json()

    if (!character) {
      throw new Error('No character provided')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration')
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if we already have a mnemonic image for this character
    const { data: existingImage } = await supabase
      .from('mnemonic_images')
      .select('id, image_url')
      .eq('character', character)
      .single()

    if (existingImage?.image_url) {
      console.log('Using existing mnemonic image for character:', character)
      return new Response(
        JSON.stringify({ 
          imageUrl: existingImage.image_url,
          imageId: existingImage.id 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Generate mnemonic image using Fal AI flux/schnell model
    const falApiKey = Deno.env.get('FAL_AI_API_KEY')
    if (!falApiKey) {
      throw new Error('FAL_AI_API_KEY is not configured')
    }

    const defaultPrompt = `Create a memorable, simple cartoon drawing that helps remember the Korean ${characterType} "${character}". The image should be clear, focused on a single concept, and use simple lines and shapes.`
    const finalPrompt = basePrompt ? `${basePrompt} for the Korean character "${character}"` : defaultPrompt

    console.log('Generating new mnemonic image with prompt:', finalPrompt)

    const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        go_fast: true,
        megapixels: "1",
        num_outputs: 1,
        aspect_ratio: "1:1",
        output_format: "webp",
        output_quality: 80,
        num_inference_steps: 4
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Fal AI Error:', errorText)
      throw new Error(`Failed to generate image: ${errorText}`)
    }

    const imageData = await response.json()
    const imageUrl = imageData.images?.[0]?.url

    if (!imageUrl) {
      throw new Error('No image URL received from Fal AI')
    }

    // Store the generated image URL in the database
    const { data: insertedImage, error: insertError } = await supabase
      .from('mnemonic_images')
      .insert({
        character: character,
        image_url: imageUrl,
        prompt: finalPrompt
      })
      .select('id, image_url')
      .single()

    if (insertError) {
      console.error('Database insertion error:', insertError)
      throw insertError
    }

    return new Response(
      JSON.stringify({ 
        imageUrl: insertedImage.image_url,
        imageId: insertedImage.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
