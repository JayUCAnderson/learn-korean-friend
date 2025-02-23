
import { UserGreeting } from "./learning/UserGreeting";
import { LearningProgress } from "./learning/LearningProgress";
import { LearningPathContainer } from "./learning/LearningPathContainer";
import { getThemeColors } from "./learning/ThemeProvider";
import { Card } from "@/components/ui/card";
import { Book, Scroll } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const LearningInterface = ({ userData }: { userData: any }) => {
  const [hangulCompleted, setHangulCompleted] = useState(false);
  const [isCheckingProgress, setIsCheckingProgress] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const theme = getThemeColors(
    Array.isArray(userData.interests) && userData.interests.length > 0 
      ? userData.interests[0].toLowerCase()
      : ''
  );

  useEffect(() => {
    checkHangulProgress();
  }, []);

  const checkHangulProgress = async () => {
    try {
      const { data: hangulLessons, error: lessonError } = await supabase
        .from('hangul_lessons')
        .select('id');

      if (lessonError) throw lessonError;

      const { data: progress, error: progressError } = await supabase
        .from('hangul_progress')
        .select('*')
        .eq('user_id', userData.id);

      if (progressError) throw progressError;

      const isComplete = progress && progress.length >= hangulLessons.length;
      setHangulCompleted(isComplete);
    } catch (error) {
      console.error("Error checking Hangul progress:", error);
    } finally {
      setIsCheckingProgress(false);
    }
  };

  const navigateToHangul = () => {
    navigate("/hangul");
  };

  const handleLessonsClick = () => {
    if (!hangulCompleted) {
      toast({
        title: "Complete Hangul First",
        description: "Please complete the Hangul lessons before moving on to other content.",
        variant: "destructive",
      });
      return;
    }
    // Show lessons content
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#FFDEE2] via-[#9b87f5] to-[#6E59A5] p-4`}>
      <div className="max-w-6xl mx-auto space-y-8">
        <UserGreeting level={userData.level} />
        <LearningProgress themeColors={theme} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Hangul Learning Path Card */}
          <Card 
            className="group relative overflow-hidden p-6 cursor-pointer hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-lg border-2 border-[#9b87f5]"
            onClick={navigateToHangul}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#9b87f5]/10 to-[#D946EF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-[#9b87f5] bg-opacity-10">
                <Scroll className="h-8 w-8 text-[#7E69AB]" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">한글 Hangul</h3>
                <p className="text-gray-600 mb-4">
                  Master the Korean alphabet through an immersive learning experience inspired by traditional Korean culture.
                </p>
                <div className="inline-flex items-center text-sm font-medium text-[#7E69AB]">
                  Start Learning →
                </div>
              </div>
            </div>
          </Card>

          {/* Regular Lessons Card */}
          <Card 
            className={`group relative overflow-hidden p-6 cursor-pointer transition-all duration-300 
              ${hangulCompleted ? 'hover:shadow-lg bg-white/90' : 'bg-gray-100'} 
              backdrop-blur-lg border-2 ${hangulCompleted ? 'border-[#ea384c]' : 'border-gray-200'}`}
            onClick={handleLessonsClick}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-[#ea384c]/10 to-[#D946EF]/10 opacity-0 
              ${hangulCompleted ? 'group-hover:opacity-100' : ''} transition-opacity duration-300`} 
            />
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${hangulCompleted ? 'bg-[#ea384c] bg-opacity-10' : 'bg-gray-200'}`}>
                <Book className={`h-8 w-8 ${hangulCompleted ? 'text-[#ea384c]' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-2 ${hangulCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                  Korean Lessons
                </h3>
                <p className={`mb-4 ${hangulCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                  {hangulCompleted 
                    ? "Begin your journey through comprehensive Korean language lessons."
                    : "Complete Hangul lessons first to unlock this learning path."}
                </p>
                <div className={`inline-flex items-center text-sm font-medium ${
                  hangulCompleted ? 'text-[#ea384c]' : 'text-gray-400'
                }`}>
                  {hangulCompleted ? 'Start Learning →' : 'Locked'}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {hangulCompleted && (
          <div className="mt-8">
            <LearningPathContainer userData={userData} themeColors={theme} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningInterface;
