import { useEffect, useCallback } from 'react'


interface AnalyticsData {
  event: string
  properties: Record<string, unknown>
  timestamp: number
  sessionId: string
  userId?: string
}

class Analytics {
  private sessionId: string
  private userId?: string
  private events: AnalyticsData[] = []
  private isClient: boolean = false

  constructor() {
    this.sessionId = this.generateSessionId()
    this.isClient = typeof window !== 'undefined'
    if (this.isClient) {
      this.loadFromStorage()
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private loadFromStorage() {
    if (!this.isClient) return
    
    try {
      const stored = localStorage.getItem('irontrack_analytics_events')
      if (stored) {
        this.events = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Erreur chargement analytics:', error)
    }
  }

  private saveToStorage() {
    if (!this.isClient) return
    
    try {
      // Garder seulement les 100 derniers événements
      const recentEvents = this.events.slice(-100)
      localStorage.setItem('irontrack_analytics_events', JSON.stringify(recentEvents))
    } catch (error) {
      console.warn('Erreur sauvegarde analytics:', error)
    }
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  track(event: string, properties: Record<string, unknown> = {}) {
    if (!this.isClient) return
    
    const analyticsData: AnalyticsData = {
      event,
      properties: {
        ...properties,
        url: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId
    }

    this.events.push(analyticsData)
    this.saveToStorage()

    // En mode dev, log dans la console
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics:', event, properties)
    }

    // Ici on pourrait envoyer à un service externe comme PostHog ou Vercel Analytics
    this.sendToExternal(analyticsData)
  }

  private async sendToExternal(data: AnalyticsData) {
    // Exemple d'envoi vers Vercel Analytics (si configuré)
    if (typeof window !== 'undefined' && (window as { va?: (action: string, event: string, props: Record<string, unknown>) => void }).va) {
      (window as { va: (action: string, event: string, props: Record<string, unknown>) => void }).va('track', data.event, data.properties)
    }

    // Ou vers PostHog (si configuré)
    if (typeof window !== 'undefined' && (window as { posthog?: { capture: (event: string, props: Record<string, unknown>) => void } }).posthog) {
      (window as { posthog: { capture: (event: string, props: Record<string, unknown>) => void } }).posthog.capture(data.event, data.properties)
    }
  }

  // Méthodes spécifiques pour le wizard
  trackWizardStep(stepNumber: number, stepName: string, action: 'enter' | 'exit') {
    this.track(`wizard_step_${action}`, {
      step_number: stepNumber,
      step_name: stepName
    })
  }

  trackWizardAbandon(stepNumber: number, stepName: string) {
    this.track('wizard_abandon', {
      abandon_step: stepNumber,
      abandon_step_name: stepName
    })
  }

  trackWizardComplete(totalSteps: number, duration: number) {
    this.track('wizard_complete', {
      total_steps: totalSteps,
      duration_seconds: Math.round(duration / 1000)
    })
  }

  trackSuggestionSelected(suggestionId: string, suggestionName: string, exerciseType: string) {
    this.track('suggestion_selected', {
      suggestion_id: suggestionId,
      suggestion_name: suggestionName,
      exercise_type: exerciseType
    })
  }

  trackSuggestionFeedback(suggestionId: string, suggestionName: string, feedbackType: string) {
    this.track('suggestion_feedback', {
      suggestion_id: suggestionId,
      suggestion_name: suggestionName,
      feedback_type: feedbackType
    })
  }

  getEvents(): AnalyticsData[] {
    return [...this.events]
  }

  clearEvents() {
    this.events = []
    if (this.isClient) {
      localStorage.removeItem('irontrack_analytics_events')
    }
  }
}

// Instance singleton
const analytics = new Analytics()

export const useAnalytics = () => {
  useEffect(() => {
    // Tracker les vues de page seulement côté client
    if (typeof window !== 'undefined') {
      analytics.track('page_view', {
        page: window.location.pathname
      })
    }
  }, [])

  const getEvents = useCallback(() => analytics.getEvents(), [])
  const clearEvents = useCallback(() => analytics.clearEvents(), [])
  
  return {
    track: analytics.track.bind(analytics),
    trackWizardStep: analytics.trackWizardStep.bind(analytics),
    trackWizardAbandon: analytics.trackWizardAbandon.bind(analytics),
    trackWizardComplete: analytics.trackWizardComplete.bind(analytics),
    trackSuggestionSelected: analytics.trackSuggestionSelected.bind(analytics),
    trackSuggestionFeedback: analytics.trackSuggestionFeedback.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
    getEvents,
    clearEvents
  }
}