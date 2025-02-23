
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VOICE_OPTIONS } from "@/types/voice";

interface AudioControllerProps {
  character: string;
  onAudioReady: (url: string | null) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

// Hangul vowels (모음)
const VOWELS = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ', 
                'ㅐ', 'ㅒ', 'ㅔ', 'ㅖ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ'];

export function useAudioController({ character, onAudioReady, onLoadingChange }: AudioControllerProps) {
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const { toast } = useToast();
  
  // Select voice based on character type (vowel = female, consonant = male)
  const selectVoice = () => {
    const isVowel = VOWELS.includes(character);
    const voices = VOICE_OPTIONS.filter(voice => 
      isVowel ? voice.gender === 'female' : voice.gender === 'male'
    );
    return voices[Math.floor(Math.random() * voices.length)];
  };

  useEffect(() => {
    generatePronunciation();
  }, [character]);

  const generatePronunciation = async () => {
    try {
      setIsLoadingAudio(true);
      onLoadingChange(true);
      
      const selectedVoice = selectVoice();
      
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
