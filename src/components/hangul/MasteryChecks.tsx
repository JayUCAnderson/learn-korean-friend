
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface MasteryChecksProps {
  checks: {
    recognition: boolean;
    pronunciation: boolean;
    writing: boolean;
  };
  onCheck: (type: 'recognition' | 'pronunciation' | 'writing') => void;
}

export function MasteryChecks({ checks, onCheck }: MasteryChecksProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-center">Mastery Checks</h3>
      <div className="grid gap-4">
        <Button
          variant={checks.recognition ? "default" : "outline"}
          onClick={() => onCheck('recognition')}
          className="flex justify-between"
        >
          <span>I can recognize this character</span>
          {checks.recognition && <CheckCircle className="h-4 w-4 ml-2" />}
        </Button>
        <Button
          variant={checks.pronunciation ? "default" : "outline"}
          onClick={() => onCheck('pronunciation')}
          className="flex justify-between"
        >
          <span>I can pronounce this character</span>
          {checks.pronunciation && <CheckCircle className="h-4 w-4 ml-2" />}
        </Button>
        <Button
          variant={checks.writing ? "default" : "outline"}
          onClick={() => onCheck('writing')}
          className="flex justify-between"
        >
          <span>I can write this character</span>
          {checks.writing && <CheckCircle className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
