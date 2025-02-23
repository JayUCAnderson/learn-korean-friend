
import type { Database } from '@/integrations/supabase/types';

export type ContentType = Database['public']['Enums']['content_type'];
export type KoreanLevel = Database['public']['Enums']['korean_level'];

export interface VocabularyItem {
  korean: string;
  english: string;
  pronunciation?: string;
  partOfSpeech?: string;
}

export interface LearningContent {
  title: string;
  description: string;
  content: string | {
    content: string;
    vocabulary?: VocabularyItem[];
  };
  difficulty_level: number;
  target_skills: string[];
  key_points: string[];
}

export interface ParsedContent {
  setting?: string;
  dialogue?: Array<{
    speaker: string;
    koreanText: string;
    englishText: string;
  }>;
  vocabulary?: VocabularyItem[];
}
