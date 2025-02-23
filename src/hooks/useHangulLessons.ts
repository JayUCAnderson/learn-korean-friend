
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
    const lesson = lessons[index];
    if (!lesson) return 'vowels';
    
    if (lesson.character_type?.includes('vowel')) return 'vowels';
    if (lesson.character_type?.includes('final_consonant')) return 'advanced_consonants';
    return 'basic_consonants';
  }, [lessons]);

  const getSectionLessons = useCallback((section: LessonSection): number => {
    return lessons.filter(lesson => {
      switch (section) {
        case 'vowels':
          return lesson.character_type?.includes('vowel');
        case 'basic_consonants':
          return lesson.character_type?.includes('consonant') && 
                 !lesson.character_type?.includes('final_consonant');
        case 'advanced_consonants':
          return lesson.character_type?.includes('final_consonant');
        default:
          return false;
      }
    }).length;
  }, [lessons]);

  const currentSection = getLessonSection(currentLessonIndex);
  const sectionLessons = getSectionLessons(currentSection);

  const currentLessonInSection = lessons.filter((lesson, index) => {
    return index < currentLessonIndex && getLessonSection(index) === currentSection;
  }).length;

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
}
