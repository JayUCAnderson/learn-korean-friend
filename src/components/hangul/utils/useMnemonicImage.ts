
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type LessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

export function useMnemonicImage(lesson: LessonType) {
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const [mnemonicImage, setMnemonicImage] = useState<string | null>(null);

  useEffect(() => {
    if (!lesson) return;
    
    setIsLoadingImage(true);
    // Use the mnemonic_image_url from the view
    if (lesson.mnemonic_image_url) {
      setMnemonicImage(lesson.mnemonic_image_url);
      setIsLoadingImage(false);
    }
  }, [lesson?.id]); // Only depend on lesson ID to prevent unnecessary rerenders

  const regenerateMnemonicImage = async () => {
    if (process.env.NODE_ENV !== 'development') return;
    if (!lesson) return;
    
    setIsRegeneratingImage(true);
    
    try {
      const { data: generatedData, error } = await supabase.functions.invoke<{
        imageUrl: string;
        imageId: string;
      }>('generate-mnemonic', {
        body: {
          character: lesson.character,
          basePrompt: lesson.mnemonic_base,
          characterType: lesson.character_type[0]
        }
      });

      if (error) throw error;

      if (generatedData?.imageUrl) {
        const { error: updateError } = await supabase
          .from('hangul_lessons')
          .update({ mnemonic_image_id: generatedData.imageId })
          .eq('id', lesson.id);

        if (updateError) throw updateError;
        
        // Refresh the lesson data after update
        const { data: refreshedLesson, error: refreshError } = await supabase
          .from('hangul_lessons_complete')
          .select('*')
          .eq('id', lesson.id)
          .single();
          
        if (!refreshError && refreshedLesson) {
          setMnemonicImage(refreshedLesson.mnemonic_image_url);
        }
      }
    } catch (error: any) {
      console.error("Error regenerating mnemonic image:", error);
    } finally {
      setIsRegeneratingImage(false);
    }
  };

  return {
    mnemonicImage,
    isLoadingImage,
    isRegeneratingImage,
    regenerateMnemonicImage
  };
}
