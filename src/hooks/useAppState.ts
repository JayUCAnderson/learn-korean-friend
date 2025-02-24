
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
  setInitialized: (value) => {
    console.log("🔄 Setting initialized state to:", value);
    set({ isInitialized: value });
  },
  setUserData: (data) => {
    console.log("👤 Setting user data:", data ? "Present" : "Null");
    set({ userData: data });
  },
  checkSession: async () => {
    try {
      console.log("🔍 Checking session...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("❌ Session error:", sessionError);
        throw sessionError;
      }

      if (!session) {
        console.log("⚠️ No active session found");
        set({ userData: null, isInitialized: true });
        return;
      }

      console.log("📝 Session found, fetching profile for user:", session.user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error("❌ Error fetching profile:", error);
        throw error;
      }

      console.log("✅ Profile fetched successfully, updating state");
      set({ userData: data, isInitialized: true });
    } catch (error) {
      console.error("❌ Session check failed:", error);
      set({ userData: null, isInitialized: true });
    }
  }
}));
