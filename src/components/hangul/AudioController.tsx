
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VOICE_OPTIONS } from "@/types/voice";

interface AudioControllerProps {
  character: string;
  onAudioReady: (url: string | null) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export function useAudioController({ character, onAudioReady, onLoadingChange }: AudioControllerProps) {
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const { toast } = useToast();
  
  // Randomly select a voice for each character while maintaining gender consistency
  const selectRandomVoice = () => {
    // You can adjust this to always use female or male voices if preferred
    const voices = VOICE_OPTIONS;
    return voices[Math.floor(Math.random() * voices.length)];
  };

  useEffect(() => {
    generatePronunciation();
  }, [character]);

  const generatePronunciation = async () => {
    try {
      setIsLoadingAudio(true);
      onLoadingChange(true);
      
      const selectedVoice = selectRandomVoice();
      
      const { data, error } = await supabase.functions.invoke(
        'generate-pronunciation',
        {
          body: { 
            character,
            voiceId: selectedVoice.id
          }
        }
      );

      if (error) throw error;

      if (data?.audioContent) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const url = URL.createObjectURL(audioBlob);
        onAudioReady(url);
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
      setIsLoadingAudio(false);
      onLoadingChange(false);
    }
  };

  return { isLoadingAudio, generatePronunciation };
}
