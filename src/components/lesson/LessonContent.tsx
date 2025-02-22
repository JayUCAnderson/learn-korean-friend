
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogueMessage } from "./DialogueMessage";
import { MessageCircle, Book, Dumbbell } from "lucide-react";
import { VocabularyList } from "./VocabularyList";
import { PracticeExercises } from "./PracticeExercises";

interface LessonContentProps {
  content: string;
}

type DialoguePart = {
  speaker: string;
  koreanText: string;
  englishText: string;
};

export function LessonContent({ content }: LessonContentProps) {
  const [showAllTranslations, setShowAllTranslations] = useState(false);
  
  // Try to parse content as JSON, if it fails assume it's a markdown string
  let parsedContent;
  try {
    parsedContent = JSON.parse(content);
  } catch (e) {
    // If content is not JSON, create a structured object from markdown
    console.log("Content is not JSON, converting from markdown:", content);
    parsedContent = {
      setting: "A casual conversation",
      dialogue: [],
      vocabulary: [],
      exercises: []
    };

    // Split content by sections using markdown headers
    const sections = content.split(/(?=###)/);
    sections.forEach(section => {
      const lines = section.trim().split('\n');
      const header = lines[0].replace('###', '').trim().toLowerCase();
      const content = lines.slice(1).join('\n').trim();

      if (header.includes('dialogue') || header.includes('dialog')) {
        // Parse dialogue content into structured format
        const dialogueLines = content.split('\n\n').filter(Boolean);
        parsedContent.dialogue = dialogueLines.map(line => {
          const [speaker, ...textParts] = line.split(':').map(part => part.trim());
          const text = textParts.join(':').trim();
          const [koreanText, englishText] = text.split('/').map(part => part.trim());
          return {
            speaker: speaker || 'Speaker',
            koreanText: koreanText || text,
            englishText: englishText || ''
          };
        });
      } else if (header.includes('vocabulary')) {
        // Parse vocabulary content
        const vocabLines = content.split('\n').filter(Boolean);
        parsedContent.vocabulary = vocabLines.map(line => {
          const [korean, english] = line.split('-').map(part => part.trim());
          return {
            korean: korean || '',
            english: english || '',
            mastery: 0,
            timesReviewed: 0
          };
        });
      } else if (header.includes('setting')) {
        parsedContent.setting = content.trim();
      } else if (header.includes('practice') || header.includes('exercises')) {
        // Parse practice exercises
        const exerciseLines = content.split('\n\n').filter(Boolean);
        parsedContent.exercises = exerciseLines.map(exercise => {
          const lines = exercise.split('\n');
          return {
            type: 'multiple-choice',
            question: lines[0].trim(),
            options: lines.slice(1, -1).map(line => line.replace('-', '').trim()),
            correctAnswer: lines[lines.length - 1].replace('Answer:', '').trim()
          };
        });
      }
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
                {showAllTranslations ? "Hide All Translations" : "Show All Translations"}
              </Button>
            </div>

            <div className="prose max-w-none mb-6">
              <h3>Setting</h3>
              <p>{parsedContent.setting}</p>
            </div>

            <div className="space-y-8">
              {parsedContent.dialogue.map((part: DialoguePart, index: number) => (
                <DialogueMessage
                  key={index}
                  speaker={part.speaker}
                  koreanText={part.koreanText}
                  englishText={part.englishText}
                  showEnglish={showAllTranslations}
                  onToggleTranslation={() => setShowAllTranslations(!showAllTranslations)}
                  isFirst={index === 0 || parsedContent.dialogue[index - 1]?.speaker !== part.speaker}
                  content=""
                />
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="vocabulary">
          <Card className="p-6 bg-gradient-to-b from-white/90 to-white/50 backdrop-blur">
            <h2 className="text-lg font-semibold mb-4">Vocabulary</h2>
            <VocabularyList vocabulary={parsedContent.vocabulary} />
          </Card>
        </TabsContent>

        <TabsContent value="practice">
          <Card className="p-6 bg-gradient-to-b from-white/90 to-white/50 backdrop-blur">
            <h2 className="text-lg font-semibold mb-4">Practice Exercises</h2>
            <PracticeExercises exercises={parsedContent.exercises} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
