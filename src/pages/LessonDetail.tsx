
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { VocabularyCard } from '@/components/lesson/VocabularyCard';
import { LessonContent } from '@/components/lesson/LessonContent';
import { LessonHeader } from '@/components/lesson/LessonHeader';

interface AudioContent {
  url?: string;
  last_generated?: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string;
  status: 'not_started' | 'in_progress' | 'completed';
  vocabulary?: any[];
  audio_content?: AudioContent | null;
  mnemonic_images?: Record<string, string> | null;
}

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentVocabIndex, setCurrentVocabIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchLesson();
    }
  }, [id]);

  const fetchLesson = async () => {
    try {
      const { data: lessonData, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!lessonData) {
        throw new Error('Lesson not found');
      }

      const parsedAudioContent = lessonData.audio_content 
        ? (typeof lessonData.audio_content === 'string' 
            ? JSON.parse(lessonData.audio_content) 
            : lessonData.audio_content) as AudioContent
        : null;

      let contentStr = JSON.stringify(lessonData.content);

      let parsedMnemonicImages: Record<string, string> | null = null;
      if (lessonData.mnemonic_images) {
        if (typeof lessonData.mnemonic_images === 'string') {
          parsedMnemonicImages = JSON.parse(lessonData.mnemonic_images);
        } else if (typeof lessonData.mnemonic_images === 'object') {
          parsedMnemonicImages = lessonData.mnemonic_images as Record<string, string>;
        }
      }

      const typedLesson: Lesson = {
        id: lessonData.id,
        title: lessonData.title,
        description: lessonData.description,
        content: contentStr,
        status: lessonData.status || 'not_started',
        vocabulary: lessonData.vocabulary,
        audio_content: parsedAudioContent,
        mnemonic_images: parsedMnemonicImages
      };

      setLesson(typedLesson);
      
      if (parsedAudioContent?.url) {
        setAudioUrl(parsedAudioContent.url);
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load lesson details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextVocab = () => {
    if (lesson?.vocabulary && currentVocabIndex < lesson.vocabulary.length - 1) {
      setCurrentVocabIndex(prev => prev + 1);
    }
  };

  const handlePrevVocab = () => {
    if (currentVocabIndex > 0) {
      setCurrentVocabIndex(prev => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-korean-600"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Lesson not found</h2>
          <Link to="/lessons">
            <Button>Return to Lessons</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-korean-50 to-korean-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/lessons" className="inline-block">
          <Button 
            variant="ghost" 
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lessons
          </Button>
        </Link>

        <Card className="p-6">
          <LessonHeader 
            title={lesson.title}
            description={lesson.description}
            lessonId={lesson.id}
            audioUrl={audioUrl}
            onAudioUrlUpdate={setAudioUrl}
          />

          {lesson.vocabulary && lesson.vocabulary.length > 0 && (
            <VocabularyCard
              vocabulary={lesson.vocabulary}
              currentIndex={currentVocabIndex}
              onNext={handleNextVocab}
              onPrev={handlePrevVocab}
              mnemonicImage={lesson.mnemonic_images?.[lesson.vocabulary[currentVocabIndex]?.korean]}
            />
          )}

          <LessonContent 
            content={lesson.content} 
            mnemonicImages={lesson.mnemonic_images}
          />
        </Card>
      </div>
    </div>
  );
}
