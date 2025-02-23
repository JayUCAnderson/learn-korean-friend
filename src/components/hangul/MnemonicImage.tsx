
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { useMnemonicImage } from "./utils/useMnemonicImage";
import { useMnemonicRegenerator } from "./utils/useMnemonicRegenerator";
import type { Database } from "@/integrations/supabase/types";

type LessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

interface MnemonicImageProps {
  lesson: LessonType;
  mnemonicBase: string;
}

export function MnemonicImage({
  lesson,
  mnemonicBase,
}: MnemonicImageProps) {
  const { mnemonicImage, isLoadingImage } = useMnemonicImage(lesson);
  const { isRegeneratingImage, regenerateMnemonicImage } = useMnemonicRegenerator(lesson);

  if (isLoadingImage || !mnemonicImage) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <Skeleton className="w-[300px] h-[300px] rounded-lg" />
        <Skeleton className="w-[200px] h-4" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative">
        <img
          src={mnemonicImage}
          alt="Mnemonic for learning"
          className="max-w-sm rounded-lg shadow-lg"
          loading="lazy"
        />
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
