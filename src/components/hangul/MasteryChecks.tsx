
import { Button } from "@/components/ui/button";
import { Check, BookOpen } from "lucide-react";

interface MasteryChecksProps {
  onComplete: (isKnown: boolean) => void;
}

export function MasteryChecks({ onComplete }: MasteryChecksProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-center">How well do you know this character?</h3>
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="default"
          onClick={() => onComplete(true)}
          className="flex items-center justify-center gap-2"
        >
          <Check className="h-4 w-4" />
          Known
        </Button>
        <Button
          variant="outline"
          onClick={() => onComplete(false)}
          className="flex items-center justify-center gap-2"
        >
          <BookOpen className="h-4 w-4" />
          Still Under Review
        </Button>
      </div>
    </div>
  );
}
