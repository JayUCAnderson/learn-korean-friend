
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { character } = await req.json()

    if (!character) {
      throw new Error('No character provided')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if we already have a mnemonic image for this character
    const { data: existingImage } = await supabase
      .from('mnemonic_images')
      .select('image_url')
      .eq('character', character)
      .single()

    if (existingImage?.image_url) {
      return new Response(
        JSON.stringify({ image_url: existingImage.image_url }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Generate mnemonic image using Fal AI
    const falApiKey = Deno.env.get('FAL_AI_API_KEY')
    const prompt = `Create a memorable, simple cartoon drawing that helps remember the Korean letter "${character}". The image should be clear and focused on a single concept.`

    const response = await fetch('https://fal.run/fal-ai/fast-sdxl', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        image_size: "512x512",
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate image')
    }

    const imageData = await response.json()
    const imageUrl = imageData.images[0].url

    // Store the generated image URL in the database
    const { error: insertError } = await supabase
      .from('mnemonic_images')
      .insert({
        character: character,
        image_url: imageUrl,
        prompt: prompt
      })

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({ image_url: imageUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

