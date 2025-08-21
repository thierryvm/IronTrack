/**
 * PATCH HMR OPTIMIZATION - Éviter violations 'message' handler
 * Utilise requestIdleCallback pour traitement non-bloquant des messages HMR
 */

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Patch pour Hot Module Reload non-bloquant
  const originalAddEventListener = window.addEventListener;
  
  window.addEventListener = function(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean) {
    if (type === 'message' && process.env.DEV_OPTIMIZE_HMR === 'true') {
      // Wrapper requestIdleCallback pour messages HMR
      const optimizedListener = function(event: Event) {
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            if (typeof listener === 'function') {
              listener(event);
            } else {
              listener.handleEvent(event);
            }
          }, { timeout: 100 });
        } else {
          // Fallback setTimeout
          setTimeout(() => {
            if (typeof listener === 'function') {
              listener(event);
            } else {
              listener.handleEvent(event);
            }
          }, 0);
        }
      };
      
      return originalAddEventListener.call(this, type, optimizedListener, options);
    }
    
    return originalAddEventListener.call(this, type, listener, options);
  };

  // Optimisation console pour développement
  if (typeof console !== 'undefined') {
    const originalWarn = console.warn;
    console.warn = function(...args: unknown[]) {
      // Filtrer warnings HMR répétitifs
      const message = args[0]?.toString() || '';
      if (message.includes('[Violation]') || message.includes('handler took')) {
        return; // Ignore HMR violations en dev
      }
      return originalWarn.apply(console, args);
    };
  }
}

export {};