
import { useState, useEffect, useCallback, useMemo } from "react";
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
  const [userProgress, setUserProgress] = useState<Set<string>>(new Set());
  
  const { toast } = useToast();
  const location = useLocation();
  const { globalLessons } = useAppStateContext();

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

  useEffect(() => {
    let mounted = true;
    
    const fetchUserProgress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && mounted) {
          const { data: progressData, error } = await supabase
            .from('hangul_progress')
            .select('character_id')
            .eq('user_id', user.id);

          if (error) {
            console.error("❌ Error fetching user progress:", error);
            return;
          }

          if (progressData && mounted) {
            const progressSet = new Set(progressData.map(p => p.character_id));
            setUserProgress(progressSet);
            
            const firstIncompleteIndex = filteredLessons.findIndex(lesson => 
              !progressSet.has(lesson.id)
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

    if (filteredLessons.length > 0) {
      fetchUserProgress();
    } else {
      setIsLoading(false);
    }

    return () => {
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
    userProgress,
  };
}
