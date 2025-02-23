
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
  const sectionParam = searchParams.get('section') as LessonSection | null;

  const getLessonSection = useCallback((lesson: HangulLessonType): LessonSection => {
    if (!lesson) return 'vowels';
    if (lesson.character_type?.includes('vowel')) return 'vowels';
    if (lesson.character_type?.includes('final_consonant')) return 'advanced_consonants';
    return 'basic_consonants';
  }, []);

  // Filter lessons by section
  const filteredLessons = useCallback((allLessons: HangulLessonType[], section: LessonSection | null) => {
    if (!section) return allLessons;
    return allLessons.filter(lesson => getLessonSection(lesson) === section);
  }, [getLessonSection]);

  const fetchLessons = useCallback(async () => {
    try {
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('hangul_lessons_complete')
        .select('*')
        .order('lesson_order', { ascending: true });

      if (lessonsError) throw lessonsError;

      // Get the section-specific lessons
      const sectionLessons = filteredLessons(lessonsData || [], sectionParam);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: progress } = await supabase
          .from('hangul_progress')
          .select('character_id')
          .eq('user_id', user.id);

        if (progress && sectionLessons.length > 0) {
          const completedLessonIds = progress.map(p => p.character_id);
          const firstIncompleteIndex = sectionLessons.findIndex(lesson => 
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
  }, [toast, filteredLessons, sectionParam]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // Get section-specific lessons
  const sectionLessons = sectionParam
    ? lessons.filter(lesson => getLessonSection(lesson) === sectionParam)
    : lessons;

  const handleNext = useCallback(() => {
    if (currentLessonIndex < sectionLessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
    }
  }, [currentLessonIndex, sectionLessons.length]);

  const handlePrevious = useCallback(() => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(prev => prev - 1);
    }
  }, [currentLessonIndex]);

  // Always use the route section if available, fallback to derived section
  const currentSection = sectionParam || 
    (sectionLessons[currentLessonIndex] 
      ? getLessonSection(sectionLessons[currentLessonIndex]) 
      : 'vowels');

  return {
    lessons: sectionLessons,
    currentLessonIndex,
    setCurrentLessonIndex,
    isLoading,
    handleNext,
    handlePrevious,
    currentSection,
    getLessonSection,
    currentLessonInSection: currentLessonIndex + 1,
    sectionLessons: sectionLessons.length,
  };
}
