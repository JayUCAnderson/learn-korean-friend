
import { useState, useEffect } from "react";
import type { Database } from "@/integrations/supabase/types";

type LessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

export function useMnemonicImage(lesson: LessonType) {
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);

  useEffect(() => {
    // If we have a mnemonic_image_url from the lesson, we can use it directly
    if (lesson.mnemonic_image_url) {
      setIsLoadingImage(false);
    }
  }, [lesson.character]);

  const regenerateMnemonicImage = async () => {
    if (process.env.NODE_ENV !== 'development') return;
    
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
        // Update the image in the database
        const { error: updateError } = await supabase
          .from('hangul_lessons')
          .update({ mnemonic_image_url: generatedData.imageUrl })
          .eq('id', lesson.id);

        if (updateError) throw updateError;
      }
    } catch (error: any) {
      console.error("Error regenerating mnemonic image:", error);
    } finally {
      setIsRegeneratingImage(false);
    }
  };

  return {
    mnemonicImage: lesson.mnemonic_image_url,
    isLoadingImage,
    isRegeneratingImage,
    regenerateMnemonicImage
  };
}
