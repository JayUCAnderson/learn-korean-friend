
import { useState, useEffect, useRef } from "react";
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

  useEffect(() => {
    generatePronunciation();
  }, [character]);

  const generatePronunciation = async () => {
    try {
      setIsLoadingAudio(true);
      onLoadingChange(true);
      
      const { data, error } = await supabase.functions.invoke(
        'generate-pronunciation',
        {
          body: { character }
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
