
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
    generatePronunciation();
  }, [character]);

  const generatePronunciation = async () => {
    try {
      console.log(`Starting audio generation for character: ${character}`);
      setIsLoadingAudio(true);
      onLoadingChange(true);
      
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

      console.log('Response from generate-pronunciation:', { data, error });

      if (error) throw error;

      if (data?.audioContent) {
        console.log('Received audio content, creating blob URL');
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const url = URL.createObjectURL(audioBlob);
        console.log('Created blob URL for audio:', url);
        onAudioReady(url);
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

  return { isLoadingAudio, generatePronunciation };
}
