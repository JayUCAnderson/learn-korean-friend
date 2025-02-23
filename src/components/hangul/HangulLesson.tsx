
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { LessonHeader } from "./LessonHeader";
import { MnemonicImage } from "./MnemonicImage";
import { ExamplesSection } from "./ExamplesSection";
import { LessonProgress } from "./LessonProgress";
import { useAudioController } from "./AudioController";

type HangulLessonType = Database['public']['Tables']['hangul_lessons']['Row'];

interface HangulLessonProps {
  lesson: HangulLessonType;
  onComplete: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function HangulLesson({ lesson, onComplete, onNext, onPrevious }: HangulLessonProps) {
  const [mnemonicImage, setMnemonicImage] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const currentLessonId = useRef(lesson.id);

  const { generatePronunciation } = useAudioController({
    character: lesson.character,
    onAudioReady: setAudioUrl,
    onLoadingChange: setIsLoadingAudio,
  });

  useEffect(() => {
    // Reset state when lesson changes
    if (currentLessonId.current !== lesson.id) {
      setMnemonicImage(null);
      setIsLoadingImage(true);
      currentLessonId.current = lesson.id;
    }
    fetchOrGenerateMnemonicImage();
  }, [lesson.id]);

  const playPronunciation = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
    }
  };

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
    setMnemonicImage(null); // Clear current image while regenerating
    
    try {
      console.log("Initiating mnemonic image regeneration for character:", lesson.character);
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
        console.log("New mnemonic image received:", generatedData.imageUrl);
        setMnemonicImage(generatedData.imageUrl);
        
        // Update the mnemonic_image_id in the lesson
        if (generatedData.imageId) {
          const { error: updateError } = await supabase
            .from('hangul_lessons')
            .update({ mnemonic_image_id: generatedData.imageId })
            .eq('id', lesson.id);

          if (updateError) {
            console.error("Error updating lesson with new mnemonic image:", updateError);
            throw updateError;
          }
        }

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
    if (!lesson.id) return;

    try {
      if (lesson.mnemonic_image_id) {
        const { data: imageData, error: fetchError } = await supabase
          .from('mnemonic_images')
          .select('image_url')
          .eq('id', lesson.mnemonic_image_id)
          .maybeSingle();

        if (imageData?.image_url) {
          console.log("Fetched existing mnemonic image:", imageData.image_url);
          setMnemonicImage(imageData.image_url);
          setIsLoadingImage(false);
          return;
        }
      }

      console.log("No existing image found, generating new mnemonic image for:", lesson.character);
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
        console.log("Generated new mnemonic image:", generatedData.imageUrl);
        setMnemonicImage(generatedData.imageUrl);
        
        if (generatedData.imageId) {
          const { error: updateError } = await supabase
            .from('hangul_lessons')
            .update({ mnemonic_image_id: generatedData.imageId })
            .eq('id', lesson.id);

          if (updateError) {
            console.error("Error updating lesson with new mnemonic image:", updateError);
          }
        }
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
}
