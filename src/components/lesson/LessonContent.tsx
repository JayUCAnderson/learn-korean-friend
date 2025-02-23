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
  mnemonicImages?: Record<string, string> | null;
}

type DialoguePart = {
  speaker: string;
  koreanText: string;
  englishText: string;
};

export function LessonContent({ content, mnemonicImages }: LessonContentProps) {
  const [showAllTranslations, setShowAllTranslations] = useState(false);
  
  // Try to parse content as JSON, if it fails assume it's a markdown string
  let parsedContent;
  try {
    parsedContent = JSON.parse(content);
  } catch (e) {
    console.log("Content is not JSON or failed to parse:", e);
    return null;
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

            <div className="space-y-8">
              {parsedContent.content.dialogue.map((part: any, index: number) => (
                <DialogueMessage
                  key={index}
                  speaker={part.speaker}
                  koreanText={part.koreanText}
                  englishText={part.englishText}
                  showEnglish={showAllTranslations}
                  onToggleTranslation={() => setShowAllTranslations(!showAllTranslations)}
                  isFirst={index === 0 || parsedContent.content.dialogue[index - 1]?.speaker !== part.speaker}
                  notes={part.notes}
                  gender={part.gender}
                  content=""
                />
              ))}
            </div>

            {parsedContent.content.cultural_notes && (
              <div className="mt-8 p-4 bg-korean-50 rounded-lg">
                <h3 className="font-semibold mb-2">Cultural Notes</h3>
                <ul className="list-disc pl-4 space-y-2">
                  {parsedContent.content.cultural_notes.map((note: string, index: number) => (
                    <li key={index} className="text-gray-700">{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {parsedContent.content.review_suggestions && (
              <div className="mt-4 p-4 bg-korean-50/50 rounded-lg">
                <h3 className="font-semibold mb-2">Review Suggestions</h3>
                <ul className="list-disc pl-4 space-y-2">
                  {parsedContent.content.review_suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="text-gray-700">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="vocabulary">
          <Card className="p-6 bg-gradient-to-b from-white/90 to-white/50 backdrop-blur">
            <h2 className="text-lg font-semibold mb-4">Vocabulary</h2>
            <VocabularyList vocabulary={parsedContent.vocabulary} mnemonicImages={mnemonicImages} />
          </Card>
        </TabsContent>

        <TabsContent value="practice">
          <Card className="p-6 bg-gradient-to-b from-white/90 to-white/50 backdrop-blur">
            <h2 className="text-lg font-semibold mb-4">Practice Exercises</h2>
            <div className="space-y-4">
              <div className="p-4 bg-korean-50 rounded-lg">
                <h3 className="font-semibold mb-4">Review Suggestions</h3>
                <ul className="list-disc pl-4 space-y-2">
                  {parsedContent.content.review_suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="text-gray-700">{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
