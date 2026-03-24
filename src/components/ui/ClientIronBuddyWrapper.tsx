'use client';

import { useEffect, useState} from'react';
import { IronBuddyFAB} from"@/components/ui/IronBuddyFAB-ENRICHED";

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

 return <IronBuddyFAB />;
}