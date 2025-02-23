
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react";

interface VocabularyItem {
  korean: string;
  english: string;
  pronunciation?: string;
  partOfSpeech?: string;
  difficulty?: number;
  mastery?: number;
  timesReviewed?: number;
  mnemonicImage?: string;
}

interface VocabularyListProps {
  vocabulary: VocabularyItem[];
  mnemonicImages?: {
    [key: string]: string;
  } | null;
}

export function VocabularyList({ vocabulary }: VocabularyListProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const currentWord = vocabulary[currentIndex];

  if (!vocabulary.length) {
    return <div className="text-center text-gray-500">No vocabulary words available.</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentIndex(prev => Math.max(0, prev - 1));
              setShowAnswer(false);
            }}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {vocabulary.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentIndex(prev => Math.min(vocabulary.length - 1, prev + 1));
              setShowAnswer(false);
            }}
            disabled={currentIndex === vocabulary.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">{currentWord.korean}</h3>
          
          {currentWord.mnemonicImage && (
            <div className="max-w-sm mx-auto mb-4">
              <img 
                src={currentWord.mnemonicImage} 
                alt={`Mnemonic for ${currentWord.korean}`}
                className="rounded-lg shadow-lg"
              />
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            {currentWord.pronunciation && (
              <>
                <span>{currentWord.pronunciation}</span>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                  <Volume2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowAnswer(!showAnswer)}
          >
            {showAnswer ? "Hide" : "Show"} Meaning
          </Button>

          {showAnswer && (
            <div className="space-y-2 pt-4">
              <p className="text-lg text-gray-600">{currentWord.english}</p>
              {currentWord.partOfSpeech && (
                <p className="text-sm text-gray-500">{currentWord.partOfSpeech}</p>
              )}
            </div>
          )}

          {currentWord.mastery !== undefined && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Mastery</span>
                <span>{currentWord.mastery}%</span>
              </div>
              <Progress value={currentWord.mastery} className="h-2" />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
