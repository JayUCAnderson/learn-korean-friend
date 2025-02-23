
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { LessonHeader } from "./LessonHeader";
import { MnemonicImage } from "./MnemonicImage";
import { ExamplesSection } from "./ExamplesSection";
import { MasteryChecks } from "./MasteryChecks";

type HangulLessonType = Database['public']['Tables']['hangul_lessons']['Row'];

interface HangulLessonProps {
  lesson: HangulLessonType;
  onComplete: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function HangulLesson({ lesson, onComplete, onNext, onPrevious }: HangulLessonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mnemonicImage, setMnemonicImage] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showMasteryCheck, setShowMasteryCheck] = useState(false);
  const [masteryChecks, setMasteryChecks] = useState({
    recognition: false,
    pronunciation: false,
    writing: false
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrGenerateMnemonicImage();
    generatePronunciation();
  }, [lesson.id]);

  const regenerateMnemonicImage = async () => {
    if (process.env.NODE_ENV !== 'development') {
      toast({
        title: "Feature not available",
        description: "Image regeneration is only available in development mode.",
        variant: "destructive",
      });
      return;
    }

    setIsRegeneratingImage(true);
    try {
      const { data: generatedData, error } = await supabase.functions.invoke(
        'generate-mnemonic',
        {
          body: {
            character: lesson.character,
            basePrompt: `Create a simple, clear, memorable mnemonic image that helps remember the Korean ${lesson.character_type[0]} "${lesson.character}" by emphasizing its visual similarity to ${lesson.mnemonic_base}. Make the image focus on the key visual elements that make it look like the character.`,
            characterType: lesson.character_type[0]
          }
        }
      );

      if (error) throw error;

      if (generatedData?.imageUrl) {
        setMnemonicImage(generatedData.imageUrl);
        toast({
          title: "Success",
          description: "Mnemonic image regenerated successfully.",
        });
      }
    } catch (error: any) {
      console.error("Error regenerating mnemonic image:", error);
      toast({
        title: "Error",
        description: "Failed to regenerate mnemonic image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegeneratingImage(false);
    }
  };

  const fetchOrGenerateMnemonicImage = async () => {
    try {
      if (lesson.mnemonic_image_id) {
        const { data: imageData, error: fetchError } = await supabase
          .from('mnemonic_images')
          .select('image_url')
          .eq('id', lesson.mnemonic_image_id)
          .single();

        if (imageData) {
          setMnemonicImage(imageData.image_url);
          setIsLoadingImage(false);
          return;
        }
      }

      const { data: generatedData, error: generateError } = await supabase.functions.invoke(
        'generate-mnemonic',
        {
          body: {
            character: lesson.character,
            basePrompt: `Create a simple, clear, memorable mnemonic image that helps remember the Korean ${lesson.character_type[0]} "${lesson.character}" by emphasizing its visual similarity to ${lesson.mnemonic_base}. Make the image focus on the key visual elements that make it look like the character.`,
            characterType: lesson.character_type[0]
          }
        }
      );

      if (generateError) throw generateError;

      if (generatedData?.imageUrl) {
        setMnemonicImage(generatedData.imageUrl);
        
        await supabase
          .from('hangul_lessons')
          .update({ mnemonic_image_id: generatedData.imageId })
          .eq('id', lesson.id);
      }
    } catch (error: any) {
      console.error("Error with mnemonic image:", error);
      toast({
        title: "Error",
        description: "Failed to load mnemonic image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingImage(false);
    }
  };

  const generatePronunciation = async () => {
    try {
      setIsLoadingAudio(true);
      const { data, error } = await supabase.functions.invoke(
        'generate-pronunciation',
        {
          body: { character: lesson.character }
        }
      );

      if (error) throw error;

      if (data?.audioContent) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      }
    } catch (error: any) {
      console.error("Error generating pronunciation:", error);
      toast({
        title: "Error",
        description: "Failed to load pronunciation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const playPronunciation = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
    }
  };

  const handleMasteryCheck = (type: keyof typeof masteryChecks) => {
    setMasteryChecks(prev => ({
      ...prev,
      [type]: true
    }));
  };

  const handleLessonComplete = async () => {
    if (!showMasteryCheck) {
      setShowMasteryCheck(true);
      return;
    }

    if (!Object.values(masteryChecks).every(Boolean)) {
      toast({
        title: "Complete all checks",
        description: "Please complete all mastery checks before continuing.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from('hangul_progress').upsert({
        user_id: user.id,
        character_id: lesson.id,
        total_practice_sessions: 1,
        recognition_accuracy: 100,
        sound_association_accuracy: 100,
        last_reviewed: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Progress Saved",
        description: "Keep up the great work! 잘 했어요! (jal haesseoyo!)",
      });
      
      onComplete();
    } catch (error: any) {
      console.error("Error saving progress:", error);
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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

        {showMasteryCheck && (
          <MasteryChecks
            checks={masteryChecks}
            onCheck={handleMasteryCheck}
          />
        )}

        <Button
          className="w-full"
          onClick={handleLessonComplete}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving Progress..." : showMasteryCheck ? "Complete & Continue" : "Check Understanding"}
        </Button>
      </div>
    </Card>
  );
}
