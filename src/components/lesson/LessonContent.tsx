
import { Card } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';

interface LessonContentProps {
  content: string;
}

export function LessonContent({ content }: LessonContentProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Lesson Content</h2>
      <Card className="p-6 bg-white/50 backdrop-blur">
        <div className="prose max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </Card>
    </div>
  );
}
