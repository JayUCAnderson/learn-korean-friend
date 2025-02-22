
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle } from "lucide-react";

interface Exercise {
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string;
}

interface PracticeExercisesProps {
  exercises: Exercise[];
}

export function PracticeExercises({ exercises }: PracticeExercisesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  
  const currentExercise = exercises[currentIndex];

  if (!exercises.length) {
    return <div className="text-center text-gray-500">No practice exercises available.</div>;
  }

  const handleSubmit = () => {
    setShowFeedback(true);
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(exercises.length - 1, prev + 1));
    setUserAnswer("");
    setShowFeedback(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-4 text-sm text-gray-500">
          Exercise {currentIndex + 1} of {exercises.length}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">{currentExercise.question}</h3>

          {currentExercise.type === "multiple-choice" && currentExercise.options ? (
            <div className="space-y-2">
              {currentExercise.options.map((option, index) => (
                <Button
                  key={index}
                  variant={userAnswer === option ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setUserAnswer(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          ) : (
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="w-full"
            />
          )}

          <div className="flex justify-between mt-6">
            {!showFeedback ? (
              <Button onClick={handleSubmit} className="w-full">
                Check Answer
              </Button>
            ) : (
              <div className="w-full space-y-4">
                <div className="flex items-center gap-2">
                  {userAnswer.toLowerCase() === currentExercise.correctAnswer.toLowerCase() ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-500">Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-500">
                        Incorrect. The correct answer is: {currentExercise.correctAnswer}
                      </span>
                    </>
                  )}
                </div>
                {currentIndex < exercises.length - 1 && (
                  <Button onClick={handleNext} className="w-full">
                    Next Exercise
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
