
import { useEffect, useCallback, useState, useMemo } from 'react';
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
  const [hasFetchedLessons, setHasFetchedLessons] = useState(false);

  const fetchLessons = useCallback(async () => {
    if (hasFetchedLessons) return;
    
    try {
      console.log("📚 Fetching global Hangul lessons...");
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('hangul_lessons_complete')
        .select('*')
        .order('lesson_order', { ascending: true });

      if (lessonsError) {
        console.error("❌ Error fetching global Hangul lessons:", lessonsError);
        throw lessonsError;
      }

      if (lessonsData) {
        console.log("✅ Global lessons fetched successfully:", lessonsData.length);
        setGlobalLessons(lessonsData);
        setHasFetchedLessons(true);
      }
    } catch (error) {
      console.error("❌ Error fetching global Hangul lessons:", error);
    }
  }, [hasFetchedLessons]);

  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      console.log("🚀 Starting app initialization");
      try {
        await checkSession();
        if (mounted) {
          await fetchLessons();
          setInitialized(true);
        }
      } catch (error) {
        console.error("❌ Error during initialization:", error);
        if (mounted) {
          setInitialized(true);
        }
      }
    };

    const handleAuthChange = (event: string) => {
      if (event === 'SIGNED_OUT' && mounted) {
        console.log("👋 User signed out, clearing data and redirecting to auth");
        setUserData(null);
        navigate("/auth");
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
  }, [checkSession, setInitialized, fetchLessons, navigate, setUserData]);

  const contextValue = useMemo(() => ({
    globalLessons,
  }), [globalLessons]);

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
}
