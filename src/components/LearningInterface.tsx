
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLearningSession } from "@/hooks/useLearningSession";
import { Loader2, BookOpen, Check, ChevronRight, Star } from "lucide-react";

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
        // Create a new lesson
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
        
        fetchLessons(); // Refresh lessons list
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

  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "좋은 아침이에요!";
    if (hour < 18) return "안녕하세요!";
    return "좋은 저녁이에요!";
  };

  const getLessonsByInterest = () => {
    const interest = Array.isArray(userData.interests) && userData.interests.length > 0 
      ? userData.interests[0].toLowerCase()
      : '';

    if (interest.includes("kpop") || interest.includes("music")) {
      return "Learn Korean through K-pop Lyrics";
    }
    if (interest.includes("drama") || interest.includes("movie")) {
      return "Korean Phrases from Popular Dramas";
    }
    if (interest.includes("food")) {
      return "Restaurant Conversations & Food Vocabulary";
    }
    if (interest.includes("tech")) {
      return "Business & Technical Korean";
    }
    return "Personalized Korean Conversation Practice";
  };

  const getGoalBasedContent = () => {
    switch (userData.learning_goal) {
      case "casual":
        return "Daily Conversation Skills";
      case "business":
        return "Business Korean Essentials";
      case "academic":
        return "Academic Writing in Korean";
      case "culture":
        return "Cultural Context & Etiquette";
      default:
        return "Korean Language Fundamentals";
    }
  };

  const theme = getThemeColors();

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.gradient} p-4`}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="https://api.dicebear.com/7.x/adventurer/svg?seed=Felix" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{getPersonalizedGreeting()}</h1>
              <p className="text-gray-500">Your personal Korean tutor is here to help!</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Current Level</p>
            <p className="text-lg font-semibold text-korean-600">
              {userData.level.charAt(0).toUpperCase() + userData.level.slice(1)}
            </p>
          </div>
        </div>

        <Card className={`p-6 ${theme.border} backdrop-blur-sm bg-white/50`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Today's Learning Journey</h2>
            <p className="text-sm text-gray-500">{dailyProgress}% Complete</p>
          </div>
          <Progress value={dailyProgress} className={`mb-2 ${theme.accent}`} />
          <p className="text-sm text-gray-500">Keep going! You're doing great!</p>
        </Card>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Learning Path</h2>
          
          {isLoadingLessons ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-korean-600" />
            </div>
          ) : lessons.length === 0 ? (
            <Card className={`p-6 text-center ${theme.border} backdrop-blur-sm bg-white/50`}>
              <h3 className="text-lg font-semibold mb-4">Start Your Korean Learning Journey</h3>
              <Button 
                className={`${theme.button}`}
                onClick={handleStartLearning}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating your first lesson...
                  </>
                ) : (
                  'Generate Your First Lesson'
                )}
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {lessons.map((lesson) => (
                <Card 
                  key={lesson.id}
                  className={`p-4 ${theme.border} backdrop-blur-sm bg-white/50 transition-all hover:shadow-lg`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {lesson.status === 'completed' ? (
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="h-6 w-6 text-green-600" />
                        </div>
                      ) : lesson.status === 'in_progress' ? (
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Star className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{lesson.title}</h3>
                        <p className="text-sm text-gray-500">{lesson.description}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </Card>
              ))}
              
              <Button 
                className={`w-full ${theme.button} mt-4`}
                onClick={handleStartLearning}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Next Lesson'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningInterface;
