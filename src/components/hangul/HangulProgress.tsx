
import { useHangulLessons } from "@/hooks/useHangulLessons";
import { HangulProgressBar } from "./HangulProgressBar";

interface HangulProgressProps {
  theme: 'temple' | 'hanbok' | 'seasonal' | 'garden' | 'palace';
  currentLesson: number;
  totalLessons: number;
}

export function HangulProgress({ theme, currentLesson, totalLessons }: HangulProgressProps) {
  const { currentSection } = useHangulLessons();

  const themeColors = {
    temple: "bg-[#D46A6A]",
    hanbok: "bg-[#9b87f5]",
    seasonal: "bg-[#95D1CC]",
    garden: "bg-[#68B984]",
    palace: "bg-[#8B5CF6]",
  };

  return (
    <HangulProgressBar
      currentLesson={currentLesson}
      totalLessons={totalLessons}
      section={currentSection}
      className={themeColors[theme]}
    />
  );
}
