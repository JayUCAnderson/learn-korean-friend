
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { LearningPathContainer } from "@/components/learning/LearningPathContainer";
import { getThemeColors } from "@/components/learning/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";

const Lessons = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-korean-600"></div>
      </div>
    );
  }

  const theme = getThemeColors(
    Array.isArray(userData.interests) && userData.interests.length > 0 
      ? userData.interests[0].toLowerCase()
      : ''
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      <main className="pt-16 md:pt-20">
        <div className="max-w-6xl mx-auto p-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Korean Lessons</h1>
            <p className="text-gray-600 mt-2">
              Master the Korean language through personalized, interactive lessons tailored to your interests and goals.
            </p>
          </div>
          <div className="mt-8">
            <LearningPathContainer userData={userData} themeColors={theme} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lessons;
