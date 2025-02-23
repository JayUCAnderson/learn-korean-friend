
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useAudioController() {
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const { toast } = useToast();
  
  const JENNIE_VOICE_ID = 'z6Kj0hecH20CdetSElRT';

  const processAudio = async (character: string, existingPronunciationUrl: string | null = null) => {
    if (!character) return null;
    
    try {
      setIsLoadingAudio(true);

      // If we have a valid existing URL from the database, use it
      if (existingPronunciationUrl) {
        // Verify the URL is valid
        try {
          const response = await fetch(existingPronunciationUrl);
          if (response.ok) {
            return existingPronunciationUrl;
          }
        } catch (error) {
          console.error("Error verifying existing URL:", error);
          // Continue to try other methods if URL verification fails
        }
      }

      // Check for existing pronunciation content
      const { data: existingPronunciation, error: fetchError } = await supabase
        .from('character_pronunciations')
        .select('audio_content')
        .eq('character', character)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // If we have existing audio content, try to use it
      if (existingPronunciation?.audio_content) {
        try {
          const audioBuffer = Uint8Array.from(atob(existingPronunciation.audio_content), c => c.charCodeAt(0));
          const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
          const url = URL.createObjectURL(blob);
          
          // Verify the audio is playable
          await new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = resolve;
            audio.onerror = reject;
            audio.src = url;
          });
          
          return url;
        } catch (error) {
          console.error("Error with existing audio content:", error);
          // If existing audio fails, continue to generate new audio
        }
      }

      // Generate new audio
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

      // Create audio from new content
      const audioBuffer = Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0));
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

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

      return url;
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

