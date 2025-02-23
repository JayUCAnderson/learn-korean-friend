
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ExamplesSectionProps {
  examples: Record<string, string>;
}

export function ExamplesSection({ examples }: ExamplesSectionProps) {
  const [showExamples, setShowExamples] = useState(false);

  return (
    <div className="space-y-4">
      <Button
        className="w-full"
        variant="outline"
        onClick={() => setShowExamples(!showExamples)}
      >
        {showExamples ? "Hide" : "Show"} Examples
      </Button>

      {showExamples && (
        <div className="p-4 bg-gray-50 rounded-lg">
          {Object.entries(examples).map(([korean, english]) => (
            <div key={korean} className="mb-2">
              <p className="font-semibold">{korean}</p>
              <p className="text-gray-600">{english}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
