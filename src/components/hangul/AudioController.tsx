
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AudioControllerProps {
  character: string;
  onAudioReady: (url: string | null) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export function useAudioController({ character, onAudioReady, onLoadingChange }: AudioControllerProps) {
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const { toast } = useToast();
  
  // Using only Jennie's voice ID for all characters
  const JENNIE_VOICE_ID = 'z6Kj0hecH20CdetSElRT';

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        setIsLoadingAudio(true);
        onLoadingChange(true);

        // First try to get from the view
        const { data: lessonData, error: lessonError } = await supabase
          .from('hangul_lessons_complete')
          .select('pronunciation_url')
          .eq('character', character)
          .single();

        if (lessonError) throw lessonError;

        if (lessonData?.pronunciation_url) {
          console.log('Using existing pronunciation from database');
          onAudioReady(lessonData.pronunciation_url);
          return;
        }

        console.log(`No existing pronunciation found, generating new audio for character: ${character}`);
        console.log(`Using Jennie's voice (ID: ${JENNIE_VOICE_ID}) for pronunciation`);
        
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

        console.log('Response from generate-pronunciation:', { data });

        if (data?.audioContent) {
          console.log('Received audio content, creating blob URL');
          const audioBlob = new Blob(
            [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
            { type: 'audio/mpeg' }
          );
          const url = URL.createObjectURL(audioBlob);
          console.log('Created blob URL for audio:', url);
          onAudioReady(url);

          // Store the audio URL in the database
          const { error: updateError } = await supabase
            .from('character_pronunciations')
            .upsert({
              character,
              audio_url: url,
              audio_content: data.audioContent // Adding the required audio_content field
            });

          if (updateError) {
            console.error('Error storing audio URL:', updateError);
          }
        } else {
          console.log('No audio content received in response');
          onAudioReady(null);
        }
      } catch (error: any) {
        console.error("Error generating pronunciation:", error);
        toast({
          title: "Error",
          description: "Failed to load pronunciation. Please try again.",
          variant: "destructive",
        });
        onAudioReady(null);
      } finally {
        console.log('Finished audio generation process');
        setIsLoadingAudio(false);
        onLoadingChange(false);
      }
    };

    fetchAudio();
  }, [character]);

  return { isLoadingAudio };
}
