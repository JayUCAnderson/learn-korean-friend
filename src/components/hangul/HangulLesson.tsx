
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import type { Database } from "@/integrations/supabase/types";
import { LessonHeader } from "./LessonHeader";
import { MnemonicImage } from "./MnemonicImage";
import { ExamplesSection } from "./ExamplesSection";
import { LessonProgress } from "./LessonProgress";
import { useAudioController } from "./AudioController";
import { useMnemonicImage } from "./utils/useMnemonicImage";

type HangulLessonType = Database['public']['Tables']['hangul_lessons']['Row'];

interface HangulLessonProps {
  lesson: HangulLessonType;
  onComplete: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function HangulLesson({ lesson, onComplete, onNext, onPrevious }: HangulLessonProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { generatePronunciation } = useAudioController({
    character: lesson.character,
    onAudioReady: setAudioUrl,
    onLoadingChange: setIsLoadingAudio,
  });

  const {
    mnemonicImage,
    isLoadingImage,
    isRegeneratingImage,
    regenerateMnemonicImage
  } = useMnemonicImage(lesson);

  const playPronunciation = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
    }
  };

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
          lessonId={Number(lesson.id)}
          onComplete={onComplete}
        />
      </div>
    </Card>
  );
}
