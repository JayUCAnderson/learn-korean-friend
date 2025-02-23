
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Volume2, Pause } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VOICE_OPTIONS } from "@/types/voice";

interface AudioPlayerProps {
  lessonId: string;
  title: string;
  description: string | null;
  audioUrl: string | null;
  onAudioUrlUpdate: (url: string) => void;
}

export function AudioPlayer({ lessonId, title, description, audioUrl, onAudioUrlUpdate }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  // Randomly select a voice while maintaining gender consistency
  const selectRandomVoice = () => {
    const voices = VOICE_OPTIONS;
    return voices[Math.floor(Math.random() * voices.length)];
  };

  const handlePlayAudio = async () => {
    try {
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        if (isPlaying) {
          audio.pause();
        } else {
          await audio.play();
        }
        setIsPlaying(!isPlaying);
        return;
      }

      toast({
        title: "Generating audio...",
        description: "Please wait while we prepare the lesson audio.",
      });

      const selectedVoice = selectRandomVoice();

      const { data, error } = await supabase.functions.invoke('text-to-voice', {
        body: {
          text: `${title}. ${description}`,
          voiceId: selectedVoice.id
        }
      });

      if (error) throw error;

      const blob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mp3' }
      );
      const url = URL.createObjectURL(blob);
      onAudioUrlUpdate(url);

      const { error: updateError } = await supabase
        .from('lessons')
        .update({
          audio_content: {
            url: url,
            voice_id: selectedVoice.id,
            last_generated: new Date().toISOString()
          }
        })
        .eq('id', lessonId);

      if (updateError) throw updateError;

      const audio = new Audio(url);
      await audio.play();
      setIsPlaying(true);

      audio.onended = () => {
        setIsPlaying(false);
      };

    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate or play audio. Please try again.",
      });
      setIsPlaying(false);
    }
  };

  return (
    <Button
      size="lg"
      onClick={handlePlayAudio}
      className="flex items-center space-x-2"
    >
      {isPlaying ? (
        <>
          <Pause className="h-5 w-5" />
          <span>Pause</span>
        </>
      ) : (
        <>
          <Volume2 className="h-5 w-5" />
          <span>Listen</span>
        </>
      )}
    </Button>
  );
}
