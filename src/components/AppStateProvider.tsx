
import { useEffect, useCallback } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { checkSession, setUserData, setInitialized } = useAppState();
  const navigate = useNavigate();

  const handleAuthChange = useCallback(async (event: string, session: any) => {
    console.log("Auth state changed:", event);
      
    if (event === 'SIGNED_OUT') {
      setUserData(null);
      setInitialized(true);
      navigate("/auth");
    } else if (event === 'SIGNED_IN' && session) {
      await checkSession();
    }
  }, [checkSession, navigate, setUserData, setInitialized]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await checkSession();
      } catch (error) {
        console.error("Error during initialization:", error);
        setInitialized(true);
      }
    };

    initializeApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthChange, checkSession, setInitialized]);

  return <>{children}</>;
}
