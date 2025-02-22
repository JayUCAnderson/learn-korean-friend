
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLearningSession } from "@/hooks/useLearningSession";
import { Loader2 } from "lucide-react";

const LearningInterface = ({ userData }: { userData: any }) => {
  const [dailyProgress, setDailyProgress] = useState(0);
  const { toast } = useToast();
  const { startSession, isLoading } = useLearningSession();

  useEffect(() => {
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
          // Create today's progress entry if it doesn't exist
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

    fetchDailyProgress();
  }, [toast]);

  const handleStartLearning = async () => {
    try {
      const interest = Array.isArray(userData.interests) && userData.interests.length > 0 
        ? userData.interests[0]
        : 'general';

      const content = await startSession(interest, userData.level, 'conversation');
      
      if (content) {
        toast({
          title: "Lesson ready!",
          description: "Your personalized lesson has been generated.",
        });
        console.log("Generated content:", content);
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className={`p-6 hover:shadow-lg transition-shadow cursor-pointer backdrop-blur-sm bg-white/50 ${theme.border}`}>
            <h3 className="text-lg font-semibold mb-2">{getLessonsByInterest()}</h3>
            <p className="text-gray-500 mb-4">Tailored to your interests</p>
            <Button 
              className={`w-full ${theme.button}`}
              onClick={handleStartLearning}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Start Learning'
              )}
            </Button>
          </Card>

          <Card className={`p-6 hover:shadow-lg transition-shadow cursor-pointer backdrop-blur-sm bg-white/50 ${theme.border}`}>
            <h3 className="text-lg font-semibold mb-2">{getGoalBasedContent()}</h3>
            <p className="text-gray-500 mb-4">Aligned with your goals</p>
            <Button className={`w-full ${theme.button}`}>
              Continue Learning
            </Button>
          </Card>

          <Card className={`p-6 hover:shadow-lg transition-shadow cursor-pointer backdrop-blur-sm bg-white/50 ${theme.border}`}>
            <h3 className="text-lg font-semibold mb-2">Interactive Practice</h3>
            <p className="text-gray-500 mb-4">Practice with AI conversation partner</p>
            <Button className={`w-full ${theme.button}`}>
              Start Conversation
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LearningInterface;

