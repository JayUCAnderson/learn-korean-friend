
import { useState } from "react";
import WelcomeAssessment from "@/components/WelcomeAssessment";
import LearningInterface from "@/components/LearningInterface";

const Index = () => {
  const [userData, setUserData] = useState<any>(null);

  const handleAssessmentComplete = (data: any) => {
    setUserData(data);
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
