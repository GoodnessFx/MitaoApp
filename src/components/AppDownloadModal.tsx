import { useEffect } from "react";

export type StoreKind = "Google Play" | "App Store";

function storeTitle(store: StoreKind) {
  return store === "Google Play" ? "Mitao for Android — coming soon" : "Mitao for iPhone — coming soon";
}

function storeBody(store: StoreKind) {
  if (store === "Google Play") {
    return "We're working on the Android app. In the meantime, you can enjoy the full Mitao experience right here on the web.";
  }
  return "We're working on the iOS app. In the meantime, you can enjoy the full Mitao experience right here on the web.";
}

export default function AppDownloadModal({
  open,
  store,
  onClose,
}: {
  open: boolean;
  store: StoreKind;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={storeTitle(store)}
    >
      <button
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close modal"
        type="button"
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-white/85 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.14),_transparent_55%)]" />

        <div className="relative p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0A1931] text-white flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V7a2 2 0 00-2-2h-1l-1-2H10L9 5H8a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <div className="flex-1">
              <p className="font-outfit font-black text-xl text-gray-900 leading-snug">{storeTitle(store)}</p>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{storeBody(store)}</p>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl hover:bg-black/5 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors"
              aria-label="Close"
              type="button"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-5 rounded-xl border border-black/5 bg-white/70 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-[#F97316]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm text-gray-700 leading-relaxed">
                <p className="font-semibold text-gray-900">Tip</p>
                <p className="text-gray-600 mt-0.5">
                  You can add Mitao to your home screen now for a fast, app-like experience.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <button
              onClick={onClose}
              className="flex-1 bg-[#0A1931] hover:bg-[#061021] text-white font-outfit font-bold py-3 rounded-xl transition-colors text-sm"
              type="button"
            >
              Continue on web
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 py-3 rounded-xl transition-colors text-sm font-semibold"
              type="button"
            >
              Not now
            </button>
          </div>

          <p className="mt-3 text-[11px] text-gray-400">
            No app store link yet. This is intentional — we’ll publish here once it’s ready.
          </p>
        </div>
      </div>
    </div>
  );
}
