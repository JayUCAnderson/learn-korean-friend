
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { updateVocabularyProgress } from '@/utils/vocabularyProgress';
import { parseMarkdownContent } from '@/utils/contentParser';
import type { ContentType } from '@/types/learning';

export const useSessionRecording = () => {
  const { toast } = useToast();

  const recordSession = async (contentId: string, sessionType: ContentType, performance?: number, feedback?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get the content to ensure we have the vocabulary
      const { data: content } = await supabase
        .from('learning_content')
        .select('content')
        .eq('id', contentId)
        .single();

      // Parse the content to get vocabulary
      const contentObj = content?.content as { content: string } | undefined;
      const vocabularyItems = contentObj
        ? parseMarkdownContent(contentObj.content).vocabulary || []
        : [];

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
      if (performance && vocabularyItems.length > 0) {
        await updateVocabularyProgress(user.id, vocabularyItems, performance);
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
    recordSession,
  };
};
