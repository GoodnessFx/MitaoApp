import React, { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';
import { AuthProvider } from './lib/auth-context';
import { initSentry } from "./lib/sentry";
import { useLocaleStore } from "./store/locale";
import './lib/i18n';
import App from "./App.tsx";
import './index.css'

initSentry();
useLocaleStore.getState().applyLanguageToDom();

// Ensure a clean, branded browser title even when host tooling injects defaults.
if (typeof document !== "undefined") {
  document.title = "MitaoApp";
}

// PWA: allow "Add to Home Screen" / install prompt (requires manifest + service worker).
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const base = (import.meta as any).env?.BASE_URL?.toString?.() || "/";
    const swUrl = new URL(`${base}sw.js`, window.location.origin).toString();
    navigator.serviceWorker.register(swUrl, { scope: base }).catch(() => {
      // Silent fail: PWA is optional.
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
