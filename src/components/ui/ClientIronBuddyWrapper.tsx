'use client';

import { lazy, Suspense, useEffect, useState } from 'react';

// PERFORMANCE CRITICAL: Defer IronBuddy pour améliorer TBT (-50ms)
const IronBuddyFAB = lazy(() => import("@/components/ui/IronBuddyFAB-ENRICHED").then(mod => ({ default: mod.IronBuddyFAB })));

export function ClientIronBuddyWrapper() {
  const [showMascot, setShowMascot] = useState(false);

  useEffect(() => {
    // Defer IronBuddy de 2 secondes pour laisser la page se charger
    const timer = setTimeout(() => {
      setShowMascot(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!showMascot) return null;

  return (
    <Suspense fallback={null}>
      <IronBuddyFAB />
    </Suspense>
  );
}