
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { useLocation } from 'react-router-dom';

type HangulLessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

export type LessonSection = 'vowels' | 'consonants';

export function useHangulLessons() {
  const [lessons, setLessons] = useState<HangulLessonType[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const location = useLocation();

  const currentSection = useMemo((): LessonSection => {
    if (location.pathname.includes('consonants')) return 'consonants';
    return 'vowels';
  }, [location.pathname]);

  const getLessonSection = useCallback((lesson: HangulLessonType): LessonSection => {
    if (!lesson) return 'vowels';
    if (lesson.character_type?.includes('vowel')) return 'vowels';
    return 'consonants';
  }, []);

  const filteredLessons = useMemo(() => 
    lessons.filter(lesson => getLessonSection(lesson) === currentSection),
    [lessons, getLessonSection, currentSection]
  );

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

  const fetchLessons = useCallback(async () => {
    if (lessons.length > 0) return;

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
            getLessonSection(lesson) === currentSection
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
  }, [currentSection, getLessonSection, lessons.length, toast]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return {
    lessons: filteredLessons,
    currentLessonIndex,
    setCurrentLessonIndex,
    isLoading,
    handleNext,
    handlePrevious,
    currentSection,
    getLessonSection,
  };
}
