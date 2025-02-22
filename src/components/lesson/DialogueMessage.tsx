
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface DialogueMessageProps {
  content: string;
  speaker: "teacher" | "student";
  koreanText?: string;
  englishText?: string;
  className?: string;
  showEnglish: boolean;
  onToggleTranslation: () => void;
}

export function DialogueMessage({ 
  content, 
  speaker, 
  koreanText, 
  englishText, 
  className,
  showEnglish,
  onToggleTranslation
}: DialogueMessageProps) {
  const [isHovering, setIsHovering] = useState(false);
  const isTeacher = speaker === "teacher";
  
  return (
    <div 
      className={cn(
        "flex gap-4 group max-w-[85%]",
        isTeacher ? "mr-auto" : "ml-auto flex-row-reverse",
        className
      )}
    >
      <Avatar className={cn(
        "h-12 w-12 shrink-0",
        "transition-transform duration-300 group-hover:scale-110"
      )}>
        <AvatarImage 
          src={isTeacher ? "/teacher-avatar.png" : "/student-avatar.png"} 
          alt={isTeacher ? "Teacher" : "Student"}
        />
        <AvatarFallback>{isTeacher ? "선생" : "학생"}</AvatarFallback>
      </Avatar>
      
      <div className="space-y-2 relative group">
        <Card 
          className={cn(
            "p-4 relative",
            isTeacher 
              ? "bg-white hover:bg-white/90 border-korean-100" 
              : "bg-korean-50 hover:bg-korean-100/80 border-korean-200",
            "border-2 shadow-md transition-all duration-300",
            "animate-fade-in"
          )}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {koreanText && (
            <p className="text-gray-900 leading-relaxed mb-2 text-lg font-medium">
              {koreanText}
            </p>
          )}
          
          {englishText && (
            <p className={cn(
              "text-gray-600 leading-relaxed",
              showEnglish ? "block" : "hidden",
              isHovering && !showEnglish ? "block opacity-60" : "",
              "transition-all duration-300"
            )}>
              {englishText}
            </p>
          )}
        </Card>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "absolute top-2",
                  isTeacher ? "-right-12" : "-left-12",
                  "opacity-0 group-hover:opacity-100",
                  "transition-all duration-300"
                )}
                onClick={onToggleTranslation}
              >
                {showEnglish ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{showEnglish ? "Hide" : "Show"} translation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
