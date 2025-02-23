
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MasteryChecks } from "./MasteryChecks";

interface LessonProgressProps {
  lessonId: string;
  onComplete: () => void;
}

export function LessonProgress({ lessonId, onComplete }: LessonProgressProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMasteryCheck, setShowMasteryCheck] = useState(false);
  const [masteryChecks, setMasteryChecks] = useState({
    recognition: false,
    pronunciation: false,
    writing: false
  });
  const { toast } = useToast();

  const handleMasteryCheck = (type: keyof typeof masteryChecks) => {
    setMasteryChecks(prev => ({
      ...prev,
      [type]: true
    }));
  };

  const handleLessonComplete = async () => {
    if (!showMasteryCheck) {
      setShowMasteryCheck(true);
      return;
    }

    if (!Object.values(masteryChecks).every(Boolean)) {
      toast({
        title: "Complete all checks",
        description: "Please complete all mastery checks before continuing.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from('hangul_progress').upsert({
        user_id: user.id,
        character_id: lessonId,
        total_practice_sessions: 1,
        recognition_accuracy: 100,
        sound_association_accuracy: 100,
        last_reviewed: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Progress Saved",
        description: "Keep up the great work! 잘 했어요! (jal haesseoyo!)",
      });
      
      // Reset state before moving to next lesson
      setShowMasteryCheck(false);
      setMasteryChecks({
        recognition: false,
        pronunciation: false,
        writing: false
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
    <div className="space-y-4">
      {showMasteryCheck && (
        <MasteryChecks
          checks={masteryChecks}
          onCheck={handleMasteryCheck}
        />
      )}

      <Button
        className="w-full"
        onClick={handleLessonComplete}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving Progress..." : showMasteryCheck ? "Complete & Continue" : "Check Understanding"}
      </Button>
    </div>
  );
}
