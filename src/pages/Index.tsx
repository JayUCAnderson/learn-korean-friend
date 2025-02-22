
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeAssessment from "@/components/WelcomeAssessment";
import LearningInterface from "@/components/LearningInterface";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";

const Index = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (!session) {
          setInitialized(true);
          navigate("/auth");
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }

        console.log("Profile data:", data);
        setUserData(data);
      } catch (error: any) {
        console.error("Session check error:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setInitialized(true);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
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

  // Only show loading spinner if we haven't completed initial session check
  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-korean-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      <main className="pt-16 md:pt-20">
        {(!userData?.level || !userData?.learning_goal) ? (
          <WelcomeAssessment onComplete={handleAssessmentComplete} />
        ) : (
          <LearningInterface userData={userData} />
        )}
      </main>
    </div>
  );

  function handleAssessmentComplete(data: any) {
    setUserData(data);
    toast({
      title: "Welcome to KoreanPal! 환영합니다!",
      description: "We've personalized your learning experience based on your preferences.",
    });
  }
};

export default Index;
