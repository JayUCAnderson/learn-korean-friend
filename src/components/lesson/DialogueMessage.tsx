
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DialogueMessageProps {
  content: string;
  speaker: "teacher" | "student";
  className?: string;
}

export function DialogueMessage({ content, speaker, className }: DialogueMessageProps) {
  const isTeacher = speaker === "teacher";
  
  return (
    <div className={cn(
      "flex gap-4",
      isTeacher ? "flex-row" : "flex-row-reverse",
      className
    )}>
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={isTeacher ? "/teacher-avatar.png" : "/student-avatar.png"} />
        <AvatarFallback>{isTeacher ? "선생" : "학생"}</AvatarFallback>
      </Avatar>
      <Card className={cn(
        "p-4 max-w-[80%] shadow-sm animate-fade-in",
        isTeacher ? "bg-white" : "bg-korean-50"
      )}>
        <p className="text-gray-800 leading-relaxed">{content}</p>
      </Card>
    </div>
  );
}
