
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface MnemonicImageProps {
  imageUrl: string;
  mnemonicBase: string;
}

export function MnemonicImage({
  imageUrl,
  mnemonicBase,
}: MnemonicImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative">
        {isLoading && (
          <Skeleton className="w-[300px] h-[300px] rounded-lg absolute top-0 left-0" />
        )}
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Mnemonic for learning"
            className="max-w-sm rounded-lg shadow-lg"
            onLoad={() => setIsLoading(false)}
            style={{ opacity: isLoading ? 0 : 1 }}
          />
        )}
      </div>
      <p className="text-sm text-gray-600 italic">
        Mnemonic hint: {mnemonicBase}
      </p>
    </div>
  );
}
