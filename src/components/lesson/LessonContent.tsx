
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import { DialogueMessage } from "./DialogueMessage";
import { Eye, EyeOff } from "lucide-react";

interface LessonContentProps {
  content: string;
}

type Speaker = "teacher" | "student";
type DialoguePart = {
  speaker: Speaker;
  message: string;
  koreanText?: string;
  englishText?: string;
} | null;

export function LessonContent({ content }: LessonContentProps) {
  const [showAllTranslations, setShowAllTranslations] = useState(false);
  
  // Parse content to extract dialogue parts
  const dialogueParts: DialoguePart[] = [];
  const lines = content.split('\n').filter(line => line.trim());
  
  let currentSpeaker: Speaker | null = null;
  let koreanText = '';
  let englishText = '';
  
  for (const line of lines) {
    // Check for new speaker
    if (line.endsWith(':')) {
      // If we have accumulated text from previous speaker, save it
      if (currentSpeaker && (koreanText || englishText)) {
        dialogueParts.push({
          speaker: currentSpeaker,
          message: `${koreanText}\n${englishText}`,
          koreanText,
          englishText
        });
        koreanText = '';
        englishText = '';
      }
      
      const speaker = line.slice(0, -1).toLowerCase();
      currentSpeaker = speaker === 'min-jun' || speaker === 'soo-yeon' ? 'student' : 'teacher';
      continue;
    }
    
    // Skip setting/character descriptions
    if (line.startsWith('Setting:') || line.startsWith('Characters:') || line.startsWith('Dialogue')) {
      continue;
    }
    
    // If line is in parentheses, it's romanization - skip it
    if (line.startsWith('(') && line.endsWith(')')) {
      continue;
    }
    
    // If line contains Korean characters, it's Korean text
    if (/[\u3131-\u314e\u314f-\u3163\uac00-\ud7a3]/.test(line)) {
      koreanText = line.trim();
    } else {
      // Otherwise it's English text
      englishText = line.trim();
    }
    
    // If we have both Korean and English, add the message
    if (currentSpeaker && koreanText && englishText) {
      dialogueParts.push({
        speaker: currentSpeaker,
        message: `${koreanText}\n${englishText}`,
        koreanText,
        englishText
      });
      koreanText = '';
      englishText = '';
    }
  }
  
  // Add any remaining message
  if (currentSpeaker && (koreanText || englishText)) {
    dialogueParts.push({
      speaker: currentSpeaker,
      message: `${koreanText}\n${englishText}`,
      koreanText,
      englishText
    });
  }

  if (dialogueParts.length === 0) {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Lesson Content</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAllTranslations(!showAllTranslations)}
          className="gap-2"
        >
          {showAllTranslations ? (
            <>
              <EyeOff className="h-4 w-4" />
              Hide All Translations
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Show All Translations
            </>
          )}
        </Button>
      </div>
      
      <Card className="p-6 bg-gradient-to-b from-white/90 to-white/50 backdrop-blur border-2 border-korean-100">
        <div className="space-y-8 max-w-3xl mx-auto">
          {dialogueParts.map((part, index) => (
            part && (
              <DialogueMessage
                key={index}
                speaker={part.speaker}
                content={part.message}
                koreanText={part.koreanText}
                englishText={part.englishText}
                showEnglish={showAllTranslations}
                onToggleTranslation={() => setShowAllTranslations(!showAllTranslations)}
                className={index === dialogueParts.length - 1 ? "animate-pulse" : ""}
              />
            )
          ))}
        </div>
      </Card>
    </div>
  );
}
