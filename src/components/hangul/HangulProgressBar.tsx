
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { LessonSection } from "@/hooks/useHangulLessons";

interface HangulProgressBarProps {
  currentLesson: number;
  totalLessons: number;
  section: LessonSection;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sectionColors = {
  vowels: "bg-[#FFA5B9]",
  consonants: "bg-[#93C5FD]",
} as const;

export function HangulProgressBar({
  currentLesson,
  totalLessons,
  section,
  size = 'md',
  showText = true,
  className
}: HangulProgressBarProps) {
  const progress = (currentLesson / totalLessons) * 100;
  
  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className="space-y-2">
      {showText && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{currentLesson} of {totalLessons} ({Math.round(progress)}%)</span>
        </div>
      )}
      <Progress
        value={progress}
        className={cn(
          sizeClasses[size],
          "rounded-full transition-all duration-500",
          sectionColors[section],
          className
        )}
      />
    </div>
  );
}
