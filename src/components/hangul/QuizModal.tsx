
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type HangulLessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPass: () => void;
  sectionLessons: HangulLessonType[];
  sectionName: string;
}

interface QuizQuestion {
  character: string;
  correctAnswer: string;
  options: string[];
}

export function QuizModal({ isOpen, onClose, onPass, sectionLessons, sectionName }: QuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const generateQuestions = (): QuizQuestion[] => {
    return sectionLessons.map(lesson => {
      const incorrect = sectionLessons
        .filter(l => l.id !== lesson.id)
        .map(l => l.romanization)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      return {
        character: lesson.character,
        correctAnswer: lesson.romanization,
        options: [...incorrect, lesson.romanization].sort(() => Math.random() - 0.5)
      };
    });
  };

  const questions = generateQuestions();

  const handleAnswer = (selectedAnswer: string) => {
    const isCorrect = selectedAnswer === questions[currentQuestionIndex].correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      const percentage = ((score + (isCorrect ? 1 : 0)) / questions.length) * 100;
      setShowResults(true);
      
      if (percentage >= 80) {
        toast({
          title: "Congratulations! 축하해요!",
          description: `You passed the ${sectionName} quiz with ${percentage}%!`,
        });
        onPass();
      } else {
        toast({
          title: "Keep practicing!",
          description: "You need 80% to advance. Review the lessons and try again!",
          variant: "destructive",
        });
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResults(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      if (!showResults) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {showResults ? "Quiz Results" : `${sectionName} Quiz - Question ${currentQuestionIndex + 1}/${questions.length}`}
          </DialogTitle>
        </DialogHeader>

        {!showResults ? (
          <div className="space-y-4">
            <div className="text-center text-4xl font-bold mb-4">
              {questions[currentQuestionIndex].character}
            </div>
            <div className="grid grid-cols-1 gap-3">
              {questions[currentQuestionIndex].options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleAnswer(option)}
                  className="w-full text-left"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-lg">
              You scored {score} out of {questions.length} ({((score / questions.length) * 100).toFixed(0)}%)
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={resetQuiz}>Try Again</Button>
              <Button onClick={onClose} variant="outline">Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
