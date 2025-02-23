
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface VocabularyItem {
  korean: string;
  english: string;
}

interface VocabularyCardProps {
  vocabulary: VocabularyItem[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  mnemonicImage?: string;
}

export function VocabularyCard({ vocabulary, currentIndex, onNext, onPrev, mnemonicImage }: VocabularyCardProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-4">Practice Vocabulary</h2>
      <Card className="p-6 bg-white/50 backdrop-blur">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onPrev}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>
          <div className="text-center flex-1">
            <p className="text-2xl font-bold mb-2">{vocabulary[currentIndex]?.korean}</p>
            <p className="text-lg text-gray-600 mb-4">{vocabulary[currentIndex]?.english}</p>
            {mnemonicImage && (
              <div className="max-w-sm mx-auto">
                <img 
                  src={mnemonicImage} 
                  alt={`Mnemonic for ${vocabulary[currentIndex]?.korean}`}
                  className="rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={onNext}
            disabled={currentIndex === vocabulary.length - 1}
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
}
