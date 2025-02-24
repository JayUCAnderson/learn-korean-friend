
import { useEffect, useCallback } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { checkSession, setUserData, setInitialized } = useAppState();
  const navigate = useNavigate();

  const handleAuthChange = useCallback(async (event: string, session: any) => {
    console.log("🔒 Auth state changed:", event, "Session present:", !!session);
      
    if (event === 'SIGNED_OUT') {
      console.log("👋 User signed out, clearing data and redirecting to auth");
      setUserData(null);
      setInitialized(true);
      navigate("/auth");
    }
    // Remove the session check from here since it's handled by initializeApp
  }, [navigate, setUserData, setInitialized]);

  useEffect(() => {
    let isInitializing = true;

    const initializeApp = async () => {
      console.log("🚀 Starting app initialization");
      try {
        await checkSession();
        isInitializing = false;
      } catch (error) {
        console.error("❌ Error during initialization:", error);
        setInitialized(true);
      }
    };

    initializeApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    console.log("🎯 Auth state change listener set up");

    return () => {
      console.log("🧹 Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [handleAuthChange, checkSession, setInitialized]);

  return <>{children}</>;
}
