
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogueMessage } from "./DialogueMessage";
import { MessageCircle, Book, Dumbbell, ChevronRight } from "lucide-react";
import { VocabularyList } from "./VocabularyList";
import { PracticeExercises } from "./PracticeExercises";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [showCulturalNotes, setShowCulturalNotes] = useState(false);
  const [showReviewSuggestions, setShowReviewSuggestions] = useState(false);
  
  // Try to parse content as JSON, if it fails assume it's a markdown string
  let parsedContent;
  try {
    parsedContent = JSON.parse(content);
  } catch (e) {
    console.log("Content is not JSON or failed to parse:", e);
    return null;
  }

  console.log("Parsed content dialogue:", parsedContent.content.dialogue);
  
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
              {parsedContent.content.dialogue.map((part: any, index: number) => {
                console.log(`Rendering dialogue part ${index}:`, part);
                return (
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
                    isFirstSpeaker={index % 2 === 0} // Alternate between left (true) and right (false)
                  />
                );
              })}
            </div>

            {parsedContent.content.cultural_notes && (
              <Collapsible className="mt-8">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="font-semibold">Cultural Notes</span>
                    <ChevronRight className={`h-4 w-4 transform transition-transform ${showCulturalNotes ? 'rotate-90' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 bg-korean-50 rounded-lg mt-2">
                  <ul className="list-disc pl-4 space-y-2">
                    {parsedContent.content.cultural_notes.map((note: string, index: number) => (
                      <li key={index} className="text-gray-700">{note}</li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            )}

            {parsedContent.content.review_suggestions && (
              <Collapsible className="mt-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="font-semibold">Review Suggestions</span>
                    <ChevronRight className={`h-4 w-4 transform transition-transform ${showReviewSuggestions ? 'rotate-90' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 bg-korean-50/50 rounded-lg mt-2">
                  <ul className="list-disc pl-4 space-y-2">
                    {parsedContent.content.review_suggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="text-gray-700">{suggestion}</li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
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
            <PracticeExercises exercises={parsedContent.exercises || []} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
