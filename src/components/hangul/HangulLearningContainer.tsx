
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
import { BookOpen, ArrowLeft } from "lucide-react";
import { HangulLandingPage } from "./HangulLandingPage";
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';

interface HangulLearningContainerProps {
  onComplete?: () => void;
}

export function HangulLearningContainer({ onComplete }: HangulLearningContainerProps) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const sectionParam = searchParams.get('section');
  const lessonParam = searchParams.get('lesson');
  const showLanding = location.pathname === '/hangul';

  const { 
    lessons, 
    currentLessonIndex, 
    isLoading, 
    handleNext, 
    handlePrevious, 
    currentSection,
    getLessonSection,
    setCurrentLessonIndex,
  } = useHangulLessons();

  const [showQuiz, setShowQuiz] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const { toast } = useToast();

  // Filter lessons by section if section param is present
  const filteredLessons = sectionParam 
    ? lessons.filter(lesson => getLessonSection(lesson) === sectionParam)
    : lessons;

  const handleLessonComplete = () => {
    const nextLesson = filteredLessons[currentLessonIndex + 1];
    if (nextLesson) {
      const currentSectionType = currentSection;
      const nextSectionType = getLessonSection(nextLesson);
      
      if (currentSectionType !== nextSectionType) {
        setShowQuiz(true);
      } else {
        handleNext();
      }
    } else {
      toast({
        title: "Congratulations! 축하해요!",
        description: "You've completed all lessons in this section!",
      });
      navigate('/hangul');
    }
  };

  const getCurrentSectionLessons = () => {
    return filteredLessons;
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
    temple: "from-[#FFF5F7] to-[#FCE7F3]",
    hanbok: "from-[#F3F4F6] to-[#E5E7EB]",
    palace: "from-[#F5F3FF] to-[#EDE9FE]",
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
              <Button
                variant="ghost"
                onClick={() => navigate('/hangul')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Overview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReview(true)}
                className="ml-4"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Review Section
              </Button>
            </div>
            <HangulProgress theme={themeSection} />
            <p className="text-center mt-4 text-gray-600 italic">
              {sectionDescriptions[currentSection]}
            </p>
          </div>
          
          {filteredLessons[currentLessonIndex] && (
            <HangulLesson 
              lesson={filteredLessons[currentLessonIndex]}
              onComplete={handleLessonComplete}
              onNext={currentLessonIndex < filteredLessons.length - 1 ? handleNext : undefined}
              onPrevious={currentLessonIndex > 0 ? handlePrevious : undefined}
            />
          )}
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
        onClose={() => {
          setShowReview(false);
          navigate('/hangul');
        }}
        sectionLessons={getCurrentSectionLessons()}
        sectionName={sectionName}
      />
    </div>
  );
}
