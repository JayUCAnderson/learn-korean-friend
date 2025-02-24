
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
  const { globalLessons } = useAppStateContext();

  console.log("🔄 useHangulLessons hook re-rendering", {
    currentPath: location.pathname,
    globalLessonsCount: globalLessons.length,
    currentIndex: currentLessonIndex,
    isLoading
  });

  // Memoize the section determination
  const currentSection = useMemo((): LessonSection => {
    console.log("📍 Calculating current section from path:", location.pathname);
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
    console.log("🎯 Filtering lessons for section:", currentSection);
    const filtered = globalLessons.filter(lesson => getLessonSection(lesson) === currentSection);
    console.log("📊 Filtered lessons count:", filtered.length);
    return filtered;
  }, [globalLessons, getLessonSection, currentSection]);

  const handleNext = useCallback(() => {
    console.log("⏭️ Handling next lesson", {
      current: currentLessonIndex,
      total: filteredLessons.length
    });
    if (currentLessonIndex < filteredLessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
    }
  }, [currentLessonIndex, filteredLessons.length]);

  const handlePrevious = useCallback(() => {
    console.log("⏮️ Handling previous lesson", {
      current: currentLessonIndex
    });
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(prev => prev - 1);
    }
  }, [currentLessonIndex]);

  // Effect to handle user progress
  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!mountedRef.current || filteredLessons.length === 0) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log("👤 Fetching user progress for:", user.id);
          const { data: progress } = await supabase
            .from('hangul_progress')
            .select('character_id')
            .eq('user_id', user.id);

          if (progress) {
            const completedLessonIds = progress.map(p => p.character_id);
            console.log("✔️ Completed lessons:", completedLessonIds.length);
            
            const firstIncompleteIndex = filteredLessons.findIndex(lesson => 
              !completedLessonIds.includes(lesson.id)
            );
            
            if (firstIncompleteIndex !== -1) {
              console.log("📌 Setting current lesson index to:", firstIncompleteIndex);
              setCurrentLessonIndex(firstIncompleteIndex);
            }
          }
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
      console.log("🧹 Cleaning up useHangulLessons hook");
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

