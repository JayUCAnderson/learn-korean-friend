
import { useState, useEffect, useMemo } from "react";
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
import { useNavigate, useLocation } from 'react-router-dom';
import type { LessonSection } from "@/hooks/useHangulLessons";

interface HangulLearningContainerProps {
  onComplete?: () => void;
  section?: LessonSection;
}

export function HangulLearningContainer({ onComplete, section: propSection }: HangulLearningContainerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Memoize the section determination to prevent recalculation on every render
  const routeSection = useMemo((): LessonSection | undefined => {
    if (location.pathname === '/hangul/vowels') return 'vowels';
    if (location.pathname === '/hangul/basic-consonants') return 'basic_consonants';
    if (location.pathname === '/hangul/advanced-consonants') return 'advanced_consonants';
    return undefined;
  }, [location.pathname]);

  const section = propSection || routeSection;
  const showLanding = !section;

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

  // Memoize filtered lessons to prevent unnecessary recalculations
  const filteredLessons = useMemo(() => 
    section ? lessons.filter(lesson => getLessonSection(lesson) === section) : lessons,
    [section, lessons, getLessonSection]
  );

  // Update lesson index when section changes
  useEffect(() => {
    if (filteredLessons.length > 0 && currentLessonIndex >= filteredLessons.length) {
      setCurrentLessonIndex(0);
    }
  }, [section, filteredLessons.length]);

  const handleLessonComplete = () => {
    const nextLesson = filteredLessons[currentLessonIndex + 1];
    if (nextLesson) {
      handleNext();
    } else {
      toast({
        title: "Congratulations! 축하해요!",
        description: "You've completed all lessons in this section!",
      });
      navigate('/hangul');
    }
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
        sectionLessons={filteredLessons}
        sectionName={sectionName}
      />

      <ReviewModal
        isOpen={showReview}
        onClose={() => setShowReview(false)} // Removed the navigation to /hangul
        sectionLessons={filteredLessons}
        sectionName={sectionName}
      />
    </div>
  );
}

