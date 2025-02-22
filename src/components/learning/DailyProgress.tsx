
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DailyProgressProps {
  progress: number;
  themeColors: {
    border: string;
    accent: string;
  };
}

export const DailyProgress = ({ progress, themeColors }: DailyProgressProps) => {
  return (
    <Card className={`p-6 ${themeColors.border} backdrop-blur-sm bg-white/50`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Today's Learning Journey</h2>
        <p className="text-sm text-gray-500">{progress}% Complete</p>
      </div>
      <Progress value={progress} className={`mb-2 ${themeColors.accent}`} />
      <p className="text-sm text-gray-500">Keep going! You're doing great!</p>
    </Card>
  );
};
