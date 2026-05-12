import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Lang = "hi" | "en" | "mr";

type LangState = {
  lang: Lang;
  setLang: (l: Lang) => void;
};

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: "hi",
      setLang: (lang) => set({ lang }),
    }),
    { name: "kumbh-lang-v2", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
