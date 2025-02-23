
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
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

    // Generate a concise, image-focused prompt
    const defaultStyleSuffix = "Render in a minimalist Korean design style with clean lines and soft colors"
    const finalPrompt = basePrompt 
      ? `${basePrompt}. ${defaultStyleSuffix}`
      : `Create a simple, iconic illustration that helps remember the Korean ${characterType} "${character}". ${defaultStyleSuffix}`

    console.log('Generating new mnemonic image with prompt:', finalPrompt)

    const falApiKey = Deno.env.get('FAL_AI_API_KEY')
    if (!falApiKey) {
      throw new Error('FAL_AI_API_KEY is not configured')
    }

    const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${falApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        go_fast: true,
        height: 512,
        width: 512,
        num_outputs: 1,
        num_inference_steps: 20,
        guidance_scale: 7.5,
        output_format: "webp",
        negative_prompt: "text, words, letters, blurry, complex, confusing",
        output_quality: 80,
        aspect_ratio: "1:1",
        megapixels: "1"
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
