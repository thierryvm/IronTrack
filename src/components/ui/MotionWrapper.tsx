'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface MotionWrapperProps {
  children?: ReactNode
  type?: 'div' | 'button'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initial?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animate?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exit?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transition?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  whileHover?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  whileTap?: any
  layout?: boolean
  className?: string
  onClick?: () => void
  disabled?: boolean
  style?: React.CSSProperties
  [key: string]: unknown // Permet toutes les props
}

export function MotionWrapper({ 
  children, 
  type = 'div',
  ...rest
}: MotionWrapperProps) {

  return type === 'button' ? (
    <motion.button {...(rest as any)}>
      {children}
    </motion.button>
  ) : (
    <motion.div {...(rest as any)}>
      {children}
    </motion.div>
  )
}

export function MotionPresence({ 
  children, 
  mode = 'wait' 
}: { 
  children: ReactNode
  mode?: 'wait' | 'sync' | 'popLayout'
}) {
  return (
    <AnimatePresence mode={mode}>
      {children}
    </AnimatePresence>
  )
}

// Presets d'animations courantes
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
}

export const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
  transition: { duration: 0.3 }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.2 }
}