
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useHangulLessons } from "@/hooks/useHangulLessons";
import { type LessonSection } from "@/hooks/useHangulLessons";

interface HangulProgressProps {
  currentLesson: number;
  totalLessons: number;
  theme: 'temple' | 'hanbok' | 'seasonal' | 'garden' | 'palace';
}

export function HangulProgress({ currentLesson, totalLessons, theme }: HangulProgressProps) {
  const { calculateSectionProgress, currentSection } = useHangulLessons();
  const progressPercentage = calculateSectionProgress(currentSection);

  const themeColors = {
    temple: "bg-[#D46A6A]",
    hanbok: "bg-[#9b87f5]",
    seasonal: "bg-[#95D1CC]",
    garden: "bg-[#68B984]",
    palace: "bg-[#8B5CF6]",
  };

  const themeIcons = {
    temple: "🏛️",
    hanbok: "👘",
    seasonal: "🌸",
    garden: "🌿",
    palace: "👑",
  };

  const sectionMap = {
    vowels: "Vowels",
    basic_consonants: "Basic Consonants",
    advanced_consonants: "Advanced Consonants"
  };

  // Calculate section-specific lesson numbers
  const sectionSize = Math.ceil(totalLessons / 3);
  const sectionStartIndex = currentSection === 'vowels' ? 0 :
                          currentSection === 'basic_consonants' ? sectionSize :
                          sectionSize * 2;
  const sectionCurrentLesson = currentLesson - sectionStartIndex;
  const sectionTotalLessons = currentSection === 'advanced_consonants' ? 
                             totalLessons - (sectionSize * 2) : 
                             sectionSize;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span className="flex items-center gap-2">
          <span className="text-lg">{themeIcons[theme]}</span>
          <span>{sectionMap[currentSection]} - Lesson {sectionCurrentLesson} of {sectionTotalLessons}</span>
        </span>
        <span>{Math.round(progressPercentage)}%</span>
      </div>
      <Progress 
        value={progressPercentage} 
        className={cn(
          "h-2 transition-all duration-500",
          themeColors[theme]
        )} 
      />
    </div>
  );
}
