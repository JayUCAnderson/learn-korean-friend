
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
  const { toast } = useToast();

  const handleLessonComplete = async (isKnown: boolean) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from('hangul_progress').upsert({
        user_id: user.id,
        character_id: lessonId,
        total_practice_sessions: 1,
        recognition_accuracy: isKnown ? 100 : 50,
        sound_association_accuracy: isKnown ? 100 : 50,
        last_reviewed: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: isKnown ? "Character Marked as Known" : "Keep Practicing!",
        description: isKnown 
          ? "Great job! Keep up the momentum!"
          : "Don't worry, you'll master it with practice!",
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
      setShowMasteryCheck(false);
    }
  };

  return (
    <div className="space-y-4">
      {showMasteryCheck ? (
        <MasteryChecks
          onComplete={handleLessonComplete}
        />
      ) : (
        <Button
          className="w-full"
          onClick={() => setShowMasteryCheck(true)}
          disabled={isSubmitting}
        >
          Check Understanding
        </Button>
      )}
    </div>
  );
}
