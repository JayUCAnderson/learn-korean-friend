
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useLearningSession = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const startSession = async (interest: string, level: string, contentType: string) => {
    setIsLoading(true);
    try {
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
        // Increment usage count
        await supabase
          .from('learning_content')
          .update({ usage_count: existingContent.usage_count + 1 })
          .eq('id', existingContent.id);
          
        return existingContent;
      }

      // Generate new content
      const response = await fetch('/functions/v1/generate-learning-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ interest, level, contentType }),
      });

      if (!response.ok) throw new Error('Failed to generate content');
      
      const { content } = await response.json();
      
      // Store the generated content
      const { data: newContent, error } = await supabase
        .from('learning_content')
        .insert({
          content_type: contentType,
          topic: interest,
          interest_category: [interest],
          level,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      
      return newContent;
    } catch (error: any) {
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

  const recordSession = async (contentId: string, sessionType: string, performance?: number, feedback?: string) => {
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
