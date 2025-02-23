import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { AudioPlayer } from '@/components/lesson/AudioPlayer';
import { VocabularyCard } from '@/components/lesson/VocabularyCard';
import { LessonContent } from '@/components/lesson/LessonContent';

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

interface LessonContent {
  content?: {
    content?: string;
  };
}

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentVocabIndex, setCurrentVocabIndex] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

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

      // Parse mnemonic_images and ensure it's correctly typed
      let parsedMnemonicImages: Record<string, string> | null = null;
      if (lessonData.mnemonic_images) {
        // If it's a string, parse it
        if (typeof lessonData.mnemonic_images === 'string') {
          parsedMnemonicImages = JSON.parse(lessonData.mnemonic_images);
        }
        // If it's already an object, use it directly
        else if (typeof lessonData.mnemonic_images === 'object') {
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
          <Button onClick={() => navigate('/lessons')}>Return to Lessons</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-korean-50 to-korean-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/lessons')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Lessons
        </Button>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder.svg" alt="Teacher" />
                <AvatarFallback>선생님</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{lesson.title}</h1>
                <p className="text-gray-600">{lesson.description}</p>
              </div>
            </div>
            <AudioPlayer
              lessonId={lesson.id}
              title={lesson.title}
              description={lesson.description}
              audioUrl={audioUrl}
              onAudioUrlUpdate={setAudioUrl}
            />
          </div>

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
