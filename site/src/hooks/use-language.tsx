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

export interface LanguageContextType {
  language: Language;
  isTh: boolean;
  setLanguage: (lang: Language) => void;
  t: (en: string, th: string) => string;
}

const defaultContext: LanguageContextType = {
  language: "EN",
  isTh: false,
  setLanguage: () => {},
  t: (en: string) => en,
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

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

  const t = useCallback(
    (en: string, th: string) => (language === "TH" ? th : en),
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      isTh: language === "TH",
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
