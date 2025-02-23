
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type HangulLessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

export type LessonSection = 'vowels' | 'basic_consonants' | 'advanced_consonants';

export function useHangulLessons() {
  const [lessons, setLessons] = useState<HangulLessonType[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchLessons = useCallback(async () => {
    try {
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('hangul_lessons_complete')
        .select('*')
        .order('lesson_order', { ascending: true });

      if (lessonsError) throw lessonsError;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: progress } = await supabase
          .from('hangul_progress')
          .select('character_id')
          .eq('user_id', user.id);

        if (progress && lessonsData) {
          const completedLessonIds = progress.map(p => p.character_id);
          const firstIncompleteIndex = lessonsData.findIndex(lesson => 
            !completedLessonIds.includes(lesson.id)
          );
          if (firstIncompleteIndex !== -1) {
            setCurrentLessonIndex(firstIncompleteIndex);
          }
        }
      }

      setLessons(lessonsData || []);
    } catch (error: any) {
      console.error("Error fetching Hangul lessons:", error);
      toast({
        title: "Error",
        description: "Failed to load Hangul lessons. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const handleNext = useCallback(() => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
    }
  }, [currentLessonIndex, lessons.length]);

  const handlePrevious = useCallback(() => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(prev => prev - 1);
    }
  }, [currentLessonIndex]);

  const getLessonSection = useCallback((index: number): LessonSection => {
    const vowelsCount = lessons.filter(l => l.character_type?.includes('vowel')).length;
    const basicConsonantsCount = lessons.filter(l => l.character_type?.includes('basic_consonant')).length;
    
    if (index < vowelsCount) return 'vowels';
    if (index < vowelsCount + basicConsonantsCount) return 'basic_consonants';
    return 'advanced_consonants';
  }, [lessons]);

  const getSectionLessons = useCallback((section: LessonSection): number => {
    switch (section) {
      case 'vowels':
        return lessons.filter(l => l.character_type?.includes('vowel')).length;
      case 'basic_consonants':
        return lessons.filter(l => l.character_type?.includes('basic_consonant')).length;
      case 'advanced_consonants':
        return lessons.filter(l => l.character_type?.includes('advanced_consonant')).length;
      default:
        return 0;
    }
  }, [lessons]);

  const currentSection = getLessonSection(currentLessonIndex);
  const sectionLessons = getSectionLessons(currentSection);
  const sectionStartIndex = currentSection === 'vowels' ? 0 :
    currentSection === 'basic_consonants' ? 
    getSectionLessons('vowels') :
    getSectionLessons('vowels') + getSectionLessons('basic_consonants');
  
  const currentLessonInSection = currentLessonIndex - sectionStartIndex;

  return {
    lessons,
    currentLessonIndex,
    setCurrentLessonIndex,
    isLoading,
    handleNext,
    handlePrevious,
    currentSection,
    getLessonSection,
    currentLessonInSection,
    sectionLessons,
  };
};
