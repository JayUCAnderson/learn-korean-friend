
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type LessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

export function useMnemonicImage(lesson: LessonType) {
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const [mnemonicImage, setMnemonicImage] = useState<string | null>(null);

  useEffect(() => {
    if (!lesson?.id) return;
    
    setIsLoadingImage(true);
    // Use the mnemonic_image_url from the view
    if (lesson.mnemonic_image_url) {
      setMnemonicImage(lesson.mnemonic_image_url);
      setIsLoadingImage(false);
    }
  }, [lesson?.id]); // Only depend on lesson ID

  const regenerateMnemonicImage = async () => {
    if (process.env.NODE_ENV !== 'development') return;
    if (!lesson?.id) return;
    
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
  };

  return {
    mnemonicImage,
    isLoadingImage,
    isRegeneratingImage,
    regenerateMnemonicImage
  };
}
