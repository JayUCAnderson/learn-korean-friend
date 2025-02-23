
import type { Database } from "@/integrations/supabase/types";

type LessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

export function useMnemonicImage(lesson: LessonType) {
  return {
    mnemonicImage: lesson?.mnemonic_image_url || null,
    isLoadingImage: false
  };
}
