
import { UserGreeting } from "./learning/UserGreeting";
import { LearningProgress } from "./learning/LearningProgress";
import { LearningPathContainer } from "./learning/LearningPathContainer";
import { HangulLearningContainer } from "./hangul/HangulLearningContainer";
import { getThemeColors } from "./learning/ThemeProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LearningInterface = ({ userData }: { userData: any }) => {
  const theme = getThemeColors(
    Array.isArray(userData.interests) && userData.interests.length > 0 
      ? userData.interests[0].toLowerCase()
      : ''
  );

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.gradient} p-4`}>
      <div className="max-w-6xl mx-auto space-y-8">
        <UserGreeting level={userData.level} />
        <LearningProgress themeColors={theme} />
        
        <Tabs defaultValue="hangul" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="hangul" className="flex-1">Hangul</TabsTrigger>
            <TabsTrigger value="lessons" className="flex-1">Lessons</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hangul" className="mt-6">
            <HangulLearningContainer />
          </TabsContent>
          
          <TabsContent value="lessons" className="mt-6">
            <LearningPathContainer userData={userData} themeColors={theme} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LearningInterface;
