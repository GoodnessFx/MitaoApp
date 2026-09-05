import * as Sentry from "@sentry/react";

const dsn = (import.meta as any).env?.VITE_SENTRY_DSN?.toString() || "";

export function initSentry() {
  // Safe no-op when DSN is not provided.
  if (!dsn) return;

  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 1.0,
  });
}

