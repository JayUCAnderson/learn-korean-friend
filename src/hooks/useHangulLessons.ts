
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type HangulLessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

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
  }, []); // Run only once on mount

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

  return {
    lessons,
    currentLessonIndex,
    isLoading,
    handleNext,
    handlePrevious,
  };
}
