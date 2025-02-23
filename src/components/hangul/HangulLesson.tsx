
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

  // Log lesson data when it changes
  useEffect(() => {
    console.log("Current Hangul Lesson Data:", {
      id: lesson?.id,
      character: lesson?.character,
      romanization: lesson?.romanization,
      sound_description: lesson?.sound_description,
      examples: lesson?.examples,
      mnemonic_base: lesson?.mnemonic_base,
      mnemonic_image_url: lesson?.mnemonic_image_url,
      pronunciation_url: lesson?.pronunciation_url
    });
  }, [lesson]);

  useEffect(() => {
    if (!lesson?.id) return;
    
    // Clear previous audio URL when lesson changes
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    
    let isMounted = true;

    const loadAudio = async () => {
      try {
        // Use the pronunciation_url from the database if available
        if (lesson.pronunciation_url) {
          setAudioUrl(lesson.pronunciation_url);
          return;
        }

        // Only generate new audio if no URL exists
        const url = await processAudio(lesson.character);
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
  }, [lesson?.id, lesson?.pronunciation_url]); 

  const playPronunciation = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play().catch(console.error);
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
