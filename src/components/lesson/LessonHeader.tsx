
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AudioPlayer } from '@/components/lesson/AudioPlayer';

interface LessonHeaderProps {
  title: string;
  description: string | null;
  lessonId: string;
  audioUrl: string | null;
  onAudioUrlUpdate: (url: string) => void;
}

export function LessonHeader({ 
  title, 
  description, 
  lessonId, 
  audioUrl, 
  onAudioUrlUpdate 
}: LessonHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src="/placeholder.svg" alt="Teacher" />
          <AvatarFallback>선생님</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
      <AudioPlayer
        lessonId={lessonId}
        title={title}
        description={description}
        audioUrl={audioUrl}
        onAudioUrlUpdate={onAudioUrlUpdate}
      />
    </div>
  );
}
