
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type LessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

export function useMnemonicImage(lesson: LessonType) {
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const [mnemonicImage, setMnemonicImage] = useState<string | null>(null);

  useEffect(() => {
    // Early return if no lesson or if image URL hasn't changed
    if (!lesson?.id || mnemonicImage === lesson.mnemonic_image_url) return;
    
    setIsLoadingImage(true);
    setMnemonicImage(lesson.mnemonic_image_url);
    setIsLoadingImage(false);
  }, [lesson?.id, lesson?.mnemonic_image_url]); // Only depend on these specific props

  const regenerateMnemonicImage = useCallback(async () => {
    if (process.env.NODE_ENV !== 'development' || !lesson?.id) return;
    
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
        
        setMnemonicImage(generatedData.imageUrl);
      }
    } catch (error: any) {
      console.error("Error regenerating mnemonic image:", error);
    } finally {
      setIsRegeneratingImage(false);
    }
  }, [lesson?.id, lesson?.character, lesson?.mnemonic_base, lesson?.character_type]);

  return {
    mnemonicImage,
    isLoadingImage,
    isRegeneratingImage,
    regenerateMnemonicImage
  };
}
