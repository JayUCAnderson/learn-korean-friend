
import { useEffect, useCallback } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { checkSession, setUserData } = useAppState();
  const navigate = useNavigate();

  const handleAuthChange = useCallback(async (event: string, session: any) => {
    console.log("Auth state changed:", event);
      
    if (event === 'SIGNED_OUT') {
      setUserData(null);
      navigate("/auth");
    } else if (event === 'SIGNED_IN' && session) {
      await checkSession();
    }
  }, [checkSession, navigate, setUserData]);

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthChange]);

  return <>{children}</>;
}
