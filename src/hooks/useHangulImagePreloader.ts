
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Create and export the cache so it can be imported by other components
export const imageCache = new Map<string, string>();
export let isPreloadComplete = false;

export function useHangulImagePreloader(lessons: any[]) {
  const [isPreloading, setIsPreloading] = useState(true);
  const { toast } = useToast();

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

          if (lesson.mnemonic_image_id) {
            const { data: imageData, error: fetchError } = await supabase
              .from('mnemonic_images')
              .select('image_url')
              .eq('id', lesson.mnemonic_image_id)
              .maybeSingle();

            if (fetchError) {
              console.error("Error fetching image for character:", lesson.character, fetchError);
              return;
            }

            if (imageData?.image_url) {
              // Create an image element to preload
              const img = new Image();
              img.src = imageData.image_url;
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
              });
              console.log("Successfully cached image for:", lesson.character);
              imageCache.set(lesson.character, imageData.image_url);
            } else {
              // If no existing image, generate new one
              console.log("No existing image found for:", lesson.character, "generating new one...");
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
                console.error("Error generating image for character:", lesson.character, generateError);
                return;
              }

              if (generatedData?.imageUrl) {
                const img = new Image();
                img.src = generatedData.imageUrl;
                await new Promise((resolve, reject) => {
                  img.onload = resolve;
                  img.onerror = reject;
                });
                console.log("Successfully generated and cached image for:", lesson.character);
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
        isPreloadComplete = true;
        setIsPreloading(false);
      } catch (error: any) {
        console.error("Error preloading images:", error);
        toast({
          title: "Warning",
          description: "Some images may take longer to load",
          variant: "destructive",
        });
        isPreloadComplete = true;
        setIsPreloading(false);
      }
    };

    preloadImages();
  }, [lessons]);

  return { isPreloading };
}

