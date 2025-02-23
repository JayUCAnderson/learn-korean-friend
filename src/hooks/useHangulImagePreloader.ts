
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Create and export the cache so it can be imported by other components
export const imageCache = new Map<string, string>();
export let isPreloadComplete = false;

export function useHangulImagePreloader(lessons: any[]) {
  const [isPreloading, setIsPreloading] = useState(true);

  useEffect(() => {
    const preloadImages = async () => {
      if (!lessons.length) {
        setIsPreloading(false);
        isPreloadComplete = true;
        return;
      }

      try {
        console.log("Starting to preload Hangul images...");
        const preloadPromises = lessons.map(async (lesson) => {
          // Skip if already cached
          if (imageCache.has(lesson.character)) {
            console.log("Using cached image for:", lesson.character);
            return;
          }

          try {
            // Try to find existing mnemonic image
            const { data: existingImage } = await supabase
              .from('mnemonic_images')
              .select('id, image_url')
              .eq('character', lesson.character)
              .maybeSingle();

            if (existingImage?.image_url) {
              // Preload and cache existing image
              const img = new Image();
              img.src = existingImage.image_url;
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
              });
              imageCache.set(lesson.character, existingImage.image_url);

              // Update lesson with mnemonic_image_id if needed
              if (lesson.mnemonic_image_id !== existingImage.id) {
                await supabase
                  .from('hangul_lessons')
                  .update({ mnemonic_image_id: existingImage.id })
                  .eq('id', lesson.id);
              }
              return;
            }

            // Generate new image if none exists
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
              console.error("Error generating image:", generateError);
              return;
            }

            if (generatedData?.imageUrl) {
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
          } catch (error) {
            console.error(`Error handling image for character ${lesson.character}:`, error);
          }
        });

        await Promise.all(preloadPromises);
        console.log("All Hangul images preloaded successfully!");
        isPreloadComplete = true;
      } catch (error) {
        console.error("Error in preload process:", error);
      } finally {
        setIsPreloading(false);
        isPreloadComplete = true;
      }
    };

    preloadImages();
  }, [lessons]);

  return { isPreloading };
}
