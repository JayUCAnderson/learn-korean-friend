
import { useState, useEffect, useRef, memo } from "react";
import { Card } from "@/components/ui/card";
import type { Database } from "@/integrations/supabase/types";
import { LessonHeader } from "./LessonHeader";
import { MnemonicImage } from "./MnemonicImage";
import { ExamplesSection } from "./ExamplesSection";
import { LessonProgress } from "./LessonProgress";
import { useAudioController } from "./AudioController";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type HangulLessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

interface HangulLessonProps {
  lesson: HangulLessonType;
  onComplete: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export const HangulLesson = memo(function HangulLesson({ 
  lesson, 
  onComplete, 
  onNext, 
  onPrevious 
}: HangulLessonProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isLoadingAudio, processAudio } = useAudioController();
  const { toast } = useToast();

  useEffect(() => {
    if (!lesson?.id) return;
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    
    let isMounted = true;

    const loadAudio = async () => {
      try {
        const url = await processAudio(lesson.character, lesson.pronunciation_url);
        if (isMounted && url) {
          setAudioUrl(url);
        }
      } catch (error) {
        console.error("Error loading audio:", error);
      }
    };

    loadAudio();
    
    return () => {
      isMounted = false;
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [lesson?.id]); 

  const playPronunciation = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play().catch(console.error);
    }
  };

  const handleNext = async () => {
    if (!lesson?.id) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      await supabase.from('hangul_progress').upsert({
        user_id: user.id,
        character_id: lesson.id,
        total_practice_sessions: 1,
        recognition_accuracy: 100,
        sound_association_accuracy: 100,
        last_reviewed: new Date().toISOString(),
      });

      if (onNext) {
        onNext();
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!lesson?.id) {
    return null;
  }

  return (
    <Card className="p-6 space-y-6">
      <LessonHeader
        character={lesson.character}
        romanization={lesson.romanization}
        soundDescription={lesson.sound_description}
        onPlayPronunciation={playPronunciation}
        onPrevious={onPrevious}
        onNext={handleNext}
        isLoadingAudio={isLoadingAudio}
        audioUrl={audioUrl}
      />

      <p className="text-gray-700 text-center">{lesson.sound_description}</p>

      <audio ref={audioRef} src={audioUrl || ''} />

      <div className="space-y-4">
        <MnemonicImage
          imageUrl={lesson.mnemonic_image_url || ''}
          mnemonicBase={lesson.mnemonic_base}
        />

        <ExamplesSection examples={lesson.examples as Record<string, string>} />

        <LessonProgress
          lessonId={lesson.id}
          onComplete={onComplete}
        />
      </div>
    </Card>
  );
});
