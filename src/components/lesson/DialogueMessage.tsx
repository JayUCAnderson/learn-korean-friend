
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface DialogueMessageProps {
  content: string;
  speaker: string;
  koreanText?: string;
  englishText?: string;
  className?: string;
  showEnglish: boolean;
  onToggleTranslation: () => void;
  isFirst?: boolean;
}

export function DialogueMessage({ 
  speaker, 
  koreanText, 
  englishText, 
  className,
  showEnglish,
  onToggleTranslation,
  isFirst
}: DialogueMessageProps) {
  const [isHovering, setIsHovering] = useState(false);
  const isFirstSpeaker = speaker.toLowerCase() === "민준"; // Default first speaker
  
  return (
    <div 
      className={cn(
        "flex gap-4 group max-w-[85%]",
        isFirstSpeaker ? "mr-auto" : "ml-auto flex-row-reverse",
        className
      )}
    >
      <Avatar className={cn(
        "h-12 w-12 shrink-0",
        "transition-transform duration-300 group-hover:scale-110",
        isFirstSpeaker ? "bg-korean-100" : "bg-korean-200"
      )}>
        <AvatarImage alt={speaker} />
        <AvatarFallback>{speaker.charAt(0)}</AvatarFallback>
      </Avatar>
      
      <div className="space-y-2 relative group">
        {isFirst && (
          <span className="text-sm text-gray-500 mb-1 block">{speaker}</span>
        )}
        <Card 
          className={cn(
            "p-4 relative",
            isFirstSpeaker 
              ? "bg-white hover:bg-white/90 border-korean-100" 
              : "bg-korean-50 hover:bg-korean-100/80 border-korean-200",
            "border-2 shadow-md transition-all duration-300",
            "animate-fade-in"
          )}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <p className="text-gray-900 leading-relaxed mb-2 text-lg font-medium">
            {koreanText}
          </p>
          
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
                  isFirstSpeaker ? "-right-12" : "-left-12",
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
