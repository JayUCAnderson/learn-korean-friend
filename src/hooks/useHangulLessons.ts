
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type HangulLessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

export function useHangulLessons() {
  const [lessons, setLessons] = useState<HangulLessonType[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    const fetchLessons = async () => {
      try {
        const { data, error } = await supabase
          .from('hangul_lessons_complete')
          .select('*')
          .order('lesson_order', { ascending: true });

        if (error) throw error;

        if (isMounted) {
          setLessons(data || []);
          
          // Find the first incomplete lesson
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: progress } = await supabase
              .from('hangul_progress')
              .select('character_id')
              .eq('user_id', user.id);

            if (progress && data) {
              const completedLessonIds = progress.map(p => p.character_id);
              const firstIncompleteIndex = data.findIndex(lesson => 
                !completedLessonIds.includes(lesson.id)
              );
              if (firstIncompleteIndex !== -1) {
                setCurrentLessonIndex(firstIncompleteIndex);
              }
            }
          }
        }
      } catch (error: any) {
        console.error("Error fetching Hangul lessons:", error);
        if (isMounted) {
          toast({
            title: "Error",
            description: "Failed to load Hangul lessons. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLessons();
    
    return () => {
      isMounted = false;
    };
  }, []); // Only run once on mount

  const handleNext = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(prev => prev - 1);
    }
  };

  return {
    lessons,
    currentLessonIndex,
    isLoading,
    handleNext,
    handlePrevious,
  };
}
