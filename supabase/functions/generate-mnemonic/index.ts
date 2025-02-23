
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    
    const enhancedPrompt = `Create a memorable, visual mnemonic image to help remember the Korean character "${character}". The image should: ${basePrompt}`
    
    // Call fal.ai API
    const response = await fetch('https://110602490-fast-sdxl.fal.run', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        image_size: "square_hd",
        num_images: 1,
      }),
    })

    if (!response.ok) {
      throw new Error(`Fal.ai API error: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('Image generation result:', result)
    
    if (!result.images?.[0]) {
      throw new Error('No image generated')
    }

    // Store result in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseServiceRole) throw new Error('Supabase credentials not found')
    
    const supabase = createClient(supabaseUrl, supabaseServiceRole)
    
    const { data: imageRecord, error: insertError } = await supabase
      .from('mnemonic_images')
      .insert({
        image_url: result.images[0],
        prompt: enhancedPrompt,
      })
      .select('id')
      .single()

    if (insertError) throw insertError

    const { error: updateError } = await supabase
      .from('hangul_lessons')
      .update({ mnemonic_image_id: imageRecord.id })
      .eq('character', character)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: result.images[0],
        imageId: imageRecord.id
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
