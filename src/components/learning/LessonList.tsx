
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
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
}

export const LessonList = ({ 
  lessons, 
  isLoadingLessons, 
  themeColors, 
  onGenerateLesson,
  isGenerating 
}: LessonListProps) => {
  if (isLoadingLessons) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-korean-600" />
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <Card className={`p-6 text-center ${themeColors.border} backdrop-blur-sm bg-white/50`}>
        <h3 className="text-lg font-semibold mb-4">Start Your Korean Learning Journey</h3>
        <Button 
          className={`${themeColors.button}`}
          onClick={onGenerateLesson}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating your first lesson...
            </>
          ) : (
            'Generate Your First Lesson'
          )}
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {lessons.map((lesson) => (
        <LessonCard 
          key={lesson.id}
          lesson={lesson}
          themeColors={themeColors}
        />
      ))}
      
      <Button 
        className={`w-full ${themeColors.button} mt-4`}
        onClick={onGenerateLesson}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          'Generate Next Lesson'
        )}
      </Button>
    </div>
  );
};
