import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { translations } from "@/i18n/translations";

export type Language = "ko" | "en" | "ja" | "zh";

export const LANGUAGE_LABELS: Record<Language, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  zh: "中文",
};

export const LANGUAGE_FLAGS: Record<Language, string> = {
  ko: "🇰🇷",
  en: "🇺🇸",
  ja: "🇯🇵",
  zh: "🇨🇳",
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};

const TITLE_BY_LANG: Record<Language, string> = {
  ko: "전우찾기 | 군 생활 종합 가이드 · D-Day · 전우 매칭 - GJ Group",
  en: "ComradeFind | Military Life Guide · D-Day · Comrade Match - GJ Group",
  ja: "戦友探し | 軍生活ガイド・D-Day・戦友マッチング - GJ Group",
  zh: "找战友 | 军旅生活指南 · D-Day · 战友匹配 - GJ Group",
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("lv-lang") as Language;
    return saved && LANGUAGE_LABELS[saved] ? saved : "ko";
  });

  // Sync <html lang> and <title> to current language
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    const title = TITLE_BY_LANG[lang];
    if (title) document.title = title;
  }, [lang]);

  const setLang = useCallback((newLang: Language) => {
    localStorage.setItem("lv-lang", newLang);
    window.location.reload();
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const dict = translations[lang] || {};
    const koDict = translations.ko || {};
    let text = key in dict ? dict[key] : (key in koDict ? koDict[key] : key);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }
    return text;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Force a full reload instead of partial HMR — prevents the context module from
// being duplicated, which would make `useLanguage` see a different Context
// instance than the one the Provider mounted.
if (import.meta.hot) {
  import.meta.hot.invalidate();
}

