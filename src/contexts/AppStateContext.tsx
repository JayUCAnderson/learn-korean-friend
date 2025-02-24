
import { createContext, useContext } from 'react';
import type { Database } from '@/integrations/supabase/types';

type HangulLessonType = Database['public']['Views']['hangul_lessons_complete']['Row'];

interface AppStateContextType {
  globalLessons: HangulLessonType[];
}

export const AppStateContext = createContext<AppStateContextType>({
  globalLessons: [],
});

export const useAppStateContext = () => useContext(AppStateContext);

