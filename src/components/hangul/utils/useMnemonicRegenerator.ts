
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type LessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

export function useMnemonicRegenerator(lesson: LessonType) {
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);

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
        await supabase
          .from('hangul_lessons')
          .update({ mnemonic_image_id: generatedData.imageId })
          .eq('id', lesson.id);
      }
    } catch (error) {
      console.error("Error regenerating mnemonic image:", error);
    } finally {
      setIsRegeneratingImage(false);
    }
  }, [lesson?.id, lesson?.character, lesson?.mnemonic_base, lesson?.character_type]);

  return {
    isRegeneratingImage,
    regenerateMnemonicImage
  };
}
