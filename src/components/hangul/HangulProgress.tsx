
import { Progress } from "@/components/ui/progress";

interface HangulProgressProps {
  currentLesson: number;
  totalLessons: number;
}

export function HangulProgress({ currentLesson, totalLessons }: HangulProgressProps) {
  const progressPercentage = (currentLesson / totalLessons) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Lesson {currentLesson} of {totalLessons}</span>
        <span>{Math.round(progressPercentage)}%</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
}
