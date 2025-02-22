
import { Card } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import { DialogueMessage } from "./DialogueMessage";

interface LessonContentProps {
  content: string;
}

type Speaker = "teacher" | "student";
type DialoguePart = {
  speaker: Speaker;
  message: string;
} | null;

export function LessonContent({ content }: LessonContentProps) {
  // Parse the content to determine if it's a dialogue or regular markdown
  const isDialogueFormat = content.includes("Teacher:") || content.includes("Student:");
  
  if (!isDialogueFormat) {
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

  // Split content into dialogue parts
  const dialogueParts: DialoguePart[] = content
    .split(/\n/)
    .filter(line => line.trim())
    .map(line => {
      const isTeacher = line.startsWith("Teacher:");
      const isStudent = line.startsWith("Student:");
      if (!isTeacher && !isStudent) return null;

      const speaker: Speaker = isTeacher ? "teacher" : "student";
      const message = line.replace(/^(Teacher|Student):/, "").trim();
      
      return { speaker, message };
    })
    .filter(Boolean);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Lesson Content</h2>
      <Card className="p-6 bg-white/50 backdrop-blur">
        <div className="space-y-6">
          {dialogueParts.map((part, index) => (
            part && (
              <DialogueMessage
                key={index}
                speaker={part.speaker}
                content={part.message}
              />
            )
          ))}
        </div>
      </Card>
    </div>
  );
}
