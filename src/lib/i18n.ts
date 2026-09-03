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
      "nav.cart": "Cart"
    }
  },
  zh: {
    translation: {
      "home.hero.title": "全场低至一折",
      "home.hero.subtitle": "全场包邮，无最低消费限制。",
      "nav.shop": "购物",
      "nav.categories": "分类",
      "nav.account": "账户",
      "nav.cart": "购物车"
    }
  },
  es: {
    translation: {
      "home.hero.title": "Hasta 90% de descuento en todo",
      "home.hero.subtitle": "Envío gratis en todos los pedidos.",
      "nav.shop": "Tienda",
      "nav.categories": "Categorías",
      "nav.account": "Cuenta",
      "nav.cart": "Carrito"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
