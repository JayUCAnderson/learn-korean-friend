
import { useState, useEffect, useRef, memo } from "react";
import { Card } from "@/components/ui/card";
import type { Database } from "@/integrations/supabase/types";
import { LessonHeader } from "./LessonHeader";
import { MnemonicImage } from "./MnemonicImage";
import { ExamplesSection } from "./ExamplesSection";
import { LessonProgress } from "./LessonProgress";
import { useAudioController } from "./AudioController";
import { useMnemonicImage } from "./utils/useMnemonicImage";

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
  const hasAttemptedLoad = useRef(false);

  const {
    mnemonicImage,
    isLoadingImage,
    isRegeneratingImage,
    regenerateMnemonicImage
  } = useMnemonicImage(lesson);

  useEffect(() => {
    if (!lesson?.id || !lesson?.character || hasAttemptedLoad.current) return;
    
    hasAttemptedLoad.current = true;
    let isMounted = true;
    
    const loadAudio = async () => {
      try {
        const url = await processAudio(lesson.character, lesson.pronunciation_url);
        if (isMounted) {
          setAudioUrl(url);
        }
      } catch (error) {
        console.error("Error loading audio:", error);
      }
    };

    loadAudio();
    
    return () => {
      isMounted = false;
    };
  }, [lesson?.id]); // Only depend on lesson ID to prevent unnecessary rerenders

  const playPronunciation = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
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
        onNext={onNext}
        isLoadingAudio={isLoadingAudio}
        audioUrl={audioUrl}
      />

      <p className="text-gray-700 text-center">{lesson.sound_description}</p>

      <audio ref={audioRef} src={audioUrl || ''} />

      <div className="space-y-4">
        <MnemonicImage
          mnemonicImage={mnemonicImage}
          mnemonicBase={lesson.mnemonic_base}
          isLoadingImage={isLoadingImage}
          isRegeneratingImage={isRegeneratingImage}
          onRegenerateImage={regenerateMnemonicImage}
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
