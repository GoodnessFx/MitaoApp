import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useCartCount } from "./shared";
import { CATEGORIES, SUBCATEGORIES } from "../data/products";
import { useLocaleStore } from "../store/locale";
import { useTranslation } from "react-i18next";
import { getCategoryLabel, getSubcategoryLabel } from "../lib/productLocale";

function MegaMenu({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState("Featured");
  const navigate = useNavigate();
  const language = useLocaleStore((s) => s.language);

  const groups: Record<string, string[]> = {
    Featured: ["Dresses", "Sneakers", "Skincare", "Watches", "Bags", "Storage"],
    "Women's Clothing": ["Dresses", "Sundresses", "Sweaters"],
    "Women's Shoes": ["Sneakers", "Running"],
    "Men's Clothing": ["Shirts", "Flannel"],
    "Men's Shoes": ["Sneakers", "Running"],
    "Home & Kitchen": ["Cookware", "Bar Stools", "Storage"],
    "Beauty & Personal Care": ["Skincare"],
    "Jewelry & Accessories": ["Jewelry", "Watches", "Bags"],
    "Sports & Outdoors": ["Running", "Sneakers"],
    "Toys & Games": ["Stationery"],
    Electronics: ["Electronics"],
  };

  const suggested = groups[active] ?? ["Dresses", "Sneakers", "Cookware", "Skincare", "Watches", "Storage"];
  const visibleSubs = SUBCATEGORIES.filter((s) => suggested.includes(s.label));

  return (
    <div className="absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-gray-100 z-40 rounded-b-2xl overflow-hidden flex">
      <div className="w-60 border-r border-gray-100 overflow-y-auto no-scrollbar bg-white flex-shrink-0 py-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onMouseEnter={() => setActive(cat)}
            onClick={() => { navigate(`/categories?cat=${encodeURIComponent(cat)}`); onClose(); }}
            className={`w-full text-left px-4 py-2.5 text-sm transition-colors relative ${
              active === cat ? "bg-blue-50 text-[#0A1931] font-semibold" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {active === cat && <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#F97316]" />}
            <span className="block">{getCategoryLabel(cat, language)}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{getCategoryLabel(active, language)}</p>
          <button
            type="button"
            onClick={() => { navigate(`/categories?cat=${encodeURIComponent(active)}`); onClose(); }}
            className="text-xs font-semibold text-[#0A1931] hover:underline"
          >
            {language === "zh" ? "查看全部" : "View all"}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {visibleSubs.map((sub) => (
            <div
              key={sub.label}
              onClick={() => { navigate(`/categories?cat=${encodeURIComponent(sub.label)}`); onClose(); }}
              className="flex flex-col items-center gap-2 cursor-pointer group"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 group-hover:border-[#0A1931] transition-colors bg-gray-100 shadow-sm">
                  <img src={sub.img} alt={sub.label} className="w-full h-full object-cover" />
                </div>
                {sub.hot && (
                  <span className="absolute -top-1 -right-1 bg-[#F97316] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm">HOT</span>
                )}
              </div>
              <span className="text-xs text-gray-700 text-center group-hover:text-[#0A1931] transition-colors">
                {getSubcategoryLabel(sub.label, language)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SupportDropdown({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const items = [
    { label: "Support center", path: "/support", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Safety center", path: "/safety", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    { label: "Chat with Mitao", path: "/chat", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
    { label: "Mitao purchase protection", path: "/purchase-protection", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
    { label: "Privacy policy", path: "/privacy", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
    { label: "Terms of use", path: "/terms", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ];
  return (
    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
      {items.map((item) => (
        <button key={item.label} onClick={() => { navigate(item.path); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
          </svg>
          {item.label}
        </button>
      ))}
    </div>
  );
}

function SignInPopover({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [showGoogle, setShowGoogle] = useState(false);

  if (showGoogle) {
    return (
      <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-xs text-gray-600">Sign in to mitao.com with google.com</span>
          </div>
          <button onClick={() => setShowGoogle(false)} className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#0A1931] flex items-center justify-center text-white font-bold text-sm">J</div>
            <div>
              <p className="text-sm font-medium text-gray-900">Jamie Chen</p>
              <p className="text-xs text-gray-500">jamie.chen@gmail.com</p>
            </div>
          </div>
          <button onClick={() => { navigate("/account"); onClose(); }}
            className="w-full bg-[#0A1931] hover:bg-[#061021] text-white rounded-lg py-2.5 text-sm font-semibold transition-colors mb-3">
            Continue as Jamie
          </button>
          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
            To continue, google.com will share your name, email address, and profile picture with this site. See this site's{" "}
            <Link to="/privacy" onClick={onClose} className="text-[#0A1931] underline">privacy policy</Link> and{" "}
            <Link to="/terms" onClick={onClose} className="text-[#0A1931] underline">terms of service</Link>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 p-5 z-50">
      <h3 className="font-outfit font-bold text-gray-900 text-base mb-4 text-center">Sign in for the best experience</h3>
      <button onClick={() => setShowGoogle(true)}
        className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 px-4 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors mb-3">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>
      <button onClick={() => { navigate("/signin"); onClose(); }}
        className="w-full border border-gray-900 rounded-lg py-2.5 px-4 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors mb-4">
        Sign in / Register
      </button>
      <p className="text-[10px] text-gray-400 text-center leading-relaxed">
        By continuing, you agree to our{" "}
        <Link to="/terms" onClick={onClose} className="text-[#0A1931]">Terms of Use</Link> and acknowledge that you have read our{" "}
        <Link to="/privacy" onClick={onClose} className="text-[#0A1931]">Privacy Policy</Link>.
      </p>
    </div>
  );
}

export default function Header() {
  const cartCount = useCartCount();
  const [showMega, setShowMega] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showLocale, setShowLocale] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const signInRef = useRef<HTMLDivElement>(null);
  const supportRef = useRef<HTMLDivElement>(null);
  const localeRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const { language, currency, setLanguage, setCurrency, applyLanguageToDom } = useLocaleStore();
  const assetBase = (import.meta as any).env?.BASE_URL?.toString?.() || "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (signInRef.current && !signInRef.current.contains(e.target as Node)) setShowSignIn(false);
      if (supportRef.current && !supportRef.current.contains(e.target as Node)) setShowSupport(false);
      if (localeRef.current && !localeRef.current.contains(e.target as Node)) setShowLocale(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    // Keep <html lang=".."> in sync for accessibility and built-in translation tools.
    applyLanguageToDom();
  }, [applyLanguageToDom, language]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/search?q=${encodeURIComponent(search.trim())}`); }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30">
      {!scrolled && (
        <div className="hidden md:block bg-[#111111] text-xs py-2 px-4">
          <div className="max-w-screen-xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-green-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l-1 9a1 1 0 001 1h13a1 1 0 001-1L19 8M10 12h4" /></svg>
              Free shipping on all orders &nbsp;/&nbsp; Limited-time offer
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-gray-300">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" /></svg>
              Return within 90 days &nbsp;/&nbsp; Delivery guarantee
            </div>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("mitao:open-install"))}
              className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
              aria-label="Install MitaoApp"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              {language === "zh" ? "安装 MitaoApp" : "Get the Mitao App"}
            </button>
          </div>
        </div>
      )}
      <div className="bg-[#08152a]/98 backdrop-blur-md border-b border-white/8 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
        <div className="max-w-screen-xl mx-auto px-3 sm:px-4 py-3">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_auto] gap-3 lg:grid-cols-[auto_1fr_auto] lg:grid-rows-[auto] lg:items-center">
            <div className="flex min-w-0 items-center gap-3 lg:gap-5">
              <Link to="/" className="flex min-w-0 items-center gap-2.5 flex-shrink-0">
                <img
                  src={`${assetBase}logo.png`}
                  alt="Mitao"
                  className="h-11 w-11 object-contain rounded-lg shadow-[0_12px_28px_rgba(2,6,23,0.22)] border border-white/8"
                />
                <div className="min-w-0">
                  <span className="font-outfit block truncate font-black text-white text-lg sm:text-xl tracking-tight">Mitao</span>
                  <span className="hidden xl:block text-[11px] text-white/55 leading-none whitespace-nowrap">
                    {language === "zh" ? "1688 采购与跨境交付" : "1688 sourcing and delivery"}
                  </span>
                </div>
              </Link>

              <nav className="hidden lg:flex items-center gap-1 rounded-full border border-white/8 bg-white/[0.04] px-1.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <Link to="/best-selling" className="text-white/88 hover:text-white text-[13px] px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors whitespace-nowrap">Best Sellers</Link>
            <Link to="/top-rated" className="text-white/88 hover:text-white text-[13px] px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors whitespace-nowrap">Top Rated</Link>
            <Link to="/new-in" className="text-white/88 hover:text-white text-[13px] px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors whitespace-nowrap">New In</Link>
            <div className="relative" onMouseEnter={() => setShowMega(true)} onMouseLeave={() => setShowMega(false)}>
              <button className="text-white/88 hover:text-white text-[13px] px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors flex items-center gap-1 whitespace-nowrap">
                Categories
                <svg className={`w-3.5 h-3.5 transition-transform ${showMega ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showMega && <MegaMenu onClose={() => setShowMega(false)} />}
            </div>
              </nav>
            </div>

            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("mitao:open-install"))}
              className="inline-flex md:hidden items-center gap-1.5 rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-white/14"
              aria-label="Install MitaoApp"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 12l-4-4m4 4l4-4M4 20h16" />
              </svg>
              {language === "zh" ? "安装" : "Install"}
            </button>

            <div className="relative" ref={signInRef}>
              <button onClick={() => { setShowSignIn(!showSignIn); setShowSupport(false); }}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/6 text-white/90 shadow-sm transition-colors hover:bg-white/12 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </button>
              {showSignIn && <SignInPopover onClose={() => setShowSignIn(false)} />}
            </div>

            <div className="relative" ref={supportRef}>
              <button onClick={() => { setShowSupport(!showSupport); setShowSignIn(false); }}
                className="hidden md:flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/6 px-3 text-white/90 shadow-sm transition-colors hover:bg-white/12 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                <span className="text-xs hidden lg:flex items-center gap-0.5">Support <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg></span>
              </button>
              {showSupport && <SupportDropdown onClose={() => setShowSupport(false)} />}
            </div>

            <div className="relative" ref={localeRef}>
              <button
                onClick={() => setShowLocale((v) => !v)}
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/6 px-2.5 text-white/90 shadow-sm transition-colors hover:bg-white/12 hover:text-white"
                aria-label={t("locale.switch")}
                type="button"
              >
                <span className="text-base leading-5">{language === "zh" ? "🇨🇳" : "🇺🇸"}</span>
                <span className="text-[10px] hidden sm:block">{language.toUpperCase()} / {currency}</span>
              </button>

              {showLocale && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-500">{t("locale.title")}</p>
                    <p className="text-sm font-semibold text-gray-900">{t("locale.subtitle")}</p>
                  </div>

                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => { setLanguage("zh"); setCurrency("CNY"); setShowLocale(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${language === "zh" && currency === "CNY" ? "bg-blue-50 text-[#0A1931]" : "hover:bg-gray-50 text-gray-700"}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">🇨🇳</span>
                        <span className="text-sm font-semibold">中文</span>
                      </span>
                      <span className="text-xs text-gray-500">¥ CNY</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setLanguage("en"); setCurrency("USD"); setShowLocale(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${language === "en" && currency === "USD" ? "bg-blue-50 text-[#0A1931]" : "hover:bg-gray-50 text-gray-700"}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">🇺🇸</span>
                        <span className="text-sm font-semibold">English</span>
                      </span>
                      <span className="text-xs text-gray-500">$ USD</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Link to="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/6 text-white/90 shadow-sm transition-colors hover:bg-white/12 hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F97316] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount > 9 ? "9+" : cartCount}</span>
              )}
            </Link>

            <Link to="/orders" className="hidden lg:flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/6 px-3 text-white/90 shadow-sm transition-colors hover:bg-white/12 hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <span className="text-xs">Orders</span>
            </Link>

            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("mitao:open-install"))}
              className="hidden md:flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/6 px-3 text-white/90 shadow-sm transition-colors hover:bg-white/12 hover:text-white"
              aria-label="Install MitaoApp"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 12l-4-4m4 4l4-4M4 20h16" />
              </svg>
              <span className="text-xs">{language === "zh" ? "安装" : "Install"}</span>
            </button>
            </div>

            <form onSubmit={handleSearch} className="col-span-2 lg:col-span-1 lg:col-start-2 lg:row-start-1 min-w-0">
              <div className="flex items-center bg-white rounded-2xl border border-white/10 shadow-[0_14px_28px_rgba(3,7,18,0.18)] overflow-hidden">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("search.placeholder")}
                  className="flex-1 min-w-0 px-4 py-3 text-sm text-gray-800 outline-none bg-transparent placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  className="mr-1.5 bg-[#F97316] hover:bg-[#EA580C] px-4 py-2.5 transition-colors rounded-xl shadow-sm"
                  aria-label={t("search.submit")}
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
