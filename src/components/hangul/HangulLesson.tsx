
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type HangulLessonType = Database['public']['Tables']['hangul_lessons']['Row'];

interface HangulLessonProps {
  lesson: HangulLessonType;
  onComplete: () => void;
}

export function HangulLesson({ lesson, onComplete }: HangulLessonProps) {
  const [showExamples, setShowExamples] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleLessonComplete = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Record progress
      const { error } = await supabase.from('hangul_progress').upsert({
        user_id: user.id,
        hangul_id: lesson.id,
        total_practice_sessions: 1,
        recognition_accuracy: 100, // Initial values, will be updated with actual practice data
        recognition_speed_ms: 1000,
        sound_association_accuracy: 100,
        last_reviewed: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Progress Saved",
        description: "Keep up the great work! 잘 했어요! (jal haesseoyo!)",
      });
      
      onComplete();
    } catch (error: any) {
      console.error("Error saving progress:", error);
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">{lesson.character}</h2>
        <p className="text-lg text-gray-600 mb-4">
          Romanization: {lesson.romanization}
        </p>
        <p className="text-gray-700">{lesson.description}</p>
      </div>

      {lesson.mnemonic_image && (
        <div className="flex justify-center">
          <img
            src={lesson.mnemonic_image}
            alt={`Mnemonic for ${lesson.character}`}
            className="max-w-sm rounded-lg shadow-lg"
          />
        </div>
      )}

      <div className="space-y-4">
        <Button
          className="w-full"
          variant="outline"
          onClick={() => setShowExamples(!showExamples)}
        >
          {showExamples ? "Hide" : "Show"} Examples
        </Button>

        {showExamples && (
          <div className="p-4 bg-gray-50 rounded-lg">
            {Object.entries(lesson.examples as Record<string, string>).map(([korean, english]) => (
              <div key={korean} className="mb-2">
                <p className="font-semibold">{korean}</p>
                <p className="text-gray-600">{english}</p>
              </div>
            ))}
          </div>
        )}

        <Button
          className="w-full"
          onClick={handleLessonComplete}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving Progress..." : "Complete & Continue"}
        </Button>
      </div>
    </Card>
  );
}
