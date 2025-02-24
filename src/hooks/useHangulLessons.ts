
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { useSearchParams } from 'react-router-dom';

type HangulLessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

export type LessonSection = 'vowels' | 'consonants';

export function useHangulLessons() {
  const [lessons, setLessons] = useState<HangulLessonType[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const sectionParam = searchParams.get('section') as LessonSection | null;

  const getLessonSection = useCallback((lesson: HangulLessonType): LessonSection => {
    if (!lesson) return 'vowels';
    return lesson.character_type?.includes('vowel') ? 'vowels' : 'consonants';
  }, []);

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
          const sectionLessons = lessonsData.filter(lesson => 
            getLessonSection(lesson) === sectionParam
          );
          
          if (sectionLessons.length > 0) {
            const firstIncompleteIndex = sectionLessons.findIndex(lesson => 
              !completedLessonIds.includes(lesson.id)
            );
            if (firstIncompleteIndex !== -1) {
              setCurrentLessonIndex(firstIncompleteIndex);
            }
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
  }, [toast, getLessonSection, sectionParam]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const filteredLessons = sectionParam
    ? lessons.filter(lesson => getLessonSection(lesson) === sectionParam)
    : lessons;

  const handleNext = useCallback(() => {
    if (currentLessonIndex < filteredLessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
    }
  }, [currentLessonIndex, filteredLessons.length]);

  const handlePrevious = useCallback(() => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(prev => prev - 1);
    }
  }, [currentLessonIndex]);

  const currentSection = sectionParam || 
    (filteredLessons[currentLessonIndex] 
      ? getLessonSection(filteredLessons[currentLessonIndex]) 
      : 'vowels');

  return {
    lessons: filteredLessons,
    currentLessonIndex,
    setCurrentLessonIndex,
    isLoading,
    handleNext,
    handlePrevious,
    currentSection,
    getLessonSection,
    currentLessonInSection: currentLessonIndex + 1,
    sectionLessons: filteredLessons.length,
  };
}
