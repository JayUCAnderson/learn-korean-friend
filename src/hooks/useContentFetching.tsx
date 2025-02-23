
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { parseMarkdownContent } from '@/utils/contentParser';
import type { ContentType, KoreanLevel, LearningContent } from '@/types/learning';
import type { Database } from '@/integrations/supabase/types';

export const useContentFetching = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchContent = async (interest: string, level: KoreanLevel, contentType: ContentType) => {
    setIsLoading(true);
    try {
      console.log("Fetching content with:", { interest, level, contentType });
      
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
        
        // Parse the content structure
        const contentObj = existingContent.content as { 
          title: string;
          description: string;
          content: string;
          difficulty_level: number;
          target_skills: string[];
          key_points: string[];
        };

        if (!contentObj.title) {
          console.error("Missing title in existing content:", contentObj);
          throw new Error("Content is missing required title");
        }
        
        let parsedContent = typeof contentObj.content === 'string'
          ? parseMarkdownContent(contentObj.content)
          : { vocabulary: [] };

        console.log("Parsed content:", parsedContent);

        // Increment usage count
        await supabase
          .from('learning_content')
          .update({ usage_count: (existingContent.usage_count || 0) + 1 })
          .eq('id', existingContent.id);
          
        return {
          title: contentObj.title,
          description: contentObj.description,
          content: contentObj.content,
          difficulty_level: contentObj.difficulty_level,
          target_skills: contentObj.target_skills,
          key_points: contentObj.key_points,
          vocabulary: parsedContent.vocabulary || []
        };
      }

      console.log("No existing content found, generating new content...");
      
      // Generate new content via edge function
      const response = await supabase.functions.invoke('generate-learning-content', {
        body: { interest, level, contentType }
      });

      console.log("Edge function response:", response);

      if (response.error) {
        console.error("Edge function error:", response.error);
        throw new Error('Failed to generate content');
      }
      
      const generatedContent = response.data as LearningContent;
      console.log("Generated new content:", generatedContent);

      if (!generatedContent.title) {
        console.error("Missing title in generated content:", generatedContent);
        throw new Error("Generated content is missing required title");
      }

      // Store the generated content
      const { error } = await supabase
        .from('learning_content')
        .insert({
          content: generatedContent as unknown as Database['public']['Tables']['learning_content']['Insert']['content'],
          content_type: contentType,
          topic: interest,
          interest_category: [interest],
          level,
          usage_count: 1
        });

      if (error) {
        console.error("Error storing generated content:", error);
        throw error;
      }
      
      return generatedContent;
    } catch (error: any) {
      console.error("Error in fetchContent:", error);
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

  return {
    fetchContent,
    isLoading,
  };
};

