
import { useState, useEffect } from "react";
import WelcomeAssessment from "@/components/WelcomeAssessment";
import LearningInterface from "@/components/LearningInterface";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [userData, setUserData] = useState<any>(null);
  const { toast } = useToast();

  // Load saved user data on component mount
  useEffect(() => {
    const savedUserData = localStorage.getItem("koreanPalUserData");
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
    }
  }, []);

  const handleAssessmentComplete = (data: any) => {
    setUserData(data);
    localStorage.setItem("koreanPalUserData", JSON.stringify(data));
    toast({
      title: "Welcome to KoreanPal! 환영합니다!",
      description: "We've personalized your learning experience based on your preferences.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {!userData ? (
        <WelcomeAssessment onComplete={handleAssessmentComplete} />
      ) : (
        <LearningInterface userData={userData} />
      )}
    </div>
  );
};

export default Index;
