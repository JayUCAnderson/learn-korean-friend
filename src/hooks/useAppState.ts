
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AppState {
  isInitialized: boolean;
  userData: Profile | null;
  setInitialized: (value: boolean) => void;
  setUserData: (data: Profile | null) => void;
  checkSession: () => Promise<void>;
}

export const useAppState = create<AppState>((set, get) => ({
  isInitialized: false,
  userData: null,
  setInitialized: (value) => set({ isInitialized: value }),
  setUserData: (data) => set({ userData: data }),
  checkSession: async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;

      if (!session) {
        set({ userData: null, isInitialized: true });
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

      set({ userData: data, isInitialized: true });
    } catch (error) {
      console.error("Session check error:", error);
      set({ userData: null, isInitialized: true });
    }
  }
}));
