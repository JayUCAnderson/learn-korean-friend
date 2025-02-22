
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DialogueMessageProps {
  content: string;
  speaker: "teacher" | "student";
  koreanText?: string;
  englishText?: string;
  className?: string;
}

export function DialogueMessage({ content, speaker, koreanText, englishText, className }: DialogueMessageProps) {
  const isTeacher = speaker === "teacher";
  
  return (
    <div className={cn(
      "flex gap-4",
      isTeacher ? "flex-row" : "flex-row-reverse",
      "animate-fade-in",
      className
    )}>
      <Avatar className="h-12 w-12 shrink-0">
        <AvatarImage 
          src={isTeacher ? "/teacher-avatar.png" : "/student-avatar.png"} 
          alt={isTeacher ? "Teacher" : "Student"}
        />
        <AvatarFallback>{isTeacher ? "선생" : "학생"}</AvatarFallback>
      </Avatar>
      <div className="space-y-2 max-w-[80%]">
        <Card className={cn(
          "p-4 shadow-sm",
          isTeacher ? "bg-white" : "bg-korean-50",
        )}>
          {koreanText && (
            <p className="text-gray-900 leading-relaxed mb-1 text-lg">
              {koreanText}
            </p>
          )}
          {englishText && (
            <p className="text-gray-600 leading-relaxed text-sm">
              {englishText}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
