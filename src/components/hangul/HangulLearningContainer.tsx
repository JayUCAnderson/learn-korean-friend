
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
  const { 
    lessons, 
    currentLessonIndex, 
    isLoading, 
    handleNext, 
    handlePrevious, 
    currentSection,
    getLessonSection
  } = useHangulLessons();
  const { toast } = useToast();

  const handleLessonComplete = () => {
    const nextLesson = lessons[currentLessonIndex + 1];
    if (nextLesson) {
      const currentSectionType = currentSection;
      const nextSectionType = getLessonSection(currentLessonIndex + 1);
      
      if (currentSectionType !== nextSectionType) {
        toast({
          title: `${currentSectionType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Completed! 🎉`,
          description: `You've completed the ${currentSectionType.replace('_', ' ')} section. Moving on to ${nextSectionType.replace('_', ' ')}.`,
        });
      }
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
    temple: "from-[#FFF5F7] to-[#FCE7F3]", // Vowels theme - soft pink
    hanbok: "from-[#F3F4F6] to-[#E5E7EB]", // Basic consonants theme - gentle gray
    palace: "from-[#F5F3FF] to-[#EDE9FE]", // Advanced consonants theme - soft purple
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
