
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, BookOpen, Star, ChevronRight } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface LessonCardProps {
  lesson: Lesson;
  themeColors: {
    border: string;
  };
}

export const LessonCard = ({ lesson, themeColors }: LessonCardProps) => {
  return (
    <Card 
      key={lesson.id}
      className={`p-4 ${themeColors.border} backdrop-blur-sm bg-white/50 transition-all hover:shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {lesson.status === 'completed' ? (
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          ) : lesson.status === 'in_progress' ? (
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Star className="h-6 w-6 text-gray-400" />
            </div>
          )}
          <div>
            <h3 className="font-semibold">{lesson.title}</h3>
            <p className="text-sm text-gray-500">{lesson.description}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
};
