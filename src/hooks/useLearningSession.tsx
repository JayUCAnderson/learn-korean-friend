
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { parseMarkdownContent } from '@/utils/contentParser';
import { updateVocabularyProgress } from '@/utils/vocabularyProgress';
import type { 
  ContentType, 
  KoreanLevel, 
  LearningContent, 
  VocabularyItem,
  ParsedContent 
} from '@/types/learning';

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
        
        // Parse the nested content structure
        let parsedContent: ParsedContent;
        if (typeof existingContent.content === 'object' && existingContent.content !== null) {
          parsedContent = typeof existingContent.content.content === 'string'
            ? parseMarkdownContent(existingContent.content.content)
            : { vocabulary: [] };
        } else {
          parsedContent = { vocabulary: [] };
        }

        // Increment usage count
        await supabase
          .from('learning_content')
          .update({ usage_count: (existingContent.usage_count || 0) + 1 })
          .eq('id', existingContent.id);
          
        return {
          title: existingContent.content.title,
          description: existingContent.content.description,
          content: existingContent.content.content,
          difficulty_level: existingContent.content.difficulty_level,
          target_skills: existingContent.content.target_skills,
          key_points: existingContent.content.key_points,
          vocabulary: parsedContent.vocabulary || []
        };
      }

      // Generate new content via edge function
      const response = await supabase.functions.invoke('generate-learning-content', {
        body: { interest, level, contentType }
      });

      if (response.error) throw new Error('Failed to generate content');
      
      const generatedContent = response.data as LearningContent;
      console.log("Generated new content:", generatedContent);
      
      // Store the generated content
      const { error } = await supabase
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
        });

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

      // Get the content to ensure we have the vocabulary
      const { data: content } = await supabase
        .from('learning_content')
        .select('content')
        .eq('id', contentId)
        .single();

      // Parse the content to get vocabulary if needed
      let vocabularyItems: VocabularyItem[] = [];
      if (content?.content) {
        const parsedContent = typeof content.content === 'object' && content.content !== null && 'content' in content.content
          ? parseMarkdownContent(content.content.content as string)
          : { vocabulary: [] };
        vocabularyItems = parsedContent.vocabulary || [];
      }

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
    startSession,
    recordSession,
    isLoading,
  };
};
