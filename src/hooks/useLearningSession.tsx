
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from '@/integrations/supabase/types';

type ContentType = Database['public']['Enums']['content_type'];
type KoreanLevel = Database['public']['Enums']['korean_level'];

export const useLearningSession = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const startSession = async (interest: string, level: KoreanLevel, contentType: ContentType) => {
    setIsLoading(true);
    try {
      console.log("Starting session with:", { interest, level, contentType });
      
      // Check for existing content first
      const { data: existingContent } = await supabase
        .from('learning_content')
        .select('*')
        .contains('interest_category', [interest])
        .eq('level', level)
        .eq('content_type', contentType)
        .limit(1)
        .maybeSingle();

      if (existingContent) {
        console.log("Found existing content:", existingContent);
        // Increment usage count
        await supabase
          .from('learning_content')
          .update({ usage_count: existingContent.usage_count + 1 })
          .eq('id', existingContent.id);
          
        return {
          ...existingContent.content,
          title: existingContent.content.title,
          description: existingContent.content.description
        };
      }

      // Generate new content via edge function
      const response = await supabase.functions.invoke('generate-learning-content', {
        body: { interest, level, contentType }
      });

      if (response.error) throw new Error('Failed to generate content');
      
      const generatedContent = response.data;
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
          usage_count: 1
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

      await supabase
        .from('learning_sessions')
        .insert({
          user_id: user.id,
          content_id: contentId,
          session_type: sessionType,
          completed_at: new Date().toISOString(),
          performance_score: performance,
          feedback,
        });
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
