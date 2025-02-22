
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DailyProgress } from "./DailyProgress";

export const LearningProgress = () => {
  const [dailyProgress, setDailyProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchDailyProgress();
  }, []);

  const fetchDailyProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_progress')
        .select('progress_percentage')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setDailyProgress(data.progress_percentage);
      } else {
        const { error: insertError } = await supabase
          .from('daily_progress')
          .insert([
            {
              user_id: user.id,
              progress_percentage: 0,
              minutes_studied: 0
            }
          ]);

        if (insertError) throw insertError;
      }
    } catch (error: any) {
      console.error("Error fetching progress:", error);
      toast({
        title: "Error fetching progress",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return <DailyProgress progress={dailyProgress} />;
};
