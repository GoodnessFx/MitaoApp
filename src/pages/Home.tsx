import { useEffect, useState } from "react";
import { Link } from "react-router";
import ProductCard from "../components/ProductCard";
import { catalogStore } from "../store/catalog";
import { useTranslation } from "react-i18next";
import { useLocaleStore } from "../store/locale";
import { getProductTitle } from "../lib/productLocale";

export default function Home() {
  const [products, setProducts] = useState(catalogStore.getAll());
  const [visible, setVisible] = useState(10);
  const { t } = useTranslation();
  const language = useLocaleStore((s) => s.language);
  const assetBase = (import.meta as any).env?.BASE_URL?.toString?.() || "/";
  const [cookieDismissed, setCookieDismissed] = useState(() => {
    return localStorage.getItem('mitao_cookie_consent') === 'true';
  });
  const [activeFilter, setActiveFilter] = useState("All");

  const filters: Array<{ key: string; label: string }> = [
    { key: "All", label: language === "zh" ? "全部" : "All" },
    { key: "Women's Fashion", label: language === "zh" ? "女装时尚" : "Women's Fashion" },
    { key: "Men's Fashion", label: language === "zh" ? "男装时尚" : "Men's Fashion" },
    { key: "Home & Kitchen", label: language === "zh" ? "家居厨房" : "Home & Kitchen" },
    { key: "Electronics", label: language === "zh" ? "数码家电" : "Electronics" },
    { key: "Beauty", label: language === "zh" ? "美妆个护" : "Beauty" },
    { key: "Sports", label: language === "zh" ? "运动户外" : "Sports" },
    { key: "Toys", label: language === "zh" ? "玩具文具" : "Toys" },
    { key: "Jewelry", label: language === "zh" ? "珠宝配饰" : "Jewelry" },
  ];
  useEffect(() => catalogStore.subscribe(() => setProducts(catalogStore.getAll())), []);

  const filtered =
    activeFilter === "All"
      ? products
      : products.filter((p) => p.category.includes(activeFilter) || activeFilter.includes(p.category.split("'")[0]));
  const shown = filtered.slice(0, visible);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Hero with image + blue overlay */}
      <div className="relative overflow-hidden" style={{ minHeight: 320 }}>
        <div className="absolute inset-0">
          <img
            src={`${assetBase}hero-china-sourcing.jpg`}
            alt="China sourcing and warehouse operations"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#061021]/65" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#061021]/92 via-[#0A1931]/65 to-transparent" />
        </div>
        <div className="relative max-w-screen-xl mx-auto px-6 py-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-orange-300 text-sm font-semibold mb-2 font-outfit tracking-wide uppercase">Limited Time Offer</p>
            <h1 className="font-outfit font-black text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-3">
              {t("home.hero.title")}
            </h1>
            <p className="text-blue-200 text-sm mb-6 max-w-sm">{t("home.hero.subtitle")}</p>
            <div className="flex gap-3 flex-wrap">
              <Link to="/categories" className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold px-8 py-3 rounded-xl transition-colors font-outfit text-sm">
                Shop Now
              </Link>
              <Link to="/best-selling" className="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm border border-white/30">
                Best Sellers
              </Link>
            </div>
            <div className="flex gap-6 mt-6">
              {[["50M+","Happy shoppers"],["90%","Price savings"],["Free","Shipping always"]].map(([n,l])=>(
                <div key={l}>
                  <p className="text-white font-outfit font-black text-xl">{n}</p>
                  <p className="text-blue-200 text-xs">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:flex gap-3 flex-shrink-0">
            {products.slice(0, 3).map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="w-32 h-32 rounded-2xl overflow-hidden shadow-2xl bg-blue-400 hover:scale-105 transition-transform">
                <img src={p.image} alt={getProductTitle(p, language)} className="w-full h-full object-cover" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Promo strip */}
      <div className="bg-[#F97316] text-white text-xs py-2 overflow-hidden">
        <div className="flex gap-8 animate-pulse items-center justify-center">
          {["🔥 Flash deals live now","📦 Free shipping always","⭐ 4.8 avg rating","🔒 Secure checkout","↩️ 90-day returns","🎁 New deals every hour"].map((t)=>(
            <span key={t} className="whitespace-nowrap font-medium">{t}</span>
          ))}
        </div>
      </div>

      {/* Category pills */}
      <div className="max-w-screen-xl mx-auto px-4 mt-4 mb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {filters.map((f) => (
            <button key={f.key} onClick={() => { setActiveFilter(f.key); setVisible(10); }}
              className={`flex-shrink-0 text-xs px-4 py-2 rounded-full border transition-colors ${f.key === activeFilter ? "bg-[#0A1931] text-white border-[#0A1931]" : "bg-white text-gray-700 border-gray-200 hover:border-[#0A1931] hover:text-[#0A1931]"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section header */}
      <div className="max-w-screen-xl mx-auto px-4 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-[#F97316] rounded-full" />
          <h2 className="font-outfit font-bold text-gray-900 text-lg">
            {activeFilter === "All" ? "Best-Selling Items" : activeFilter}
          </h2>
        </div>
        <Link to="/best-selling" className="text-[#0A1931] text-sm hover:underline">See all</Link>
      </div>

      {/* Product grid */}
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {shown.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {shown.length < filtered.length && (
          <div className="flex justify-center mt-6 mb-8">
            <button onClick={() => setVisible((v) => v + 5)}
              className="bg-white border-2 border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white font-semibold px-10 py-2.5 rounded-full transition-all text-sm font-outfit">
              See more ∨
            </button>
          </div>
        )}
        {shown.length >= filtered.length && filtered.length > 0 && (
          <div className="flex justify-center mt-6 mb-8">
            <p className="text-gray-400 text-sm">You've seen all {filtered.length} items</p>
          </div>
        )}
        {filtered.length === 0 && (
          <div className="flex justify-center py-16">
            <p className="text-gray-400">No products found in this category.</p>
          </div>
        )}
      </div>

      {/* Cookie banner */}
      {!cookieDismissed && (
        <div className="cookie-banner fixed bottom-4 left-4 z-50 bg-white rounded-xl shadow-2xl p-5 max-w-sm border border-gray-100">
          <h3 className="font-outfit font-bold text-gray-900 text-sm mb-2">Privacy & cookie setting</h3>
          <p className="text-xs text-gray-600 leading-relaxed mb-4">
            We use cookies to improve your experience, personalize content and ads. By clicking "Accept All", you agree to our{" "}
            <Link to="/privacy" className="text-[#0A1931] underline">Cookies Policy</Link>.
          </p>
          <div className="flex items-center justify-between">
            <Link to="/privacy" className="text-xs text-gray-500 underline hover:text-gray-700">Customise Cookies</Link>
            <div className="flex gap-2">
              <button onClick={() => { setCookieDismissed(true); localStorage.setItem('mitao_cookie_consent', 'true'); }} className="text-xs px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">Reject All</button>
              <button onClick={() => { setCookieDismissed(true); localStorage.setItem('mitao_cookie_consent', 'true'); }} className="text-xs px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-full transition-colors font-semibold">Accept All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
