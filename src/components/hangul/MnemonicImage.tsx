
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface MnemonicImageProps {
  mnemonicImage: string | null;
  mnemonicBase: string;
  isLoadingImage: boolean;
  isRegeneratingImage: boolean;
  onRegenerateImage: () => void;
}

export function MnemonicImage({
  mnemonicImage,
  mnemonicBase,
  isLoadingImage,
  isRegeneratingImage,
  onRegenerateImage,
}: MnemonicImageProps) {
  const { toast } = useToast();

  if (isLoadingImage) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!mnemonicImage) return null;

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative">
        <img
          src={mnemonicImage}
          alt={`Mnemonic for learning`}
          className="max-w-sm rounded-lg shadow-lg"
        />
        {process.env.NODE_ENV === 'development' && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2"
            onClick={onRegenerateImage}
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
