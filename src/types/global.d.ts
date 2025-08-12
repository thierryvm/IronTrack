// Déclarations types globales pour corriger les erreurs TypeScript

// Types Babel
declare module '@babel/core' {
  const babel: any
  export = babel
}

declare module '@babel/generator' {
  const generator: any
  export = generator
}

declare module '@babel/template' {
  const template: any
  export = template
}

declare module '@babel/traverse' {
  const traverse: any
  export = traverse
}

// Types History
declare module 'history' {
  export interface Location {
    pathname: string
    search: string
    hash: string
    state?: any
  }
  export interface History {
    length: number
    location: Location
    push(path: string, state?: any): void
    replace(path: string, state?: any): void
    go(n: number): void
    goBack(): void
    goForward(): void
  }
}

// Types Istanbul (coverage)
declare module 'istanbul-lib-coverage' {
  export interface CoverageMap {
    [key: string]: any
  }
}

declare module 'istanbul-lib-report' {
  export interface Context {
    [key: string]: any
  }
}

// Types Phoenix (Supabase Realtime)
declare module 'phoenix' {
  export class Socket {
    constructor(endPoint: string, opts?: any)
    connect(): void
    disconnect(): void
  }
  export class Channel {
    constructor(topic: string, params?: any, socket?: Socket)
    join(): any
    leave(): any
    on(event: string, callback: Function): any
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