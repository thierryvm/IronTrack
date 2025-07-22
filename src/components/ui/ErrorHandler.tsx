'use client'

import { useEffect } from 'react'
import { setupGlobalErrorHandler } from '@/utils/errorHandler'

export const ErrorHandler = () => {
  useEffect(() => {
    setupGlobalErrorHandler()
  }, [])

  return null
}