
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLearningSession } from "@/hooks/useLearningSession";
import { UserGreeting } from "./learning/UserGreeting";
import { DailyProgress } from "./learning/DailyProgress";
import { LessonList } from "./learning/LessonList";

interface Lesson {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  lesson_number: number;
  vocabulary: any[];
}

const LearningInterface = ({ userData }: { userData: any }) => {
  const [dailyProgress, setDailyProgress] = useState(0);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(true);
  const { toast } = useToast();
  const { startSession, isLoading } = useLearningSession();

  useEffect(() => {
    fetchDailyProgress();
    fetchLessons();
  }, []);

  const fetchDailyProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_progress')
        .select('progress_percentage')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setDailyProgress(data.progress_percentage);
      } else {
        const { error: insertError } = await supabase
          .from('daily_progress')
          .insert([
            {
              user_id: user.id,
              progress_percentage: 0,
              minutes_studied: 0
            }
          ]);

        if (insertError) throw insertError;
      }
    } catch (error: any) {
      console.error("Error fetching progress:", error);
      toast({
        title: "Error fetching progress",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
        const { error } = await supabase
          .from('lessons')
          .insert({
            user_id: userData.id,
            title: `Lesson ${lessons.length + 1}`,
            description: `Learn ${interest} related Korean`,
            content: content,
            lesson_number: lessons.length + 1,
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

  const getThemeColors = () => {
    const interest = Array.isArray(userData.interests) && userData.interests.length > 0 
      ? userData.interests[0].toLowerCase()
      : '';

    if (interest.includes("kpop") || interest.includes("music")) {
      return {
        gradient: "from-pink-100 to-purple-100",
        accent: "bg-korean-500",
        border: "border-pink-200",
        button: "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600",
      };
    }
    if (interest.includes("drama") || interest.includes("movie")) {
      return {
        gradient: "from-blue-50 to-indigo-100",
        accent: "bg-korean-600",
        border: "border-blue-200",
        button: "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
      };
    }
    if (interest.includes("food")) {
      return {
        gradient: "from-orange-50 to-red-100",
        accent: "bg-korean-500",
        border: "border-orange-200",
        button: "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
      };
    }
    if (interest.includes("tech")) {
      return {
        gradient: "from-cyan-50 to-blue-100",
        accent: "bg-korean-600",
        border: "border-cyan-200",
        button: "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600",
      };
    }
    return {
      gradient: "from-white to-gray-50",
      accent: "bg-korean-600",
      border: "border-korean-100",
      button: "bg-korean-600 hover:bg-korean-700",
    };
  };

  const theme = getThemeColors();

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.gradient} p-4`}>
      <div className="max-w-6xl mx-auto space-y-8">
        <UserGreeting level={userData.level} />
        <DailyProgress progress={dailyProgress} themeColors={theme} />
        
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Learning Path</h2>
          <LessonList 
            lessons={lessons}
            isLoadingLessons={isLoadingLessons}
            themeColors={theme}
            onGenerateLesson={handleStartLearning}
            isGenerating={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default LearningInterface;
