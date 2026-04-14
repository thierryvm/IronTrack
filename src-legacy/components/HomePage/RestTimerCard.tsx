'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Flame } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

import RestTimerControlPanel from './RestTimerControlPanel'
import RestTimerGuidedProfiles, { guidedPresets } from './RestTimerGuidedProfiles'

interface RestTimerCardProps {
  onOpenAdvancedTimer: () => void
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export default function RestTimerCard({ onOpenAdvancedTimer }: RestTimerCardProps) {
  const [selectedTime, setSelectedTime] = useState(90)
  const [timeLeft, setTimeLeft] = useState(90)
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const activePreset = useMemo(
    () => guidedPresets.find((preset) => preset.duration === selectedTime) ?? null,
    [selectedTime],
  )

  useEffect(() => {
    setTimeLeft(selectedTime)
    setIsCompleted(false)
    setIsRunning(false)
  }, [selectedTime])

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      return
    }

    const intervalId = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(intervalId)
          setIsRunning(false)
          setIsCompleted(true)
          return 0
        }

        return previous - 1
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [isRunning, timeLeft])

  const progress = useMemo(
    () => ((selectedTime - timeLeft) / selectedTime) * 100,
    [selectedTime, timeLeft],
  )

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(selectedTime)
    setIsCompleted(false)
  }

  return (
    <Card className="h-full rounded-[30px] border-border/80 bg-card/88 shadow-sm">
      <CardContent className="flex h-full flex-col p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Timer de repos
            </p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Reste concentré entre deux séries</h2>
          </div>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Flame className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

        <div className="flex h-full flex-col rounded-[26px] border border-border/70 bg-background/75 p-5 xl:p-6">
          <div className="grid flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.82fr)]">
            <RestTimerControlPanel
              activePreset={activePreset}
              formatTime={formatTime}
              isRunning={isRunning}
              onOpenAdvancedTimer={onOpenAdvancedTimer}
              onResetTimer={resetTimer}
              onSelectTime={setSelectedTime}
              onToggleRunning={() => {
                setIsCompleted(false)
                setIsRunning((previous) => !previous)
              }}
              progress={progress}
              selectedTime={selectedTime}
              timeLeft={timeLeft}
            />

            <RestTimerGuidedProfiles
              selectedTime={selectedTime}
              onSelectPreset={setSelectedTime}
              formatTime={formatTime}
            />
          </div>

          {isCompleted ? (
            <div className="mt-5 flex items-center justify-center gap-2 rounded-[18px] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>Repos terminé. Reprends la série suivante.</span>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
