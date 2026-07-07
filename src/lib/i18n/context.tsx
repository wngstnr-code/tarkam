"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { dict } from "./dict";

export type Lang = "en" | "id";

const STORAGE_KEY = "tarkam.lang";
const DEFAULT_LANG: Lang = "en";

type TParams = Record<string, string | number>;

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: keyof typeof dict, params?: TParams) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function interpolate(template: string, params?: TParams) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in params ? String(params[k]) : `{${k}}`
  );
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  // Baca preferensi tersimpan setelah mount (localStorage hanya ada di client).
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "id") setLangState(saved);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  const t = useCallback(
    (key: keyof typeof dict, params?: TParams) => {
      const entry = dict[key];
      if (!entry) return String(key);
      return interpolate(entry[lang] ?? entry.en, params);
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
