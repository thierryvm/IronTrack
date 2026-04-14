// Configuration optimisée Framer Motion pour réduire les violations touch events
export const optimizedMotionConfig = {
 // Réduire les event listeners non-passifs
 reducedMotion: typeof window !=='undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
 
 // Configuration pour les pan gestures optimisées
 panConfig: {
 // Utiliser des seuils plus élevés pour éviter les listeners inutiles
 threshold: 10,
 // Optimiser pour la performance
 damping: 30,
 stiffness: 400,
 mass: 0.8
},

 // Configuration pour les animations de swipe
 swipeConfig: {
 // Seuil de vélocité pour déclencher un swipe
 velocityThreshold: 500,
 // Distance minimum pour considérer un swipe
 distanceThreshold: 50
}
}

// Hook pour détecter si on doit utiliser des gestures optimisées
export const useOptimizedGestures = () => {
 return {
 // Pour les calendriers avec swipe
 calendarGestures: {
 onPanEnd: (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number}; velocity: { x: number; y: number}}) => {
 // Seulement traiter les swipes significatifs pour éviter les faux positifs
 if (Math.abs(info.offset.x) > optimizedMotionConfig.swipeConfig.distanceThreshold) {
 return info.offset.x > 0 ?'right' :'left'
}
 return null
},
 // Configuration optimisée pour les touch events
 dragConstraints: { left: 0, right: 0, top: 0, bottom: 0},
 dragElastic: 0.1,
 dragMomentum: false
}
}
}