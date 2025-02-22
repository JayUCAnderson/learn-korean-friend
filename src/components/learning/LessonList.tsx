import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, BookOpen, Star } from "lucide-react";
import { LessonCard } from "./LessonCard";

interface Lesson {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface LessonListProps {
  lessons: Lesson[];
  isLoadingLessons: boolean;
  themeColors: {
    border: string;
    button: string;
  };
  onGenerateLesson: () => void;
  isGenerating: boolean;
  onLessonClick: (lessonId: string) => void;
}

const loadingMessages = [
  "Creating your personalized lesson...",
  "Analyzing your interests...",
  "Crafting engaging content...",
  "Preparing interactive exercises...",
];

export const LessonList = ({ 
  lessons, 
  isLoadingLessons, 
  themeColors, 
  onGenerateLesson,
  isGenerating,
  onLessonClick
}: LessonListProps) => {
  if (isLoadingLessons) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className={`p-4 ${themeColors.border} backdrop-blur-sm bg-white/20 animate-pulse`}>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <Card className={`p-6 text-center ${themeColors.border} backdrop-blur-sm bg-white/50`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <BookOpen className="h-12 w-12 text-korean-600" />
            <Star className="absolute -top-1 -right-1 h-6 w-6 text-yellow-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Start Your Korean Learning Journey</h3>
            <p className="text-sm text-gray-500 mb-4">Create your first personalized lesson based on your interests and goals.</p>
          </div>
          <Button 
            className={`${themeColors.button} w-full max-w-sm`}
            onClick={onGenerateLesson}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="animate-spin h-4 w-4" />
                <span className="animate-fade-in">
                  {loadingMessages[Math.floor((Date.now() / 2000) % loadingMessages.length)]}
                </span>
              </div>
            ) : (
              'Generate Your First Lesson'
            )}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {lessons.map((lesson) => (
        <div key={lesson.id} onClick={() => onLessonClick(lesson.id)}>
          <LessonCard 
            lesson={lesson}
            themeColors={themeColors}
          />
        </div>
      ))}
      
      <Button 
        className={`w-full ${themeColors.button} mt-4`}
        onClick={onGenerateLesson}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin h-4 w-4" />
            <span className="animate-fade-in">
              {loadingMessages[Math.floor((Date.now() / 2000) % loadingMessages.length)]}
            </span>
          </div>
        ) : (
          'Generate Next Lesson'
        )}
      </Button>
    </div>
  );
};
