/**
 * CACHE MANAGER - Gestion intelligente du cache IronTrack
 * 
 * Implémente les stratégies avancées de la roadmap PWA :
 * - Cache images dynamiques avec compression WebP
 * - Background sync pour données offline
 * - Nettoyage automatique intelligent
 */

import { safeJSONStringify } from '@/utils/json'

export interface CacheOptions {
  maxAge?: number;
  maxEntries?: number;
  compressionEnabled?: boolean;
}

export interface SyncQueueItem {
  id: string;
  type: 'performance' | 'exercise' | 'workout';
  data: unknown;
  timestamp: number;
  retryCount: number;
}

class CacheManager {
  private static instance: CacheManager;
  private syncQueue: SyncQueueItem[] = [];
  private isOnline = navigator.onLine;
  private readonly SYNC_QUEUE_KEY = 'irontrack-sync-queue';
  
  private constructor() {
    this.initializeEventListeners();
    this.loadSyncQueue();
    this.startPeriodicSync();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // CACHE IMAGES DYNAMIQUES AVEC COMPRESSION
  async cacheImageWithCompression(url: string, options: CacheOptions = {}): Promise<string> {
    const { maxAge = 7 * 24 * 60 * 60 * 1000, compressionEnabled = true } = options;
    
    try {
      const cacheKey = `img-${this.hashUrl(url)}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        
        // Vérifier expiration
        if (Date.now() - timestamp < maxAge) {
          return data; // Retourner image mise en cache
        }
      }
      
      // Télécharger et compresser l'image
      const compressedImage = await this.downloadAndCompressImage(url, compressionEnabled);
      
      // Sauvegarder en cache
      localStorage.setItem(cacheKey, JSON.stringify({
        data: compressedImage,
        timestamp: Date.now(),
        originalUrl: url
      }));
      
      return compressedImage;
      
    } catch {
      console.warn('Cache image échoué:', error);
      return url; // Fallback vers URL originale
    }
  }

  // BACKGROUND SYNC POUR DONNÉES OFFLINE
  async addToSyncQueue(type: SyncQueueItem['type'], data: unknown): Promise<void> {
    const item: SyncQueueItem = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };
    
    this.syncQueue.push(item);
    this.saveSyncQueue();
    
    // Log supprimé pour réduire bruit console
    
    // Tenter sync immédiat si en ligne
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  async processSyncQueue(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }
    
    // Log supprimé pour réduire bruit console
    
    const itemsToSync = [...this.syncQueue];
    this.syncQueue = [];
    
    for (const item of itemsToSync) {
      try {
        await this.syncItem(item);
        // Log supprimé pour réduire bruit console
        
      } catch {
        console.warn(`Sync échoué: ${item.type} ${item.id}`, error);
        
        // Retry logic avec exponential backoff
        if (item.retryCount < 3) {
          item.retryCount++;
          item.timestamp = Date.now() + (Math.pow(2, item.retryCount) * 1000);
          this.syncQueue.push(item);
        } else {
          console.error(`Abandon sync après 3 tentatives: ${item.id}`);
        }
      }
    }
    
    this.saveSyncQueue();
  }

  // SYNC SPÉCIALISÉ PAR TYPE DE DONNÉES
  private async syncItem(item: SyncQueueItem): Promise<void> {
    switch (item.type) {
      case 'performance':
        return this.syncPerformance(item.data);
      case 'exercise':
        return this.syncExercise(item.data);
      case 'workout':
        return this.syncWorkout(item.data);
      default:
        throw new Error(`Type de sync non supporté: ${item.type}`);
    }
  }

  private async syncPerformance(data: unknown): Promise<void> {
    // Synchroniser performance vers Supabase
    const response = await fetch('/api/performances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: safeJSONStringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Sync performance échoué: ${response.status}`);
    }
  }

  private async syncExercise(data: unknown): Promise<void> {
    // Synchroniser exercice vers Supabase
    const response = await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: safeJSONStringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Sync exercice échoué: ${response.status}`);
    }
  }

  private async syncWorkout(data: unknown): Promise<void> {
    // Synchroniser workout vers Supabase
    const response = await fetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: safeJSONStringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Sync workout échoué: ${response.status}`);
    }
  }

  // COMPRESSION D'IMAGES INTELLIGENTE
  private async downloadAndCompressImage(url: string, compress: boolean): Promise<string> {
    if (!compress) {
      return url;
    }
    
    try {
      // Télécharger l'image
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Vérifier si c'est déjà WebP
      if (blob.type === 'image/webp') {
        return URL.createObjectURL(blob);
      }
      
      // Créer canvas pour compression
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = () => {
          // Redimensionner si trop grand (max 800px)
          const maxSize = 800;
          let { width, height } = img;
          
          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width *= ratio;
            height *= ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Dessiner et compresser
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/webp', 0.8);
          
          resolve(compressedDataUrl);
        };
        
        img.src = URL.createObjectURL(blob);
      });
      
    } catch {
      console.warn('Compression image échouée:', error);
      return url; // Fallback
    }
  }

  // 🧹 NETTOYAGE AUTOMATIQUE DU CACHE
  async cleanupExpiredCache(): Promise<void> {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    // Nettoyer localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key?.startsWith('img-')) {
        try {
          const cached = JSON.parse(localStorage.getItem(key)!);
          
          if (now - cached.timestamp > oneWeek) {
            localStorage.removeItem(key);
            // Log supprimé pour réduire bruit console
          }
        } catch {
          localStorage.removeItem(key!); // Supprimer entrée corrompue
        }
      }
    }
    
    // Log supprimé pour réduire bruit console
  }

  // 📊 MÉTRIQUES ET MONITORING
  getCacheStats(): { imagesCached: number; queueSize: number; isOnline: boolean } {
    let imagesCached = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('img-')) {
        imagesCached++;
      }
    }
    
    return {
      imagesCached,
      queueSize: this.syncQueue.length,
      isOnline: this.isOnline
    };
  }

  // 🔧 MÉTHODES UTILITAIRES
  private hashUrl(url: string): string {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir en 32bit integer
    }
    return hash.toString(36);
  }

  private initializeEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      // Log supprimé pour réduire bruit console
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      // Log supprimé pour réduire bruit console
    });
  }

  private loadSyncQueue(): void {
    try {
      const saved = localStorage.getItem(this.SYNC_QUEUE_KEY);
      if (saved) {
        this.syncQueue = JSON.parse(saved);
      }
    } catch {
      console.warn('Erreur chargement sync queue:', error);
      this.syncQueue = [];
    }
  }

  private saveSyncQueue(): void {
    try {
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(this.syncQueue));
    } catch {
      console.warn('Erreur sauvegarde sync queue:', error);
    }
  }

  private startPeriodicSync(): void {
    // Tenter sync toutes les 30 secondes si en ligne
    setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    }, 30000);
    
    // Nettoyage automatique toutes les heures
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 60 * 60 * 1000);
  }
}

// Export de l'instance singleton
export const cacheManager = CacheManager.getInstance();