import React from 'react';

export default function DemoBanner() {
  const demoMode = import.meta.env.VITE_DEMO_1688_MODE;
  if (demoMode !== 'mock') return null;
  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-300 text-black font-outfit font-medium text-center py-1 z-50">
      Demo data – not real 1688 listings
    </div>
  );
}
