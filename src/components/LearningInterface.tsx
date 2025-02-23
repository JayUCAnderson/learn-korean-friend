
import { UserGreeting } from "./learning/UserGreeting";
import { LearningProgress } from "./learning/LearningProgress";
import { LearningPathContainer } from "./learning/LearningPathContainer";
import { HangulLearningContainer } from "./hangul/HangulLearningContainer";
import { getThemeColors } from "./learning/ThemeProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";

const LearningInterface = ({ userData }: { userData: any }) => {
  const [activeTab, setActiveTab] = useState("hangul");
  const [hangulCompleted, setHangulCompleted] = useState(false);
  const [isCheckingProgress, setIsCheckingProgress] = useState(true);
  const { toast } = useToast();
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
      // Get total number of Hangul lessons
      const { data: hangulLessons, error: lessonError } = await supabase
        .from('hangul_lessons')
        .select('id');

      if (lessonError) throw lessonError;

      // Get user's completed lessons
      const { data: progress, error: progressError } = await supabase
        .from('hangul_progress')
        .select('*')
        .eq('user_id', userData.id);

      if (progressError) throw progressError;

      // Check if user has completed all lessons
      const isComplete = progress && progress.length >= hangulLessons.length;
      setHangulCompleted(isComplete);
    } catch (error) {
      console.error("Error checking Hangul progress:", error);
    } finally {
      setIsCheckingProgress(false);
    }
  };

  const handleTabChange = (value: string) => {
    if (value === "lessons" && !hangulCompleted) {
      toast({
        title: "Complete Hangul First",
        description: "Please complete the Hangul lessons before moving on to other content.",
        variant: "destructive",
      });
      return;
    }
    setActiveTab(value);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.gradient} p-4`}>
      <div className="max-w-6xl mx-auto space-y-8">
        <UserGreeting level={userData.level} />
        <LearningProgress themeColors={theme} />
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="hangul" className="flex-1">Hangul</TabsTrigger>
            <TabsTrigger value="lessons" className="flex-1 relative">
              Lessons
              {!hangulCompleted && (
                <Lock className="w-4 h-4 ml-2 inline-block text-gray-400" />
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="hangul" className="mt-6">
            {!hangulCompleted && (
              <Alert className="mb-6">
                <AlertDescription>
                  Complete the Hangul lessons to unlock additional content. Master the Korean alphabet first!
                </AlertDescription>
              </Alert>
            )}
            <HangulLearningContainer onComplete={checkHangulProgress} />
          </TabsContent>
          
          <TabsContent value="lessons" className="mt-6">
            {hangulCompleted ? (
              <LearningPathContainer userData={userData} themeColors={theme} />
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Lessons Locked</h3>
                <p className="text-gray-600">
                  Complete the Hangul section first to unlock additional lessons.
                  This ensures you have a strong foundation in Korean writing.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LearningInterface;
