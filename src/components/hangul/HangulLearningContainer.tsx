
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
  const { lessons, currentLessonIndex, isLoading, handleNext, handlePrevious, currentSection } = useHangulLessons();
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

  const themeSection = currentSection === 'vowels' ? 'temple' :
                      currentSection === 'basic_consonants' ? 'hanbok' : 'palace';
  
  const themeGradients = {
    temple: "from-[#FFDEE2] to-[#FEF7CD]", // Vowels theme
    hanbok: "from-[#9b87f5] to-[#7E69AB]", // Basic consonants theme
    palace: "from-[#8B5CF6] to-[#D946EF]", // Advanced consonants theme
  };

  const sectionDescriptions = {
    vowels: "Master the building blocks of Hangul with vowels",
    basic_consonants: "Learn the essential consonants of the Korean alphabet",
    advanced_consonants: "Challenge yourself with complex consonant combinations",
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
              {sectionDescriptions[currentSection]}
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
