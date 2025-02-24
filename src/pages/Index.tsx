
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeAssessment from "@/components/WelcomeAssessment";
import LearningInterface from "@/components/LearningInterface";
import { useToast } from "@/components/ui/use-toast";
import { Header } from "@/components/Header";
import { useAppState } from "@/hooks/useAppState";

const Index = () => {
  const { userData, isInitialized } = useAppState();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAssessmentComplete = useCallback((data: any) => {
    toast({
      title: "Welcome to KoreanPal! 환영합니다!",
      description: "We've personalized your learning experience based on your preferences.",
    });
  }, [toast]);

  const shouldShowAssessment = useMemo(() => {
    return !userData?.level || !userData?.learning_goal;
  }, [userData?.level, userData?.learning_goal]);

  // Only show loading spinner if we haven't completed initial session check
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-korean-600"></div>
      </div>
    );
  }

  // If not authenticated, redirect to auth page
  if (!userData) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      <main className="pt-16 md:pt-20">
        {shouldShowAssessment ? (
          <WelcomeAssessment onComplete={handleAssessmentComplete} />
        ) : (
          <LearningInterface userData={userData} />
        )}
      </main>
    </div>
  );
};

export default Index;
