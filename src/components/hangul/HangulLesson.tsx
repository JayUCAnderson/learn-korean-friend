
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Volume2 } from "lucide-react";

type HangulLessonType = Database['public']['Tables']['hangul_lessons']['Row'];

interface HangulLessonProps {
  lesson: HangulLessonType;
  onComplete: () => void;
}

export function HangulLesson({ lesson, onComplete }: HangulLessonProps) {
  const [showExamples, setShowExamples] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mnemonicImage, setMnemonicImage] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrGenerateMnemonicImage();
    generatePronunciation();
  }, [lesson.id]);

  const fetchOrGenerateMnemonicImage = async () => {
    try {
      // First try to fetch existing image
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

      // If no image exists, generate one
      const { data: generatedData, error: generateError } = await supabase.functions.invoke(
        'generate-mnemonic',
        {
          body: {
            character: lesson.character,
            basePrompt: lesson.mnemonic_base,
            characterType: lesson.character_type[0]
          }
        }
      );

      if (generateError) throw generateError;

      if (generatedData?.imageUrl) {
        setMnemonicImage(generatedData.imageUrl);
        
        // Update the lesson with the new mnemonic image ID
        const { error: updateError } = await supabase
          .from('hangul_lessons')
          .update({ mnemonic_image_id: generatedData.imageId })
          .eq('id', lesson.id);

        if (updateError) throw updateError;
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

  const handleLessonComplete = async () => {
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
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">{lesson.character}</h2>
        <div className="flex items-center justify-center gap-4">
          <p className="text-lg text-gray-600">
            Romanization: {lesson.romanization}
          </p>
          <Button
            variant="outline"
            size="icon"
            onClick={playPronunciation}
            disabled={isLoadingAudio || !audioUrl}
          >
            {isLoadingAudio ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-gray-700 mt-2">{lesson.sound_description}</p>
      </div>

      <audio ref={audioRef} src={audioUrl || ''} />

      <div className="space-y-4">
        {isLoadingImage ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : mnemonicImage && (
          <div className="flex flex-col items-center space-y-2">
            <img
              src={mnemonicImage}
              alt={`Mnemonic for ${lesson.character}`}
              className="max-w-sm rounded-lg shadow-lg"
            />
            <p className="text-sm text-gray-600 italic">
              Mnemonic hint: {lesson.mnemonic_base}
            </p>
          </div>
        )}

        <Button
          className="w-full"
          variant="outline"
          onClick={() => setShowExamples(!showExamples)}
        >
          {showExamples ? "Hide" : "Show"} Examples
        </Button>

        {showExamples && (
          <div className="p-4 bg-gray-50 rounded-lg">
            {Object.entries(lesson.examples as Record<string, string>).map(([korean, english]) => (
              <div key={korean} className="mb-2">
                <p className="font-semibold">{korean}</p>
                <p className="text-gray-600">{english}</p>
              </div>
            ))}
          </div>
        )}

        <Button
          className="w-full"
          onClick={handleLessonComplete}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving Progress..." : "Complete & Continue"}
        </Button>
      </div>
    </Card>
  );
}
