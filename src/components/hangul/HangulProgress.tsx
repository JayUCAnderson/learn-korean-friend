
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useHangulLessons } from "@/hooks/useHangulLessons";

interface HangulProgressProps {
  theme: 'temple' | 'hanbok' | 'seasonal' | 'garden' | 'palace';
}

export function HangulProgress({ theme }: HangulProgressProps) {
  const { currentLessonInSection, sectionLessons, currentSection } = useHangulLessons();
  const progressPercentage = (currentLessonInSection / sectionLessons) * 100;

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span className="flex items-center gap-2">
          <span className="text-lg">{themeIcons[theme]}</span>
          <span>{sectionMap[currentSection]} - Lesson {currentLessonInSection} of {sectionLessons}</span>
        </span>
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
