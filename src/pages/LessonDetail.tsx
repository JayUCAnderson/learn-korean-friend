
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Play, Pause, Volume2, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: any;
  status: 'not_started' | 'in_progress' | 'completed';
  vocabulary?: any[];
  audio_content?: {
    url?: string;
    last_generated?: string;
  } | null;
}

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLesson();
  }, [id]);

  const fetchLesson = async () => {
    try {
      const { data: lesson, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setLesson(lesson);
      
      // If we have cached audio content, set it up
      if (lesson.audio_content?.url) {
        setAudioUrl(lesson.audio_content.url);
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
      // If we already have the audio URL, toggle play/pause
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

      // Show loading state
      toast({
        title: "Generating audio...",
        description: "Please wait while we prepare the lesson audio.",
      });

      // Get audio content from Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('text-to-voice', {
        body: {
          text: `${lesson?.title}. ${lesson?.description}`,
          voice: "alloy"
        }
      });

      if (error) throw error;

      // Create a blob URL from the base64 audio content
      const blob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mp3' }
      );
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      // Store the audio URL in the database
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

      // Play the audio
      const audio = new Audio(url);
      await audio.play();
      setIsPlaying(true);

      // Cleanup when audio ends
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

        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
              <p className="text-gray-600">{lesson.description}</p>
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
            <div>
              <h2 className="text-lg font-semibold mb-3">Vocabulary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lesson.vocabulary.map((vocab: any, index: number) => (
                  <Card key={index} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{vocab.korean}</p>
                      <p className="text-sm text-gray-600">{vocab.english}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {/* TODO: Implement vocabulary audio */}}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Lesson Content</h2>
            {/* Render lesson content based on the content structure */}
            <div className="prose max-w-none">
              {/* This is a placeholder. Implement actual lesson content rendering based on your content structure */}
              <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {JSON.stringify(lesson.content, null, 2)}
              </pre>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
