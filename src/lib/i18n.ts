import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Placeholder translations for Phase 6
const resources = {
  en: {
    translation: {
      "home.hero.title": "Up to 90% Off Everything",
      "home.hero.subtitle": "Free shipping on every order. No minimums. No catch.",
      "nav.shop": "Shop",
      "nav.categories": "Categories",
      "nav.account": "Account",
      "nav.cart": "Cart",
      "search.placeholder": "Search for anything...",
      "search.submit": "Search",
      "locale.switch": "Language and currency",
      "locale.title": "Language & currency",
      "locale.subtitle": "Switch your experience"
    }
  },
  zh: {
    translation: {
      "home.hero.title": "全场低至一折",
      "home.hero.subtitle": "全场包邮，无最低消费限制。",
      "nav.shop": "购物",
      "nav.categories": "分类",
      "nav.account": "账户",
      "nav.cart": "购物车",
      "search.placeholder": "搜索商品、品牌或类目…",
      "search.submit": "搜索",
      "locale.switch": "语言与货币",
      "locale.title": "语言与货币",
      "locale.subtitle": "切换显示语言与币种"
    }
  },
  es: {
    translation: {
      "home.hero.title": "Hasta 90% de descuento en todo",
      "home.hero.subtitle": "Envío gratis en todos los pedidos.",
      "nav.shop": "Tienda",
      "nav.categories": "Categorías",
      "nav.account": "Cuenta",
      "nav.cart": "Carrito",
      "search.placeholder": "Buscar productos...",
      "search.submit": "Buscar",
      "locale.switch": "Idioma y moneda",
      "locale.title": "Idioma y moneda",
      "locale.subtitle": "Cambia tu experiencia"
    }
  }
};

function getInitialLanguage() {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("mitao.locale.v1");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as any;
        if (parsed?.language === "zh" || parsed?.language === "en") return parsed.language;
      } catch {
        // ignore
      }
    }
    const browser = (navigator.language || "").toLowerCase();
    if (browser.startsWith("zh")) return "zh";
  }
  // Default request: start Chinese first-time experience.
  return "zh";
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(), // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
