
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, BookOpen, Star, ChevronRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Lesson {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  vocabulary?: any[];
}

interface LessonCardProps {
  lesson: Lesson;
  themeColors: {
    border: string;
  };
}

export const LessonCard = ({ lesson, themeColors }: LessonCardProps) => {
  const getStatusIcon = () => {
    switch(lesson.status) {
      case 'completed':
        return (
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center animate-scale-in">
            <Check className="h-6 w-6 text-green-600" />
          </div>
        );
      case 'in_progress':
        return (
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
        );
      default:
        return (
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Star className="h-6 w-6 text-gray-400" />
          </div>
        );
    }
  };

  return (
    <Card 
      key={lesson.id}
      className={`p-4 ${themeColors.border} backdrop-blur-sm bg-white/50 transition-all hover:shadow-lg cursor-pointer group`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getStatusIcon()}
            <div>
              <h3 className="font-semibold group-hover:text-korean-600 transition-colors">{lesson.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>15-20 min</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="transition-transform group-hover:translate-x-1"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {lesson.vocabulary && lesson.vocabulary.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {lesson.vocabulary.slice(0, 3).map((vocab: any, index: number) => (
              <Badge 
                key={index}
                variant="secondary" 
                className="bg-white/50 text-gray-700"
              >
                {vocab.korean} ({vocab.english})
              </Badge>
            ))}
            {lesson.vocabulary.length > 3 && (
              <Badge variant="secondary" className="bg-white/50 text-gray-700">
                +{lesson.vocabulary.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
