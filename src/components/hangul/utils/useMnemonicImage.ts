
import { useState, useCallback } from "react";
import type { Database } from "@/integrations/supabase/types";
import { imageCache } from "@/hooks/useHangulImagePreloader";

type LessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

export function useMnemonicImage(lesson: LessonType) {
  // Simply return the image URL from cache or database
  const cachedImage = lesson?.character ? imageCache.get(lesson.character) : null;
  return {
    mnemonicImage: cachedImage || lesson?.mnemonic_image_url || null,
    isLoadingImage: false
  };
}
