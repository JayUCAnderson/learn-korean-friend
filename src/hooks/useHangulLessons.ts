
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { useLocation } from 'react-router-dom';
import { useAppStateContext } from '@/contexts/AppStateContext';

type HangulLessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

export type LessonSection = 'vowels' | 'consonants';

export function useHangulLessons() {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const location = useLocation();
  const mountedRef = useRef(false);
  const progressFetched = useRef(false);
  const { globalLessons } = useAppStateContext();

  // Memoize the section determination
  const currentSection = useMemo((): LessonSection => {
    if (location.pathname.includes('consonants')) return 'consonants';
    return 'vowels';
  }, [location.pathname]);

  const getLessonSection = useCallback((lesson: HangulLessonType): LessonSection => {
    if (!lesson) return 'vowels';
    if (lesson.character_type?.includes('vowel')) return 'vowels';
    return 'consonants';
  }, []);

  // Memoize filtered lessons
  const filteredLessons = useMemo(() => {
    const filtered = globalLessons.filter(lesson => getLessonSection(lesson) === currentSection);
    return filtered;
  }, [globalLessons, getLessonSection, currentSection]);

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

  // Effect to handle user progress
  useEffect(() => {
    if (!mountedRef.current || filteredLessons.length === 0 || progressFetched.current) return;

    const fetchUserProgress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: progress } = await supabase
            .from('hangul_progress')
            .select('character_id')
            .eq('user_id', user.id);

          if (progress) {
            const completedLessonIds = progress.map(p => p.character_id);
            const firstIncompleteIndex = filteredLessons.findIndex(lesson => 
              !completedLessonIds.includes(lesson.id)
            );
            
            if (firstIncompleteIndex !== -1) {
              setCurrentLessonIndex(firstIncompleteIndex);
            }
          }
          progressFetched.current = true;
        }
      } catch (error) {
        console.error("❌ Error fetching user progress:", error);
        toast({
          title: "Error",
          description: "Failed to load your progress. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    mountedRef.current = true;
    fetchUserProgress();

    return () => {
      mountedRef.current = false;
    };
  }, [filteredLessons, toast]);

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
