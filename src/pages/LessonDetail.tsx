
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Volume2, ArrowLeft, Play, Pause } from "lucide-react";

interface AudioContent {
  url?: string;
  last_generated?: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: any;
  status: 'not_started' | 'in_progress' | 'completed';
  vocabulary?: any[];
  audio_content?: AudioContent | null;
}

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
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

      console.log('Fetched lesson data:', lessonData);

      if (!lessonData) {
        throw new Error('Lesson not found');
      }

      const parsedAudioContent = lessonData.audio_content 
        ? (typeof lessonData.audio_content === 'string' 
            ? JSON.parse(lessonData.audio_content) 
            : lessonData.audio_content) as AudioContent
        : null;

      const typedLesson: Lesson = {
        id: lessonData.id,
        title: lessonData.title,
        description: lessonData.description,
        content: lessonData.content,
        status: lessonData.status,
        vocabulary: lessonData.vocabulary,
        audio_content: parsedAudioContent
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

  const handlePlayAudio = async () => {
    try {
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        if (isPlaying) {
          audio.pause();
        } else {
          await audio.play();
        }
        setIsPlaying(!isPlaying);
        return;
      }

      toast({
        title: "Generating audio...",
        description: "Please wait while we prepare the lesson audio.",
      });

      const { data, error } = await supabase.functions.invoke('text-to-voice', {
        body: {
          text: `${lesson?.title}. ${lesson?.description}`,
          voice: "alloy"
        }
      });

      if (error) throw error;

      const blob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mp3' }
      );
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      const { error: updateError } = await supabase
        .from('lessons')
        .update({
          audio_content: {
            url: url,
            last_generated: new Date().toISOString()
          }
        })
        .eq('id', id);

      if (updateError) throw updateError;

      const audio = new Audio(url);
      await audio.play();
      setIsPlaying(true);

      audio.onended = () => {
        setIsPlaying(false);
      };

    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate or play audio. Please try again.",
      });
      setIsPlaying(false);
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
          <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-korean-50 to-korean-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
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
            <Button
              size="lg"
              onClick={handlePlayAudio}
              className="flex items-center space-x-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-5 w-5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-5 w-5" />
                  <span>Listen</span>
                </>
              )}
            </Button>
          </div>

          {lesson.vocabulary && lesson.vocabulary.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Practice Vocabulary</h2>
              <Card className="p-6 bg-white/50 backdrop-blur">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={handlePrevVocab}
                    disabled={currentVocabIndex === 0}
                  >
                    Previous
                  </Button>
                  <div className="text-center flex-1">
                    <p className="text-2xl font-bold mb-2">{lesson.vocabulary[currentVocabIndex].korean}</p>
                    <p className="text-lg text-gray-600">{lesson.vocabulary[currentVocabIndex].english}</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleNextVocab}
                    disabled={currentVocabIndex === lesson.vocabulary.length - 1}
                  >
                    Next
                  </Button>
                </div>
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* TODO: Implement vocabulary audio */}}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Lesson Content</h2>
            <Card className="p-6 bg-white/50 backdrop-blur">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap bg-transparent">
                  {JSON.stringify(lesson.content, null, 2)}
                </pre>
              </div>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  );
}
