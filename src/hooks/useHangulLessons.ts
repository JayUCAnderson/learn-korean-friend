
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { useLocation } from 'react-router-dom';
import { useAppStateContext } from '@/contexts/AppStateContext';

type HangulLessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

export type LessonSection = 'vowels' | 'consonants';

export function useHangulLessons() {
  // 1. Initialize all state and refs first
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // 2. All context hooks
  const { toast } = useToast();
  const location = useLocation();
  const { globalLessons } = useAppStateContext();

  // 3. All memoized values
  const currentSection = useMemo((): LessonSection => {
    if (location.pathname.includes('consonants')) return 'consonants';
    return 'vowels';
  }, [location.pathname]);

  const getLessonSection = useCallback((lesson: HangulLessonType): LessonSection => {
    if (!lesson) return 'vowels';
    if (lesson.character_type?.includes('vowel')) return 'vowels';
    return 'consonants';
  }, []);

  const filteredLessons = useMemo(() => {
    return globalLessons.filter(lesson => getLessonSection(lesson) === currentSection);
  }, [globalLessons, getLessonSection, currentSection]);

  // 4. All callbacks
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

  // 5. Effects come last
  useEffect(() => {
    let mounted = true;
    
    const fetchUserProgress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && mounted) {
          const { data: progress } = await supabase
            .from('hangul_progress')
            .select('character_id')
            .eq('user_id', user.id);

          if (progress && mounted) {
            const completedLessonIds = progress.map(p => p.character_id);
            const firstIncompleteIndex = filteredLessons.findIndex(lesson => 
              !completedLessonIds.includes(lesson.id)
            );
            
            if (firstIncompleteIndex !== -1) {
              setCurrentLessonIndex(firstIncompleteIndex);
            }
          }
        }
      } catch (error) {
        console.error("❌ Error fetching user progress:", error);
        if (mounted) {
          toast({
            title: "Error",
            description: "Failed to load your progress. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Only fetch progress if we have lessons
    if (filteredLessons.length > 0) {
      fetchUserProgress();
    } else {
      setIsLoading(false);
    }

    return () => {
      console.log("🧹 Cleaning up useHangulLessons hook");
      mounted = false;
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
