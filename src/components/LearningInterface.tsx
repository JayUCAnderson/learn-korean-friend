
import { UserGreeting } from "./learning/UserGreeting";
import { LearningProgress } from "./learning/LearningProgress";
import { getThemeColors } from "./learning/ThemeProvider";
import { Card } from "@/components/ui/card";
import { Book, Scroll } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const LearningInterface = ({ userData }: { userData: any }) => {
  const [hangulCompleted, setHangulCompleted] = useState(false);
  const [isCheckingProgress, setIsCheckingProgress] = useState(true);
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
    navigate("/lessons");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-4 space-y-8">
        <UserGreeting level={userData.level} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Hangul Learning Path Card */}
          <Card 
            className="group relative overflow-hidden p-6 cursor-pointer transition-all duration-300
              hover:shadow-lg border-none bg-white ring-1 ring-black/5"
            onClick={navigateToHangul}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50" />
            <div className="relative flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-100">
                <Scroll className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">한글 Hangul</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  Master the Korean alphabet through an immersive learning experience inspired by traditional Korean culture.
                </p>
                <div className="inline-flex items-center text-sm font-medium text-purple-600">
                  {hangulCompleted ? 'Continue Learning →' : 'Start Learning →'}
                </div>
              </div>
            </div>
          </Card>

          {/* Regular Lessons Card */}
          <Card 
            className="group relative overflow-hidden p-6 cursor-pointer transition-all duration-300
              hover:shadow-lg border-none bg-white ring-1 ring-black/5"
            onClick={handleLessonsClick}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-orange-50 opacity-50" />
            <div className="relative flex items-start gap-4">
              <div className="p-3 rounded-xl bg-rose-100">
                <Book className="h-6 w-6 text-rose-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Korean Lessons
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  Begin your journey through comprehensive Korean language lessons.
                </p>
                <div className="inline-flex items-center text-sm font-medium text-rose-600">
                  Start Learning →
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="relative">
          <LearningProgress themeColors={theme} />
        </div>
      </div>
    </div>
  );
};

export default LearningInterface;
