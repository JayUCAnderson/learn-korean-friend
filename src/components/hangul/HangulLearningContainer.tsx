import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { HangulLesson } from "./HangulLesson";
import { HangulProgress } from "./HangulProgress";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";
import { useHangulLessons } from "@/hooks/useHangulLessons";
import { cn } from "@/lib/utils";
import { QuizModal } from "./QuizModal";
import { ReviewModal } from "./ReviewModal";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { HangulLandingPage } from "./HangulLandingPage";
import { useSearchParams } from 'react-router-dom';

interface HangulLearningContainerProps {
  onComplete?: () => void;
}

export function HangulLearningContainer({ onComplete }: HangulLearningContainerProps) {
  const [searchParams] = useSearchParams();
  const lessonParam = searchParams.get('lesson');
  const showLanding = !lessonParam;

  const { 
    lessons, 
    currentLessonIndex, 
    isLoading, 
    handleNext, 
    handlePrevious, 
    currentSection,
    getLessonSection,
    setCurrentLessonIndex
  } = useHangulLessons();

  const [showQuiz, setShowQuiz] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const { toast } = useToast();

  useState(() => {
    if (lessonParam) {
      const index = parseInt(lessonParam);
      if (!isNaN(index) && index >= 0 && index < lessons.length) {
        setCurrentLessonIndex(index);
      }
    }
  });

  const handleLessonComplete = () => {
    const nextLesson = lessons[currentLessonIndex + 1];
    if (nextLesson) {
      const currentSectionType = currentSection;
      const nextSectionType = getLessonSection(currentLessonIndex + 1);
      
      if (currentSectionType !== nextSectionType) {
        setShowQuiz(true);
      } else {
        handleNext();
      }
    } else {
      toast({
        title: "Congratulations! 축하해요!",
        description: "You've completed all Hangul lessons! Now you can move on to other content.",
      });
      onComplete?.();
    }
  };

  const getCurrentSectionLessons = () => {
    const sectionSize = Math.ceil(lessons.length / 3);
    const startIndex = currentSection === 'vowels' ? 0 :
                      currentSection === 'basic_consonants' ? sectionSize :
                      sectionSize * 2;
    const endIndex = currentSection === 'vowels' ? sectionSize :
                    currentSection === 'basic_consonants' ? sectionSize * 2 :
                    lessons.length;
    
    return lessons.slice(startIndex, endIndex);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!lessons.length) {
    return <EmptyState />;
  }

  if (showLanding) {
    return <HangulLandingPage />;
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

  const sectionName = currentSection.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className={cn(
      "min-h-screen transition-all duration-1000",
      `bg-gradient-to-b ${themeGradients[themeSection]}`
    )}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <HangulProgress theme={themeSection} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReview(true)}
                className="ml-4"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Review Section
              </Button>
            </div>
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

      <QuizModal 
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
        onPass={() => {
          setShowQuiz(false);
          handleNext();
        }}
        sectionLessons={getCurrentSectionLessons()}
        sectionName={sectionName}
      />

      <ReviewModal
        isOpen={showReview}
        onClose={() => setShowReview(false)}
        sectionLessons={getCurrentSectionLessons()}
        sectionName={sectionName}
      />
    </div>
  );
}
