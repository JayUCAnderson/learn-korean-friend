
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { useSearchParams } from 'react-router-dom';

type HangulLessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

export type LessonSection = 'vowels' | 'basic_consonants' | 'advanced_consonants';

export function useHangulLessons() {
  const [lessons, setLessons] = useState<HangulLessonType[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

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

  const getLessonSection = useCallback((lesson: HangulLessonType): LessonSection => {
    if (lesson.character_type?.includes('vowel')) return 'vowels';
    if (lesson.character_type?.includes('final_consonant')) return 'advanced_consonants';
    return 'basic_consonants';
  }, []);

  // Calculate current section and progress
  const currentLesson = lessons[currentLessonIndex];
  const currentSection = currentLesson ? getLessonSection(currentLesson) : 'vowels';
  
  // Filter lessons by current section
  const sectionLessons = lessons.filter(lesson => 
    getLessonSection(lesson) === currentSection
  ).length;

  // Calculate current lesson number within section
  const currentLessonInSection = lessons.filter((lesson, index) => 
    index <= currentLessonIndex && getLessonSection(lesson) === currentSection
  ).length;

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
