
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Database } from "@/integrations/supabase/types";

type HangulLessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionLessons: HangulLessonType[];
  sectionName: string;
}

export function ReviewModal({ isOpen, onClose, sectionLessons, sectionName }: ReviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{sectionName} Review</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-full pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
            {sectionLessons.map((lesson) => (
              <div 
                key={lesson.id}
                className="p-4 rounded-lg border bg-card"
              >
                <div className="text-center mb-2">
                  <span className="text-3xl font-bold">{lesson.character}</span>
                  <p className="text-sm text-muted-foreground">{lesson.romanization}</p>
                </div>
                <p className="text-sm">{lesson.sound_description}</p>
                {lesson.examples && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Examples:</p>
                    {Object.entries(lesson.examples as Record<string, string>).map(([korean, english]) => (
                      <div key={korean} className="text-sm">
                        <span className="font-medium">{korean}</span> - {english}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
