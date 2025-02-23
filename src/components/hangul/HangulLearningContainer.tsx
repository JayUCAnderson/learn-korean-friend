
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { HangulLesson } from "./HangulLesson";
import { HangulProgress } from "./HangulProgress";
import type { Database } from "@/integrations/supabase/types";

type HangulLessonType = Database['public']['Tables']['hangul_lessons']['Row'];

interface HangulLearningContainerProps {
  onComplete?: () => void;
}

export function HangulLearningContainer({ onComplete }: HangulLearningContainerProps) {
  const [lessons, setLessons] = useState<HangulLessonType[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchHangulLessons();
  }, []);

  const fetchHangulLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('hangul_lessons')
        .select('*')
        .order('lesson_order', { ascending: true });

      if (error) throw error;

      setLessons(data || []);
      
      // Find the first incomplete lesson
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: progress } = await supabase
          .from('hangul_progress')
          .select('character_id')
          .eq('user_id', user.id);

        if (progress) {
          const completedLessonIds = progress.map(p => p.character_id);
          const firstIncompleteIndex = data?.findIndex(lesson => 
            !completedLessonIds.includes(lesson.id)
          );
          if (firstIncompleteIndex !== -1 && firstIncompleteIndex !== undefined) {
            setCurrentLessonIndex(firstIncompleteIndex);
          }
        }
      }
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
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-korean-600"></div>
      </div>
    );
  }

  if (!lessons.length) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No Hangul lessons available.</p>
      </div>
    );
  }

  const handleLessonComplete = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
    } else {
      toast({
        title: "Congratulations! 축하해요!",
        description: "You've completed all Hangul lessons! Now you can move on to other content.",
      });
    }
    // Notify parent component to check progress
    onComplete?.();
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-8">
        <HangulProgress 
          currentLesson={currentLessonIndex + 1} 
          totalLessons={lessons.length} 
        />
      </div>
      
      <HangulLesson 
        lesson={lessons[currentLessonIndex]} 
        onComplete={handleLessonComplete}
      />
    </div>
  );
}
