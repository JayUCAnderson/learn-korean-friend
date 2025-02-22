
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import { DialogueMessage } from "./DialogueMessage";
import { Eye, EyeOff, MessageCircle, Book, Dumbbell } from "lucide-react";

interface LessonContentProps {
  content: string;
}

type DialoguePart = {
  speaker: string;
  message: string;
  koreanText?: string;
  englishText?: string;
} | null;

export function LessonContent({ content }: LessonContentProps) {
  const [showAllTranslations, setShowAllTranslations] = useState(false);
  
  // Parse content to extract dialogue parts
  const dialogueParts: DialoguePart[] = [];
  const lines = content.split('\n');
  
  let currentSpeaker: string | null = null;
  let koreanText = '';
  let englishText = '';
  let currentSection = '';
  
  for (const line of lines) {
    // Detect section headers
    if (line.startsWith('###')) {
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
      currentSection = line.replace('###', '').trim();
      continue;
    }
    
    // Check for new speaker
    if (line.endsWith(':')) {
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
      
      currentSpeaker = line.slice(0, -1);
      continue;
    }
    
    // Skip romanization
    if (line.startsWith('(') && line.endsWith(')')) {
      continue;
    }
    
    // Detect Korean vs English text
    if (/[\u3131-\u314e\u314f-\u3163\uac00-\ud7a3]/.test(line)) {
      koreanText = line.trim();
    } else if (line.trim() && !line.startsWith('---')) {
      englishText = line.trim();
    }
    
    // Add message when we have both Korean and English
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

  return (
    <div className="space-y-4">
      <Tabs defaultValue="dialogue" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dialogue" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Dialogue
          </TabsTrigger>
          <TabsTrigger value="vocabulary" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Vocabulary
          </TabsTrigger>
          <TabsTrigger value="practice" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Practice
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dialogue">
          <Card className="p-6 bg-gradient-to-b from-white/90 to-white/50 backdrop-blur">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Dialogue</h2>
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

            <div className="prose max-w-none mb-6">
              <h3>Setting</h3>
              <p>Two friends, Min-jun and Soo-yeon, are discussing their favorite movies at a café.</p>
            </div>

            <div className="space-y-8">
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
                    isFirst={index === 0 || dialogueParts[index - 1]?.speaker !== part.speaker}
                  />
                )
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="vocabulary">
          <Card className="p-6 bg-gradient-to-b from-white/90 to-white/50 backdrop-blur">
            <h2 className="text-lg font-semibold mb-4">Vocabulary</h2>
            <div className="prose max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="practice">
          <Card className="p-6 bg-gradient-to-b from-white/90 to-white/50 backdrop-blur">
            <h2 className="text-lg font-semibold mb-4">Practice Exercises</h2>
            <div className="prose max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
