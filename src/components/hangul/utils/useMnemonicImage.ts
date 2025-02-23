
import { useState, useEffect } from "react";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { imageCache } from "@/hooks/useHangulImagePreloader";

type LessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

export function useMnemonicImage(lesson: LessonType) {
  const [mnemonicImage, setMnemonicImage] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      try {
        setIsLoadingImage(true);

        // Try to get from cache first
        if (imageCache.has(lesson.character)) {
          if (isMounted) {
            setMnemonicImage(imageCache.get(lesson.character)!);
            setIsLoadingImage(false);
          }
          return;
        }

        // Use the mnemonic_image_url from the lesson
        if (lesson.mnemonic_image_url) {
          if (isMounted) {
            setMnemonicImage(lesson.mnemonic_image_url);
            imageCache.set(lesson.character, lesson.mnemonic_image_url);
          }
          return;
        }

        // If no image URL is available, we'll need to generate one
        await regenerateMnemonicImage();
      } catch (error) {
        console.error("Error fetching mnemonic image:", error);
      } finally {
        if (isMounted) {
          setIsLoadingImage(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [lesson.character]);

  const regenerateMnemonicImage = async () => {
    if (process.env.NODE_ENV !== 'development') return;
    
    setIsRegeneratingImage(true);
    setMnemonicImage(null);
    imageCache.delete(lesson.character);
    
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
        setMnemonicImage(generatedData.imageUrl);
        imageCache.set(lesson.character, generatedData.imageUrl);
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
