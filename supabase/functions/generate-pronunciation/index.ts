
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { character } = await req.json()

    if (!character) {
      throw new Error('Character is required')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if pronunciation already exists
    const { data: existingPronunciation, error: fetchError } = await supabaseClient
      .from('character_pronunciations')
      .select('audio_content')
      .eq('character', character)
      .single()

    if (fetchError) {
      console.error('Error fetching existing pronunciation:', fetchError)
    }

    if (existingPronunciation?.audio_content) {
      console.log('Using cached pronunciation for character:', character)
      return new Response(
        JSON.stringify({ audioContent: existingPronunciation.audio_content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Generating new pronunciation for character:', character)
    
    // Generate new pronunciation using ElevenLabs API
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/pFZP5JQG7iQjIQuC4Bku', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': Deno.env.get('ELEVEN_LABS_API_KEY') || '',
      },
      body: JSON.stringify({
        text: character,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.85,
          similarity_boost: 0.75,
        }
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate pronunciation')
    }

    // Convert audio buffer to base64
    const arrayBuffer = await response.arrayBuffer()
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    // Store the pronunciation in the database
    const { error: insertError } = await supabaseClient
      .from('character_pronunciations')
      .insert({
        character,
        audio_content: base64Audio
      })

    if (insertError) {
      console.error('Error storing pronunciation:', insertError)
    }

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error generating pronunciation:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
