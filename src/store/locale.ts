import { create } from "zustand";
import i18n from "../lib/i18n";
import type { CurrencyCode } from "../lib/currency";

type LanguageCode = "en" | "zh";

const STORAGE_KEY = "mitao.locale.v1";

function getBrowserDefault(): { language: LanguageCode; currency: CurrencyCode } {
  if (typeof navigator !== "undefined") {
    const lang = (navigator.language || "").toLowerCase();
    if (lang.startsWith("zh")) return { language: "zh", currency: "CNY" };
  }
  // Default request: Chinese + CNY (can be changed anytime in the UI).
  return { language: "zh", currency: "CNY" };
}

function safeParse(value: string | null): Partial<{ language: LanguageCode; currency: CurrencyCode }> {
  if (!value) return {};
  try {
    return JSON.parse(value) as any;
  } catch {
    return {};
  }
}

function persist(state: { language: LanguageCode; currency: CurrencyCode }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export const useLocaleStore = create<{
  language: LanguageCode;
  currency: CurrencyCode;
  setLanguage: (language: LanguageCode) => void;
  setCurrency: (currency: CurrencyCode) => void;
  applyLanguageToDom: () => void;
}>(() => {
  const browserDefault = getBrowserDefault();
  const stored = typeof window !== "undefined" ? safeParse(localStorage.getItem(STORAGE_KEY)) : {};

  const language = (stored.language ?? browserDefault.language) as LanguageCode;
  const currency = (stored.currency ?? browserDefault.currency) as CurrencyCode;

  // Keep i18n synced at startup.
  i18n.changeLanguage(language);

  return {
    language,
    currency,
    setLanguage: (next) => {
      useLocaleStore.setState((s) => {
        const nextState = { ...s, language: next };
        i18n.changeLanguage(next);
        persist({ language: nextState.language, currency: nextState.currency });
        try {
          document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
        } catch {
          // ignore
        }
        return nextState;
      });
    },
    setCurrency: (next) => {
      useLocaleStore.setState((s) => {
        const nextState = { ...s, currency: next };
        persist({ language: nextState.language, currency: nextState.currency });
        return nextState;
      });
    },
    applyLanguageToDom: () => {
      try {
        const lang = useLocaleStore.getState().language;
        // Use region-aware tags so browsers can offer accurate built-in translation prompts.
        document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
      } catch {
        // ignore
      }
    },
  };
});
