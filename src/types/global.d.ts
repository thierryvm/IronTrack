// Déclarations types globales pour corriger les erreurs TypeScript

// Types Babel
declare module '@babel/core' {
  const babel: unknown
  export = babel
}

declare module '@babel/generator' {
  const generator: unknown
  export = generator
}

declare module '@babel/template' {
  const template: unknown
  export = template
}

declare module '@babel/traverse' {
  const traverse: unknown
  export = traverse
}

// Types History
declare module 'history' {
  export interface Location {
    pathname: string
    search: string
    hash: string
    state?: unknown
  }
  export interface History {
    length: number
    location: Location
    push(path: string, state?: unknown): void
    replace(path: string, state?: unknown): void
    go(n: number): void
    goBack(): void
    goForward(): void
  }
}

// Types Istanbul (coverage)
declare module 'istanbul-lib-coverage' {
  export interface CoverageMap {
    [key: string]: unknown
  }
}

declare module 'istanbul-lib-report' {
  export interface Context {
    [key: string]: unknown
  }
}

// Types Phoenix (Supabase Realtime)
declare module 'phoenix' {
  export class Socket {
    constructor(endPoint: string, opts?: Record<string, unknown>)
    connect(): void
    disconnect(): void
  }
  export class Channel {
    constructor(topic: string, params?: Record<string, unknown>, socket?: Socket)
    join(): unknown
    leave(): unknown
    on(event: string, callback: (...args: unknown[]) => unknown): unknown
  }
}

// Correction pour les erreurs de types globaux TypeScript
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_ROLE_KEY?: string
    }
  }
}

export {}