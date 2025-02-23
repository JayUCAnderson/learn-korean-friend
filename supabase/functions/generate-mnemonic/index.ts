
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { character, basePrompt, characterType } = await req.json()

    if (!character) {
      throw new Error('No character provided')
    }

    console.log('Generating mnemonic image for character:', character)
    console.log('Base prompt:', basePrompt)

    const falApiKey = Deno.env.get('FAL_AI_API_KEY')
    if (!falApiKey) {
      throw new Error('FAL_AI_API_KEY is not configured')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration')
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // First check for existing image
    console.log('Checking for existing mnemonic image...')
    const { data: existingImage, error: existingError } = await supabase
      .from('mnemonic_images')
      .select('id, image_url')
      .eq('character', character)
      .maybeSingle()

    if (existingError) {
      console.error('Error checking existing image:', existingError)
      throw existingError
    }

    if (existingImage?.image_url) {
      console.log('Found existing image:', existingImage.image_url)
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

    // Generate new image
    console.log('No existing image found, generating new one...')
    const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: basePrompt,
        height: 512,
        width: 512,
        num_inference_steps: 20,
        guidance_scale: 7.5,
        negative_prompt: "text, words, letters, blurry, complex, confusing",
        output_format: "webp",
        output_quality: 80,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Fal AI Error Response:', errorText)
      throw new Error(`Fal AI request failed: ${response.status} ${errorText}`)
    }

    const imageData = await response.json()
    const imageUrl = imageData.images?.[0]?.url

    if (!imageUrl) {
      throw new Error('No image URL received from Fal AI')
    }

    console.log('Successfully generated image:', imageUrl)

    // Store the generated image
    const { data: insertedImage, error: insertError } = await supabase
      .from('mnemonic_images')
      .insert({
        character,
        image_url: imageUrl,
        prompt: basePrompt
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
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
