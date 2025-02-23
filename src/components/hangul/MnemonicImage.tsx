
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { useMnemonicImage } from "./utils/useMnemonicImage";
import { useMnemonicRegenerator } from "./utils/useMnemonicRegenerator";
import type { Database } from "@/integrations/supabase/types";
import { useState } from "react";

type LessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

interface MnemonicImageProps {
  lesson: LessonType;
  mnemonicBase: string;
}

export function MnemonicImage({
  lesson,
  mnemonicBase,
}: MnemonicImageProps) {
  const { mnemonicImage } = useMnemonicImage(lesson);
  const { isRegeneratingImage, regenerateMnemonicImage } = useMnemonicRegenerator(lesson);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative">
        {isLoading && (
          <Skeleton className="w-[300px] h-[300px] rounded-lg absolute top-0 left-0" />
        )}
        {mnemonicImage && (
          <img
            src={mnemonicImage}
            alt="Mnemonic for learning"
            className="max-w-sm rounded-lg shadow-lg"
            onLoad={() => setIsLoading(false)}
            style={{ opacity: isLoading ? 0 : 1 }}
          />
        )}
        {process.env.NODE_ENV === 'development' && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2"
            onClick={regenerateMnemonicImage}
            disabled={isRegeneratingImage}
          >
            <RefreshCw className={`h-4 w-4 ${isRegeneratingImage ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
      <p className="text-sm text-gray-600 italic">
        Mnemonic hint: {mnemonicBase}
      </p>
    </div>
  );
}
