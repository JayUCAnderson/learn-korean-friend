
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Volume2, Loader2 } from "lucide-react";

interface LessonHeaderProps {
  character: string;
  romanization: string;
  soundDescription: string;
  onPlayPronunciation: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  isLoadingAudio: boolean;
  audioUrl: string | null;
}

export function LessonHeader({
  character,
  romanization,
  soundDescription,
  onPlayPronunciation,
  onPrevious,
  onNext,
  isLoadingAudio,
  audioUrl,
}: LessonHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        disabled={!onPrevious}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div className="text-center flex-1">
        <h2 className="text-3xl font-bold mb-2">{character}</h2>
        <div className="flex items-center justify-center gap-4">
          <p className="text-lg text-gray-600">
            Romanization: {romanization}
          </p>
          <Button
            variant="outline"
            size="icon"
            onClick={onPlayPronunciation}
            disabled={isLoadingAudio || !audioUrl}
          >
            {isLoadingAudio ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={!onNext}
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
