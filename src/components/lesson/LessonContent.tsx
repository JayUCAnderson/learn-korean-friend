
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
  
  // Parse the content into structured data
  const parsedContent = JSON.parse(content);
  const dialogueParts: DialoguePart[] = parsedContent.dialogue || [];
  const vocabulary = parsedContent.vocabulary || [];
  const practiceExercises = parsedContent.exercises || [];
  
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
              {dialogueParts.map((part, index) => (
                <DialogueMessage
                  key={index}
                  speaker={part.speaker}
                  koreanText={part.koreanText}
                  englishText={part.englishText}
                  showEnglish={showAllTranslations}
                  onToggleTranslation={() => setShowAllTranslations(!showAllTranslations)}
                  isFirst={index === 0 || dialogueParts[index - 1]?.speaker !== part.speaker}
                  content=""
                />
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="vocabulary">
          <Card className="p-6 bg-gradient-to-b from-white/90 to-white/50 backdrop-blur">
            <h2 className="text-lg font-semibold mb-4">Vocabulary</h2>
            <VocabularyList vocabulary={vocabulary} />
          </Card>
        </TabsContent>

        <TabsContent value="practice">
          <Card className="p-6 bg-gradient-to-b from-white/90 to-white/50 backdrop-blur">
            <h2 className="text-lg font-semibold mb-4">Practice Exercises</h2>
            <PracticeExercises exercises={practiceExercises} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
