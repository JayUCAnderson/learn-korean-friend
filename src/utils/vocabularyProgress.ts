
import { supabase } from "@/integrations/supabase/client";
import type { VocabularyItem } from '@/types/learning';
import type { Database } from '@/integrations/supabase/types';

export const updateVocabularyProgress = async (
  userId: string, 
  vocabularyItems: VocabularyItem[], 
  performance?: number
) => {
  for (const vocab of vocabularyItems) {
    const { error: vocabError } = await supabase
      .from('vocabulary_progress')
      .insert({
        user_id: userId,
        vocabulary_item: vocab as unknown as Database['public']['Tables']['vocabulary_progress']['Insert']['vocabulary_item'],
        times_encountered: 1,
        times_correct: performance && performance >= 0.7 ? 1 : 0,
        last_reviewed: new Date().toISOString()
      })
      .select()
      .single();

    if (vocabError) console.error("Error updating vocabulary progress:", vocabError);
  }
};
