
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
        const preloadPromises = lessons.map(async (lesson) => {
          if (!lesson.mnemonic_image_url || imageCache.has(lesson.character)) {
            return;
          }

          try {
            const img = new Image();
            img.src = lesson.mnemonic_image_url;
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            });
            imageCache.set(lesson.character, lesson.mnemonic_image_url);
          } catch (error) {
            console.error(`Error preloading image for ${lesson.character}:`, error);
          }
        });

        await Promise.all(preloadPromises);
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
