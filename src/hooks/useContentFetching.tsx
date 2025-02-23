
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
      console.log("Generating new content with:", { interest, level, contentType });
      
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

