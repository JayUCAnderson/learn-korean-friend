
import { useToast } from "@/components/ui/use-toast";
import { HangulLesson } from "./HangulLesson";
import { HangulProgress } from "./HangulProgress";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";
import { useHangulLessons } from "@/hooks/useHangulLessons";
import { useHangulImagePreloader } from "@/hooks/useHangulImagePreloader";

interface HangulLearningContainerProps {
  onComplete?: () => void;
}

export function HangulLearningContainer({ onComplete }: HangulLearningContainerProps) {
  const { lessons, currentLessonIndex, isLoading, handleNext, handlePrevious } = useHangulLessons();
  const { isPreloading } = useHangulImagePreloader(lessons);
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
    // Notify parent component to check progress
    onComplete?.();
  };

  if (isLoading || isPreloading) {
    return <LoadingSpinner />;
  }

  if (!lessons.length) {
    return <EmptyState />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-8">
        <HangulProgress 
          currentLesson={currentLessonIndex + 1} 
          totalLessons={lessons.length} 
        />
      </div>
      
      <HangulLesson 
        lesson={lessons[currentLessonIndex]}
        onComplete={handleLessonComplete}
        onNext={currentLessonIndex < lessons.length - 1 ? handleNext : undefined}
        onPrevious={currentLessonIndex > 0 ? handlePrevious : undefined}
      />
    </div>
  );
}

