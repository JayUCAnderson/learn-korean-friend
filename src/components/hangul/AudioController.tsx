
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useAudioController() {
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const { toast } = useToast();
  
  const JENNIE_VOICE_ID = 'z6Kj0hecH20CdetSElRT';

  const processAudio = async (character: string, existingUrl: string | null = null) => {
    if (!character) return null;
    
    try {
      setIsLoadingAudio(true);

      // Check for existing pronunciation
      const { data: existingPronunciation, error: fetchError } = await supabase
        .from('character_pronunciations')
        .select('audio_content')
        .eq('character', character)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // If we have existing audio content, use it
      if (existingPronunciation?.audio_content) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(existingPronunciation.audio_content), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        return URL.createObjectURL(audioBlob);
      }

      // Generate new audio if none exists
      const { data, error } = await supabase.functions.invoke(
        'generate-pronunciation',
        {
          body: { 
            character,
            voiceId: JENNIE_VOICE_ID
          }
        }
      );

      if (error) throw error;
      if (!data?.audioContent) {
        throw new Error('No audio content received from generation');
      }

      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );

      // Store the audio in the database
      const { error: storeError } = await supabase
        .from('character_pronunciations')
        .upsert({
          character,
          audio_content: data.audioContent
        });

      if (storeError) {
        console.error('Error storing audio:', storeError);
      }

      return URL.createObjectURL(audioBlob);
    } catch (error: any) {
      console.error("Error with audio:", error);
      toast({
        title: "Error",
        description: "Failed to load pronunciation. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return { isLoadingAudio, processAudio };
}
