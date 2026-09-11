import React from 'react';

export default function DemoBanner() {
  const demoMode = import.meta.env.VITE_DEMO_1688_MODE;
  if (demoMode !== 'mock' && demoMode !== 'true') return null;
  return <div className="fixed top-0 left-0 right-0 bg-yellow-300 h-1.5 z-50" aria-hidden="true" />;
}
