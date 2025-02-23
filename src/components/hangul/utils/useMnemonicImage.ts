
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { imageCache, isPreloadComplete } from "@/hooks/useHangulImagePreloader";

type LessonType = Database['public']['Tables']['hangul_lessons']['Row'];

export function useMnemonicImage(lesson: LessonType) {
  const [mnemonicImage, setMnemonicImage] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      try {
        // Try to get from cache first
        if (imageCache.has(lesson.character)) {
          console.log("Using cached image for:", lesson.character);
          if (isMounted) {
            setMnemonicImage(imageCache.get(lesson.character)!);
            setIsLoadingImage(false);
          }
          return;
        }

        // If not in cache and preloading is not complete, fetch directly
        if (!isPreloadComplete) {
          console.log("Fetching image directly for:", lesson.character);
          const { data, error } = await supabase
            .from('hangul_lessons_complete')
            .select('mnemonic_image_url')
            .eq('character', lesson.character)
            .single();

          if (error) throw error;
          
          if (data?.mnemonic_image_url && isMounted) {
            setMnemonicImage(data.mnemonic_image_url);
            imageCache.set(lesson.character, data.mnemonic_image_url);
            setIsLoadingImage(false);
          }
        }
      } catch (error) {
        console.error("Error fetching mnemonic image:", error);
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
    if (process.env.NODE_ENV !== 'development') {
      toast({
        title: "Feature not available",
        description: "Image regeneration is only available in development mode.",
        variant: "destructive",
      });
      return;
    }

    setIsRegeneratingImage(true);
    setMnemonicImage(null);
    imageCache.delete(lesson.character);
    
    try {
      console.log("Initiating mnemonic image regeneration for character:", lesson.character);
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
      if (!generatedData) throw new Error("No data received from edge function");

      if (generatedData.imageUrl) {
        console.log("New mnemonic image received:", generatedData.imageUrl);
        setMnemonicImage(generatedData.imageUrl);
        imageCache.set(lesson.character, generatedData.imageUrl);
        
        if (generatedData.imageId) {
          const { error: updateError } = await supabase
            .from('hangul_lessons')
            .update({ mnemonic_image_id: generatedData.imageId })
            .eq('id', lesson.id);

          if (updateError) throw updateError;
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
        description: `Failed to regenerate mnemonic image: ${error.message}`,
        variant: "destructive",
      });
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
