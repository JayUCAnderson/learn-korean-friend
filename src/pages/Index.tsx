
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeAssessment from "@/components/WelcomeAssessment";
import LearningInterface from "@/components/LearningInterface";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth");
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        // Changed this condition to explicitly check if level is null
        // This ensures new users see the welcome assessment
        setUserData(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      } else if (event === 'SIGNED_IN') {
        checkSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleAssessmentComplete = (data: any) => {
    setUserData(data);
    toast({
      title: "Welcome to KoreanPal! 환영합니다!",
      description: "We've personalized your learning experience based on your preferences.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-korean-600"></div>
      </div>
    );
  }

  // Changed this condition to explicitly check if level is null or undefined
  // This ensures new users see the welcome assessment
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {!userData?.level || !userData?.learning_goal ? (
        <WelcomeAssessment onComplete={handleAssessmentComplete} />
      ) : (
        <LearningInterface userData={userData} />
      )}
    </div>
  );
};

export default Index;

