
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react";

interface VocabularyItem {
  korean: string;
  english: string;
  pronunciation?: string;
  mastery?: number;
  timesReviewed?: number;
}

interface VocabularyListProps {
  vocabulary: VocabularyItem[];
}

export function VocabularyList({ vocabulary }: VocabularyListProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
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
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
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
            onClick={() => setCurrentIndex(prev => Math.min(vocabulary.length - 1, prev + 1))}
            disabled={currentIndex === vocabulary.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">{currentWord.korean}</h3>
          {currentWord.pronunciation && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <span>{currentWord.pronunciation}</span>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          <p className="text-lg text-gray-600">{currentWord.english}</p>
        </div>

        {currentWord.mastery !== undefined && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Mastery</span>
              <span>{currentWord.mastery}%</span>
            </div>
            <Progress value={currentWord.mastery} className="h-2" />
          </div>
        )}
      </Card>
    </div>
  );
}
