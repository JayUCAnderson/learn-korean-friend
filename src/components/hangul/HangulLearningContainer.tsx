
import { useToast } from "@/hooks/use-toast";
import { HangulLesson } from "./HangulLesson";
import { HangulProgress } from "./HangulProgress";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";
import { useHangulLessons } from "@/hooks/useHangulLessons";
import { cn } from "@/lib/utils";

interface HangulLearningContainerProps {
  onComplete?: () => void;
}

export function HangulLearningContainer({ onComplete }: HangulLearningContainerProps) {
  const { lessons, currentLessonIndex, isLoading, handleNext, handlePrevious } = useHangulLessons();
  const { toast } = useToast();

  const handleLessonComplete = () => {
    if (currentLessonIndex < lessons.length - 1) {
      handleNext();
    } else {
      toast({
        title: "Congratulations! 축하해요!",
        description: "You've completed all Hangul lessons! Now you can move on to other content.",
      });
    }
    onComplete?.();
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!lessons.length) {
    return <EmptyState />;
  }

  // Calculate which theme section we're in based on lesson index
  const getThemeSection = (index: number, total: number) => {
    const progress = (index / total) * 100;
    if (progress < 20) return "temple";
    if (progress < 40) return "hanbok";
    if (progress < 60) return "seasonal";
    if (progress < 80) return "garden";
    return "palace";
  };

  const themeSection = getThemeSection(currentLessonIndex, lessons.length);
  
  // Define background gradients for each theme
  const themeGradients = {
    temple: "from-[#D46A6A] to-[#F4B183]", // Warm temple colors
    hanbok: "from-[#9b87f5] to-[#D6BCFA]", // Traditional hanbok purple
    seasonal: "from-[#F2FCE2] to-[#FEF7CD]", // Spring to Summer
    garden: "from-[#95D1CC] to-[#E3F4F4]", // Garden fresh
    palace: "from-[#8B5CF6] to-[#D946EF]", // Royal colors
  };

  // Define theme descriptions
  const themeDescriptions = {
    temple: "Beginning your journey at the temple entrance",
    hanbok: "Learning through traditional Korean colors",
    seasonal: "Progress through Korea's beautiful seasons",
    garden: "Walking through a peaceful Korean garden",
    palace: "Reaching the majestic Gyeongbokgung Palace",
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-1000",
      `bg-gradient-to-b ${themeGradients[themeSection]}`
    )}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="mb-8">
            <HangulProgress 
              currentLesson={currentLessonIndex + 1} 
              totalLessons={lessons.length}
              theme={themeSection}
            />
            <p className="text-center mt-2 text-gray-600 italic">
              {themeDescriptions[themeSection]}
            </p>
          </div>
          
          <HangulLesson 
            lesson={lessons[currentLessonIndex]}
            onComplete={handleLessonComplete}
            onNext={currentLessonIndex < lessons.length - 1 ? handleNext : undefined}
            onPrevious={currentLessonIndex > 0 ? handlePrevious : undefined}
          />
        </div>
      </div>
    </div>
  );
}
