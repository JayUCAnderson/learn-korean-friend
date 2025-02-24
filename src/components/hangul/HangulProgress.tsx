
import { useHangulLessons } from "@/hooks/useHangulLessons";
import { HangulProgressBar } from "./HangulProgressBar";

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

  return (
    <HangulProgressBar
      currentLesson={currentLessonInSection}
      totalLessons={sectionLessons}
      section={currentSection}
      className={themeColors[theme]}
    />
  );
}
