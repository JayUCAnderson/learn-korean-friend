
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useLearningSession } from "@/hooks/useLearningSession";
import { LessonList } from "./LessonList";
import type { Database } from '@/integrations/supabase/types';

interface Lesson {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  lesson_number: number;
  vocabulary: any[];
}

interface LearningPathContainerProps {
  userData: {
    id: string;
    interests: string[];
    level: Database['public']['Enums']['korean_level'];
  };
  themeColors: {
    border: string;
    button: string;
  };
}

export const LearningPathContainer = ({ userData, themeColors }: LearningPathContainerProps) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(true);
  const { toast } = useToast();
  const { startSession, isLoading } = useLearningSession();

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('lesson_number', { ascending: true });

      if (error) throw error;

      setLessons(data || []);
    } catch (error: any) {
      console.error("Error fetching lessons:", error);
      toast({
        title: "Error fetching lessons",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingLessons(false);
    }
  };

  const handleStartLearning = async () => {
    try {
      const interest = Array.isArray(userData.interests) && userData.interests.length > 0 
        ? userData.interests[0]
        : 'general';

      const content = await startSession(interest, userData.level, 'conversation');
      
      if (content) {
        const lessonNumber = lessons.length + 1;
        const { error } = await supabase
          .from('lessons')
          .insert({
            user_id: userData.id,
            title: content.title,
            description: content.description,
            content: content.content,
            lesson_number: lessonNumber,
            status: 'not_started'
          });

        if (error) throw error;

        toast({
          title: "Lesson ready!",
          description: "Your personalized lesson has been generated.",
        });
        
        fetchLessons();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate lesson content. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Your Learning Path</h2>
      <LessonList 
        lessons={lessons}
        isLoadingLessons={isLoadingLessons}
        themeColors={themeColors}
        onGenerateLesson={handleStartLearning}
        isGenerating={isLoading}
      />
    </div>
  );
};
