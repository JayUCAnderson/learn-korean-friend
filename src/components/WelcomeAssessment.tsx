
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const WelcomeAssessment = ({ onComplete }: { onComplete: (data: any) => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    level: "",
    goals: "",
    interests: "",
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete(formData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 backdrop-blur-lg bg-white/80 border border-gray-200">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-korean-600">Step {step} of 3</p>
            <h1 className="text-2xl font-bold text-gray-900">
              {step === 1
                ? "Welcome to KoreanPal"
                : step === 2
                ? "Your Learning Goals"
                : "Your Interests"}
            </h1>
            <p className="text-gray-500">
              {step === 1
                ? "Let's start by understanding your current Korean level"
                : step === 2
                ? "What would you like to achieve?"
                : "What topics interest you the most?"}
            </p>
          </div>

          <div className="space-y-4">
            {step === 1 && (
              <Select
                value={formData.level}
                onValueChange={(value) =>
                  setFormData({ ...formData, level: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Complete Beginner</SelectItem>
                  <SelectItem value="elementary">Elementary (TOPIK I)</SelectItem>
                  <SelectItem value="intermediate">
                    Intermediate (TOPIK II)
                  </SelectItem>
                  <SelectItem value="advanced">Advanced (TOPIK II)</SelectItem>
                </SelectContent>
              </Select>
            )}

            {step === 2 && (
              <Select
                value={formData.goals}
                onValueChange={(value) =>
                  setFormData({ ...formData, goals: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual Conversation</SelectItem>
                  <SelectItem value="business">Business Korean</SelectItem>
                  <SelectItem value="academic">Academic Korean</SelectItem>
                  <SelectItem value="culture">Cultural Understanding</SelectItem>
                </SelectContent>
              </Select>
            )}

            {step === 3 && (
              <Select
                value={formData.interests}
                onValueChange={(value) =>
                  setFormData({ ...formData, interests: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your interests" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kpop">K-pop & Music</SelectItem>
                  <SelectItem value="kdrama">K-dramas & Movies</SelectItem>
                  <SelectItem value="food">Korean Cuisine</SelectItem>
                  <SelectItem value="tech">Technology</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <Button
            className="w-full bg-korean-600 hover:bg-korean-700 transition-colors"
            onClick={handleNext}
          >
            {step === 3 ? "Start Learning" : "Next"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default WelcomeAssessment;
