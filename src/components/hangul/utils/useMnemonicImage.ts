
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";

type LessonType = Database['public']['Tables']['hangul_lessons']['Row'];

export function useMnemonicImage(lesson: LessonType) {
  const [mnemonicImage, setMnemonicImage] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const { toast } = useToast();

  // Reset state when lesson changes
  useEffect(() => {
    setMnemonicImage(null);
    setIsLoadingImage(true);
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
    setMnemonicImage(null);
    
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

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }

      if (!generatedData) {
        throw new Error("No data received from edge function");
      }

      console.log("Generated data received:", generatedData);

      if (generatedData.imageUrl) {
        console.log("New mnemonic image received:", generatedData.imageUrl);
        setMnemonicImage(generatedData.imageUrl);
        
        if (generatedData.imageId) {
          const { error: updateError } = await supabase
            .from('hangul_lessons')
            .update({ 
              mnemonic_image_id: generatedData.imageId
            })
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

  const fetchOrGenerateMnemonicImage = async () => {
    if (!lesson.id) return;

    setIsLoadingImage(true);
    setMnemonicImage(null);

    try {
      // First try to fetch existing image
      if (lesson.mnemonic_image_id) {
        console.log("Attempting to fetch existing image for:", lesson.character);
        const { data: imageData, error: fetchError } = await supabase
          .from('mnemonic_images')
          .select('image_url')
          .eq('id', lesson.mnemonic_image_id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (imageData?.image_url) {
          console.log("Fetched existing mnemonic image:", imageData.image_url);
          setMnemonicImage(imageData.image_url);
          setIsLoadingImage(false);
          return;
        }
      }

      // If no existing image, generate new one
      console.log("No existing image found, generating new mnemonic image for:", lesson.character);
      const { data: generatedData, error: generateError } = await supabase.functions.invoke<{
        imageUrl: string;
        imageId: string;
      }>('generate-mnemonic', {
        body: {
          character: lesson.character,
          basePrompt: lesson.mnemonic_base,
          characterType: lesson.character_type[0]
        }
      });

      if (generateError) {
        console.error("Edge function error:", generateError);
        throw generateError;
      }

      if (!generatedData) {
        throw new Error("No data received from edge function");
      }

      console.log("Generated data received:", generatedData);

      if (generatedData.imageUrl) {
        console.log("Generated new mnemonic image:", generatedData.imageUrl);
        setMnemonicImage(generatedData.imageUrl);
        
        if (generatedData.imageId) {
          const { error: updateError } = await supabase
            .from('hangul_lessons')
            .update({ 
              mnemonic_image_id: generatedData.imageId
            })
            .eq('id', lesson.id);

          if (updateError) throw updateError;
        }
      }
    } catch (error: any) {
      console.error("Error with mnemonic image:", error);
      toast({
        title: "Error",
        description: `Failed to load mnemonic image: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingImage(false);
    }
  };

  // Call fetchOrGenerateMnemonicImage when lesson changes
  useEffect(() => {
    fetchOrGenerateMnemonicImage();
  }, [lesson.id]);

  return {
    mnemonicImage,
    isLoadingImage,
    isRegeneratingImage,
    regenerateMnemonicImage
  };
}
