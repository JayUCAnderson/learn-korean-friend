
import { useEffect } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { checkSession, setUserData } = useAppState();
  const navigate = useNavigate();

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT') {
        setUserData(null);
        navigate("/auth");
      } else if (event === 'SIGNED_IN' && session) {
        checkSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkSession, navigate, setUserData]);

  return <>{children}</>;
}
