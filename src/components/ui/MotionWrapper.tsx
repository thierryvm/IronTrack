'use client'

import dynamic from 'next/dynamic'
import { ReactNode, Suspense } from 'react'

// Lazy loading des composants Framer Motion
const MotionDiv = dynamic(
  () => import('framer-motion').then((mod) => ({ default: mod.motion.div })),
  { 
    ssr: false,
    loading: () => <div className="opacity-0">Loading...</div>
  }
)

const MotionButton = dynamic(
  () => import('framer-motion').then((mod) => ({ default: mod.motion.button })),
  { 
    ssr: false,
    loading: () => <button className="opacity-0">Loading...</button>
  }
)

const AnimatePresence = dynamic(
  () => import('framer-motion').then((mod) => ({ default: mod.AnimatePresence })),
  { 
    ssr: false,
    loading: () => <div>Loading...</div>
  }
)

interface MotionWrapperProps {
  children: ReactNode
  type?: 'div' | 'button'
  initial?: any
  animate?: any
  exit?: any
  transition?: any
  whileHover?: any
  whileTap?: any
  layout?: boolean
  className?: string
  onClick?: () => void
  disabled?: boolean
  style?: React.CSSProperties
}

export function MotionWrapper({ 
  children, 
  type = 'div',
  initial,
  animate,
  exit,
  transition,
  whileHover,
  whileTap,
  layout,
  className,
  onClick,
  disabled,
  style
}: MotionWrapperProps) {
  const props = {
    initial,
    animate,
    exit,
    transition,
    whileHover,
    whileTap,
    layout,
    className,
    onClick,
    disabled,
    style
  }

  return (
    <Suspense fallback={<div className={className}>{children}</div>}>
      {type === 'button' ? (
        <MotionButton {...props}>
          {children}
        </MotionButton>
      ) : (
        <MotionDiv {...props}>
          {children}
        </MotionDiv>
      )}
    </Suspense>
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
    <Suspense fallback={<div>{children}</div>}>
      <AnimatePresence mode={mode}>
        {children}
      </AnimatePresence>
    </Suspense>
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