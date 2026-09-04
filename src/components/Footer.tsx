import { useState } from "react";
import { Link } from "react-router";
import AppDownloadModal, { type StoreKind } from "./AppDownloadModal";

const SOCIAL = [
  { name: "Instagram", href: "https://www.instagram.com/", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
  { name: "Facebook", href: "https://www.facebook.com/", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { name: "X", href: "https://x.com/", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.857L1.254 2.25H8.08l4.259 5.629 5.905-5.629zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { name: "TikTok", href: "https://www.tiktok.com/", path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" },
  { name: "YouTube", href: "https://www.youtube.com/", path: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
  { name: "Pinterest", href: "https://www.pinterest.com/", path: "M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" },
];

export default function Footer() {
  const [downloadStore, setDownloadStore] = useState<StoreKind | null>(null);

  return (
    <>
      <footer className="bg-[#111111] text-gray-300 mt-8">
        <div className="max-w-screen-xl mx-auto px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-[#F97316] rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <span className="font-outfit font-black text-white text-lg">Mitao</span>
            </div>
            <h4 className="text-white font-semibold text-sm mb-3">Company</h4>
            {[
              { label: "About Mitao", path: "/about" },
              { label: "Affiliate & Influencer Program", path: "/affiliate" },
              { label: "Contact us", path: "/support" },
              { label: "Careers", path: "/careers" },
              { label: "Press", path: "/press" },
              { label: "Mitao's Tree Planting Program", path: "/environment" },
            ].map((l) => (
              <Link key={l.label} to={l.path} className="block text-xs text-gray-400 hover:text-white mb-2 transition-colors">{l.label}</Link>
            ))}
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Customer Service</h4>
            {[
              { label: "Return and refund policy", path: "/returns" },
              { label: "Intellectual property policy", path: "/ip-policy" },
              { label: "Shipping info", path: "/shipping" },
              { label: "Report suspicious activity", path: "/report" },
            ].map((l) => (
              <Link key={l.label} to={l.path} className="block text-xs text-gray-400 hover:text-white mb-2 transition-colors">{l.label}</Link>
            ))}
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Help</h4>
            {[
              { label: "Support center & FAQ", path: "/support" },
              { label: "Safety center", path: "/safety" },
              { label: "Mitao purchase protection", path: "/purchase-protection" },
              { label: "Sitemap", path: "/" },
              { label: "Partner with Mitao", path: "/partner" },
            ].map((l) => (
              <Link key={l.label} to={l.path} className="block text-xs text-gray-400 hover:text-white mb-2 transition-colors">{l.label}</Link>
            ))}
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Download the Mitao App</h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mb-4">
              {[["📉","Price-drop alerts"],["📦","Track orders any time"],["🔒","Faster secure checkout"],["🔔","Low stock alerts"],["🎁","Exclusive offers"],["🏷️","Coupons & offers"]].map(([icon,label])=>(
                <div key={label} className="flex items-center gap-1.5 text-[11px] text-gray-400"><span>{icon}</span><span>{label}</span></div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {[["App Store","M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"],["Google Play","M3.18 23.76c.33.18.72.2 1.09.04l12.19-7.03-2.65-2.65-10.63 9.64zM.5 1.77C.19 2.11 0 2.62 0 3.27v17.47c0 .65.19 1.16.5 1.5l.08.08 9.79-9.79v-.23L.58 1.69.5 1.77zM20.07 10.5l-2.73-1.58-2.97 2.97 2.97 2.97 2.76-1.59c.79-.45.79-1.32-.03-1.77zM4.27.24L16.46 7.27l-2.65 2.65L3.18.28C3.55.12 3.94.06 4.27.24z"]].map(([store,path])=>(
                <button
                  key={store}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 transition-colors"
                  onClick={() => setDownloadStore(store as StoreKind)}
                  type="button"
                >
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>
                  <div className="text-left">
                    <p className="text-[9px] text-gray-400 leading-none">{store === "App Store" ? "Download on the" : "Get it on"}</p>
                    <p className="text-xs text-white font-semibold">{store}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 mb-6">
          <p className="text-sm text-white font-semibold mb-3">Connect with Mitao</p>
          <div className="flex gap-3">
            {SOCIAL.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                aria-label={s.name}
              >
                <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="currentColor"><path d={s.path} /></svg>
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 mb-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {["PCI DSS","Visa Secure","Mastercard ID Check","SafeKey","ProtectBuy","JCB J/Secure","APWG"].map((b)=>(
              <span key={b} className="text-[10px] border border-white/20 text-gray-400 px-2.5 py-1 rounded">{b}</span>
            ))}
          </div>
          <p className="text-[10px] text-gray-500 mb-2">We accept</p>
          <div className="flex flex-wrap gap-2">
            {["Visa","Mastercard","Amex","Discover","Apple Pay","Google Pay","PayPal","JCB","Maestro"].map((p)=>(
              <span key={p} className="text-[10px] bg-white/5 text-gray-400 px-2.5 py-1 rounded border border-white/10">{p}</span>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-gray-500">© 2022 - 2026 Mitao Inc.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/terms" className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors">Terms of use</Link>
            <Link to="/privacy" className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors">Privacy policy</Link>
            <Link to="/cookie-settings" className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors">Your privacy choices</Link>
            <Link to="/ad-choices" className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors">Ad Choices</Link>
          </div>
        </div>
        </div>
      </footer>

      <AppDownloadModal
        open={downloadStore !== null}
        store={downloadStore ?? "Google Play"}
        onClose={() => setDownloadStore(null)}
      />
    </>
  );
}
