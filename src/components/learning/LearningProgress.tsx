
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DailyProgress } from "./DailyProgress";
import type { ThemeColors } from "./ThemeProvider";
import { Card } from "@/components/ui/card";
import { BookOpen, Star, Trophy } from "lucide-react";

interface LearningProgressProps {
  themeColors: Pick<ThemeColors, 'border' | 'accent'>;
}

interface VocabularyStats {
  total_vocabulary: number;
  mastered_vocabulary: number;
  average_mastery: number;
}

export const LearningProgress = ({ themeColors }: LearningProgressProps) => {
  const [dailyProgress, setDailyProgress] = useState(0);
  const [vocabStats, setVocabStats] = useState<VocabularyStats | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDailyProgress();
    fetchVocabularyStats();
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

  const fetchVocabularyStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .rpc('get_user_vocabulary_stats', { user_id_param: user.id });

      if (error) throw error;
      setVocabStats(data[0]);
    } catch (error: any) {
      console.error("Error fetching vocabulary stats:", error);
      toast({
        title: "Error fetching vocabulary stats",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <DailyProgress progress={dailyProgress} themeColors={themeColors} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`p-4 ${themeColors.border} backdrop-blur-sm bg-white/50`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${themeColors.accent} bg-opacity-10`}>
              <BookOpen className="h-6 w-6 text-korean-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Vocabulary</p>
              <p className="text-2xl font-semibold">{vocabStats?.total_vocabulary || 0}</p>
            </div>
          </div>
        </Card>

        <Card className={`p-4 ${themeColors.border} backdrop-blur-sm bg-white/50`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${themeColors.accent} bg-opacity-10`}>
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Mastered Words</p>
              <p className="text-2xl font-semibold">{vocabStats?.mastered_vocabulary || 0}</p>
            </div>
          </div>
        </Card>

        <Card className={`p-4 ${themeColors.border} backdrop-blur-sm bg-white/50`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${themeColors.accent} bg-opacity-10`}>
              <Trophy className="h-6 w-6 text-korean-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Mastery</p>
              <p className="text-2xl font-semibold">
                {vocabStats ? Math.round(vocabStats.average_mastery * 10) / 10 : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

