
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useHangulLessons } from "@/hooks/useHangulLessons";

interface HangulProgressProps {
  theme: 'temple' | 'hanbok' | 'seasonal' | 'garden' | 'palace';
}

export function HangulProgress({ theme }: HangulProgressProps) {
  const { currentLessonInSection, sectionLessons, currentSection } = useHangulLessons();

  const themeColors = {
    temple: "bg-[#D46A6A]",
    hanbok: "bg-[#9b87f5]",
    seasonal: "bg-[#95D1CC]",
    garden: "bg-[#68B984]",
    palace: "bg-[#8B5CF6]",
  };

  const sectionMap = {
    vowels: "Vowels",
    basic_consonants: "Basic Consonants",
    advanced_consonants: "Advanced Consonants"
  };

  console.log('HangulProgress Debug:', {
    currentSection,
    sectionTitle: sectionMap[currentSection],
    currentLessonNumber: currentLessonInSection,
    totalLessons: sectionLessons,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{sectionMap[currentSection]} - Lesson {currentLessonInSection} of {sectionLessons}</span>
      </div>
      <Progress 
        value={(currentLessonInSection / sectionLessons) * 100} 
        className={cn(
          "h-2 transition-all duration-500",
          themeColors[theme]
        )} 
      />
    </div>
  );
}
