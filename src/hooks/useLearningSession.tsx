
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from '@/integrations/supabase/types';

type ContentType = Database['public']['Enums']['content_type'];
type KoreanLevel = Database['public']['Enums']['korean_level'];
type LearningContent = {
  title: string;
  description: string;
  content: any;
  difficulty_level: number;
  target_skills: string[];
  key_points: string[];
};

export const useLearningSession = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const startSession = async (interest: string, level: KoreanLevel, contentType: ContentType) => {
    setIsLoading(true);
    try {
      console.log("Starting session with:", { interest, level, contentType });
      
      const { data: existingContent } = await supabase
        .from('learning_content')
        .select('*')
        .contains('interest_category', [interest])
        .eq('level', level)
        .eq('content_type', contentType)
        .order('usage_count', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (existingContent) {
        console.log("Found existing content:", existingContent);
        // Increment usage count
        await supabase
          .from('learning_content')
          .update({ usage_count: existingContent.usage_count + 1 })
          .eq('id', existingContent.id);
          
        return existingContent.content as LearningContent;
      }

      // Generate new content via edge function
      const response = await supabase.functions.invoke('generate-learning-content', {
        body: { interest, level, contentType }
      });

      if (response.error) throw new Error('Failed to generate content');
      
      const generatedContent = response.data as LearningContent;
      console.log("Generated new content:", generatedContent);
      
      // Store the generated content
      const { data: newContent, error } = await supabase
        .from('learning_content')
        .insert({
          content_type: contentType,
          topic: interest,
          interest_category: [interest],
          level,
          content: generatedContent,
          usage_count: 1,
          difficulty_level: generatedContent.difficulty_level,
          target_skills: generatedContent.target_skills,
          key_points: generatedContent.key_points
        })
        .select()
        .single();

      if (error) throw error;
      
      return generatedContent;
    } catch (error: any) {
      console.error("Error in startSession:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const recordSession = async (contentId: string, sessionType: ContentType, performance?: number, feedback?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Record the learning session
      const { error: sessionError } = await supabase
        .from('learning_sessions')
        .insert({
          user_id: user.id,
          content_id: contentId,
          session_type: sessionType,
          completed_at: new Date().toISOString(),
          performance_score: performance,
          feedback
        });

      if (sessionError) throw sessionError;

      // Update vocabulary progress if available
      if (performance) {
        const { data: content } = await supabase
          .from('learning_content')
          .select('content')
          .eq('id', contentId)
          .single();

        if (content?.content?.vocabulary) {
          for (const vocab of content.content.vocabulary) {
            const { error: vocabError } = await supabase
              .from('vocabulary_progress')
              .upsert({
                user_id: user.id,
                vocabulary_item: vocab.korean,
                times_encountered: 1,
                times_correct: performance >= 0.7 ? 1 : 0,
                last_reviewed: new Date().toISOString()
              }, {
                onConflict: 'user_id,vocabulary_item'
              });

            if (vocabError) console.error("Error updating vocabulary progress:", vocabError);
          }
        }
      }
    } catch (error: any) {
      console.error("Error in recordSession:", error);
      toast({
        title: "Error recording session",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    startSession,
    recordSession,
    isLoading,
  };
};
