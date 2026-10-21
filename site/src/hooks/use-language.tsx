"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Language = "TH" | "EN";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "EN",
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("EN");

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language | null;
    if (saved === "TH" || saved === "EN") {
      queueMicrotask(() => setLanguageState(saved));
      document.documentElement.lang = saved === "TH" ? "th" : "en";
    } else {
      document.documentElement.lang = "en";
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    document.documentElement.lang = lang === "TH" ? "th" : "en";
  }, []);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
