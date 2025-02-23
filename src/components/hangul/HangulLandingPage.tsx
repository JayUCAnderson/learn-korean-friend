
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useHangulLessons } from "@/hooks/useHangulLessons";

const sectionInfo = {
  vowels: {
    title: "Vowels (모음)",
    description: "Master the basic building blocks of Hangul with vowels",
    gradient: "from-[#FFF5F7] to-[#FCE7F3]",
    examples: ["ㅏ", "ㅓ", "ㅗ"],
  },
  basic_consonants: {
    title: "Basic Consonants (기본 자음)",
    description: "Learn the essential consonants of the Korean alphabet",
    gradient: "from-[#F3F4F6] to-[#E5E7EB]",
    examples: ["ㄱ", "ㄴ", "ㄷ"],
  },
  advanced_consonants: {
    title: "Advanced Consonants (복합 자음)",
    description: "Challenge yourself with complex consonant combinations",
    gradient: "from-[#F5F3FF] to-[#EDE9FE]",
    examples: ["ㄲ", "ㄸ", "ㅃ"],
  },
};

export function HangulLandingPage() {
  const { lessons, currentLessonIndex, getLessonSection } = useHangulLessons();
  const navigate = useNavigate();
  
  const calculateSectionProgress = (section: keyof typeof sectionInfo) => {
    if (!lessons.length) return 0;
    
    const sectionLessons = lessons.filter(lesson => getLessonSection(lesson) === section);
    const completedLessons = sectionLessons.filter((_, index) => index <= currentLessonIndex).length;
    
    return (completedLessons / sectionLessons.length) * 100;
  };

  const isAvailable = (section: keyof typeof sectionInfo) => {
    if (section === 'vowels') return true;
    if (section === 'basic_consonants') return calculateSectionProgress('vowels') === 100;
    return calculateSectionProgress('basic_consonants') === 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Learn Hangul (한글)</h1>
          <p className="text-gray-600">Master the Korean alphabet step by step</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {(Object.entries(sectionInfo) as [keyof typeof sectionInfo, typeof sectionInfo[keyof typeof sectionInfo]][]).map(([key, section]) => {
            const progress = calculateSectionProgress(key);
            const available = isAvailable(key);

            return (
              <Card 
                key={key}
                className={`relative overflow-hidden transition-all duration-300 ${
                  available ? 'hover:shadow-lg' : 'opacity-75'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-50`} />
                <div className="relative p-6 space-y-4">
                  <h3 className="text-xl font-semibold">{section.title}</h3>
                  <div className="flex gap-2">
                    {section.examples.map((char) => (
                      <span key={char} className="text-2xl">{char}</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{section.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <Button
                    className="w-full"
                    disabled={!available}
                    onClick={() => navigate(`/hangul?section=${key}`)}
                  >
                    {progress === 100 ? "Review Section" : available ? "Continue Learning" : "Complete Previous Section"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
