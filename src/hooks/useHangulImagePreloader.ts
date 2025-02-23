
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Create and export the cache so it can be imported by other components
export const imageCache = new Map<string, string>();

export function useHangulImagePreloader(lessons: any[]) {
  const [isPreloading, setIsPreloading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const preloadImages = async () => {
      if (!lessons.length) return;

      try {
        console.log("Starting to preload Hangul images...");
        const preloadPromises = lessons.map(async (lesson) => {
          // Skip if already cached
          if (imageCache.has(lesson.character)) {
            return;
          }

          if (lesson.mnemonic_image_id) {
            const { data: imageData, error: fetchError } = await supabase
              .from('mnemonic_images')
              .select('image_url')
              .eq('id', lesson.mnemonic_image_id)
              .maybeSingle();

            if (fetchError) throw fetchError;

            if (imageData?.image_url) {
              // Create an image element to preload
              const img = new Image();
              img.src = imageData.image_url;
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
              });
              imageCache.set(lesson.character, imageData.image_url);
            } else {
              // If no existing image, generate new one
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

              if (generateError) throw generateError;
              if (!generatedData) throw new Error("No data received from edge function");

              if (generatedData.imageUrl) {
                const img = new Image();
                img.src = generatedData.imageUrl;
                await new Promise((resolve, reject) => {
                  img.onload = resolve;
                  img.onerror = reject;
                });
                imageCache.set(lesson.character, generatedData.imageUrl);
                
                // Update the lesson with the new image ID
                if (generatedData.imageId) {
                  await supabase
                    .from('hangul_lessons')
                    .update({ mnemonic_image_id: generatedData.imageId })
                    .eq('id', lesson.id);
                }
              }
            }
          }
        });

        await Promise.all(preloadPromises);
        console.log("All Hangul images preloaded successfully!");
        setIsPreloading(false);
      } catch (error: any) {
        console.error("Error preloading images:", error);
        toast({
          title: "Warning",
          description: "Some images may take longer to load",
          variant: "destructive",
        });
        setIsPreloading(false);
      }
    };

    preloadImages();
  }, [lessons]);

  return { isPreloading, imageCache };
}
