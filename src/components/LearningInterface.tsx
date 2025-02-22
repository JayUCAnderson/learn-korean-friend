
import { UserGreeting } from "./learning/UserGreeting";
import { LearningProgress } from "./learning/LearningProgress";
import { LearningPathContainer } from "./learning/LearningPathContainer";
import { getThemeColors } from "./learning/ThemeProvider";

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
        <LearningProgress />
        <LearningPathContainer userData={userData} themeColors={theme} />
      </div>
    </div>
  );
};

export default LearningInterface;
