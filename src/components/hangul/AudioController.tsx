
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AudioControllerProps {
  character: string;
  audioContent?: string | null;
  onAudioReady: (url: string | null) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export function useAudioController({ character, audioContent, onAudioReady, onLoadingChange }: AudioControllerProps) {
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const { toast } = useToast();
  
  const JENNIE_VOICE_ID = 'z6Kj0hecH20CdetSElRT';

  useEffect(() => {
    let isMounted = true;
    
    const initializeAudio = async () => {
      try {
        setIsLoadingAudio(true);
        onLoadingChange(true);

        // If we have audio content from the preloaded data, use it
        if (audioContent) {
          const audioBlob = new Blob(
            [Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))],
            { type: 'audio/mpeg' }
          );
          const url = URL.createObjectURL(audioBlob);
          if (isMounted) {
            onAudioReady(url);
            setIsLoadingAudio(false);
            onLoadingChange(false);
          }
          return;
        }

        // If no audio content is available, generate it
        console.log(`No existing pronunciation found, generating new audio for character: ${character}`);
        
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
        const url = URL.createObjectURL(audioBlob);

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

        if (isMounted) {
          onAudioReady(url);
        }
      } catch (error: any) {
        console.error("Error with audio:", error);
        toast({
          title: "Error",
          description: "Failed to load pronunciation. Please try again.",
          variant: "destructive",
        });
        if (isMounted) {
          onAudioReady(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingAudio(false);
          onLoadingChange(false);
        }
      }
    };

    initializeAudio();
    
    return () => {
      isMounted = false;
    };
  }, [character, audioContent]);

  return { isLoadingAudio };
}
