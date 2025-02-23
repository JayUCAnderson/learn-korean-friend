
import { useState, useEffect } from "react";
import type { Database } from "@/integrations/supabase/types";

type HangulLessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];
export const imageCache = new Map<string, string>();
export let isPreloadComplete = false;

export function useHangulImagePreloader(lessons: HangulLessonType[]) {
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
          if (!lesson.mnemonic_image_url) {
            console.log(`No mnemonic image URL for character: ${lesson.character}`);
            return;
          }

          // Skip if already cached
          if (imageCache.has(lesson.character)) {
            console.log("Using cached image for:", lesson.character);
            return;
          }

          try {
            // Preload and cache image
            const img = new Image();
            img.src = lesson.mnemonic_image_url;
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            });
            imageCache.set(lesson.character, lesson.mnemonic_image_url);
            console.log(`Successfully preloaded image for ${lesson.character}`);
          } catch (error) {
            console.error(`Error preloading image for character ${lesson.character}:`, error);
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
