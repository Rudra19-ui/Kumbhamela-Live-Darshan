import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  phone: string;
  full_name: string;
  email?: string | null;
  role: string;
  preferred_language?: string;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setAuth: (access: string, refresh: string, user: AuthUser) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: (access, refresh, user) =>
        set({ accessToken: access, refreshToken: refresh, user }),
      clear: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: "kumbh-auth-v1", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
