import { useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface WindowEventMap {
    "mitao:open-install": Event;
  }
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  // iOS Safari
  const nav = navigator as any;
  const iosStandalone = typeof nav !== "undefined" && typeof nav.standalone === "boolean" && nav.standalone;

  // Modern browsers
  const displayModeStandalone =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(display-mode: standalone)").matches;

  return Boolean(iosStandalone || displayModeStandalone);
}

function isIOS() {
  const ua = navigator.userAgent || "";
  return /iphone|ipad|ipod/i.test(ua);
}

const DISMISS_KEY = "mitao.installPrompt.dismissed.v1";

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const openedByUserRef = useRef(false);
  const assetBase = (import.meta as any).env?.BASE_URL?.toString?.() || "/";

  const platform = useMemo(() => {
    if (typeof navigator === "undefined") return "web";
    if (isIOS()) return "ios";
    return "web";
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissed = localStorage.getItem(DISMISS_KEY) === "true";
    if (dismissed) return;
    if (isStandalone()) return;

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);

      // Auto-surface a professional prompt once the browser says the app is installable.
      window.setTimeout(() => {
        const dismissedNow = localStorage.getItem(DISMISS_KEY) === "true";
        if (!dismissedNow && !isStandalone()) setVisible(true);
      }, 1200);
    };

    const onOpenInstall = () => {
      openedByUserRef.current = true;
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt as any);
    window.addEventListener("mitao:open-install", onOpenInstall);

    // iOS doesn't fire beforeinstallprompt; show a gentle prompt once.
    if (platform === "ios") {
      window.setTimeout(() => {
        const dismissedNow = localStorage.getItem(DISMISS_KEY) === "true";
        if (!dismissedNow && !isStandalone()) setVisible(true);
      }, 1800);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt as any);
      window.removeEventListener("mitao:open-install", onOpenInstall);
    };
  }, [platform]);

  if (!visible) return null;
  if (isStandalone()) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "true");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  const doInstall = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } finally {
      setDeferred(null);
      setVisible(false);
    }
  };

  const isInstallable = Boolean(deferred);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/35"
        onClick={() => setVisible(false)}
        aria-label="Close"
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0A1931] flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src={`${assetBase}logo.png`} alt="MitaoApp" className="w-10 h-10 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-gray-900 font-outfit font-black text-lg leading-tight">Install MitaoApp</p>
            {platform === "ios" ? (
              <p className="text-sm text-gray-600 mt-1">
                Add Mitao to your Home Screen: tap <span className="font-semibold">Share</span> then{" "}
                <span className="font-semibold">Add to Home Screen</span>.
              </p>
            ) : (
              <p className="text-sm text-gray-600 mt-1">
                Get the full app feel: faster access, cleaner experience, and a Home Screen icon.
              </p>
            )}
          </div>
        </div>

        <div className="px-5 pb-5 flex flex-col gap-2">
          {platform !== "ios" ? (
            <button
              type="button"
              disabled={!isInstallable}
              onClick={doInstall}
              className={`w-full py-3 rounded-xl font-outfit font-bold text-sm transition-colors ${
                isInstallable ? "bg-[#F97316] hover:bg-[#EA580C] text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isInstallable ? "Install" : "Install not available yet"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="w-full py-3 rounded-xl font-outfit font-bold text-sm bg-[#F97316] hover:bg-[#EA580C] text-white transition-colors"
            >
              Got it
            </button>
          )}

          <button
            type="button"
            onClick={dismiss}
            className="w-full py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors border border-gray-200"
          >
            Don’t show again
          </button>
        </div>
      </div>
    </div>
  );
}
