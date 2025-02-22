
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const LearningInterface = ({ userData }: { userData: any }) => {
  const [dailyProgress, setDailyProgress] = useState(33);

  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "좋은 아침이에요!";
    if (hour < 18) return "안녕하세요!";
    return "좋은 저녁이에요!";
  };

  const getLessonsByInterest = () => {
    const interest = userData.interests.toLowerCase();
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
    switch (userData.goals) {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-4">
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

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Today's Learning Journey</h2>
            <p className="text-sm text-gray-500">33% Complete</p>
          </div>
          <Progress value={dailyProgress} className="mb-2" />
          <p className="text-sm text-gray-500">Keep going! You're doing great!</p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-korean-100">
            <h3 className="text-lg font-semibold mb-2">{getLessonsByInterest()}</h3>
            <p className="text-gray-500 mb-4">Tailored to your interests</p>
            <Button className="w-full bg-korean-600 hover:bg-korean-700">
              Start Learning
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">{getGoalBasedContent()}</h3>
            <p className="text-gray-500 mb-4">Aligned with your goals</p>
            <Button className="w-full bg-korean-600 hover:bg-korean-700">
              Continue Learning
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">Interactive Practice</h3>
            <p className="text-gray-500 mb-4">Practice with AI conversation partner</p>
            <Button className="w-full bg-korean-600 hover:bg-korean-700">
              Start Conversation
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LearningInterface;
