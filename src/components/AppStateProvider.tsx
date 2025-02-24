
import { useEffect, useCallback, useState, useRef } from 'react';
import { AppStateContext } from '@/contexts/AppStateContext';
import { useAppState } from '@/hooks/useAppState';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type HangulLessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { checkSession, setUserData, setInitialized } = useAppState();
  const navigate = useNavigate();
  const [globalLessons, setGlobalLessons] = useState<HangulLessonType[]>([]);
  const isInitializing = useRef(true);
  const hasFetchedLessons = useRef(false);

  const fetchLessons = useCallback(async () => {
    if (hasFetchedLessons.current) return;
    
    try {
      console.log("📚 Fetching global Hangul lessons...");
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('hangul_lessons_complete')
        .select('*')
        .order('lesson_order', { ascending: true });

      if (lessonsError) throw lessonsError;

      console.log("✅ Global lessons fetched successfully:", lessonsData?.length);
      setGlobalLessons(lessonsData || []);
      hasFetchedLessons.current = true;
    } catch (error) {
      console.error("❌ Error fetching global Hangul lessons:", error);
    }
  }, []);

  const handleAuthChange = useCallback(async (event: string, session: any) => {
    if (!isInitializing.current) {
      console.log("🔒 Auth state changed:", event, "Session present:", !!session);
      
      if (event === 'SIGNED_OUT') {
        console.log("👋 User signed out, clearing data and redirecting to auth");
        setUserData(null);
        setInitialized(true);
        navigate("/auth");
      }
    }
  }, [navigate, setUserData, setInitialized]);

  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      console.log("🚀 Starting app initialization");
      try {
        await checkSession();
        if (mounted) {
          await fetchLessons();
          isInitializing.current = false;
          setInitialized(true);
        }
      } catch (error) {
        console.error("❌ Error during initialization:", error);
        if (mounted) {
          setInitialized(true);
        }
      }
    };

    initializeApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    console.log("🎯 Auth state change listener set up");

    return () => {
      console.log("🧹 Cleaning up app state provider");
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleAuthChange, checkSession, setInitialized, fetchLessons]);

  return (
    <AppStateContext.Provider value={{ globalLessons }}>
      {children}
    </AppStateContext.Provider>
  );
}
