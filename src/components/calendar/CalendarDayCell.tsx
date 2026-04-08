'use client'

import { Users } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

import type { CalendarSession } from './calendar-utils'
import { getWorkoutTypeMeta } from './calendar-utils'

interface CalendarDayCellProps {
  dateLabel: number
  isCurrentMonth: boolean
  isSelected: boolean
  isToday: boolean
  sessions: CalendarSession[]
  onSelect: () => void
}

export default function CalendarDayCell({
  dateLabel,
  isCurrentMonth,
  isSelected,
  isToday,
  sessions,
  onSelect,
}: CalendarDayCellProps) {
  const visibleSessions = sessions.slice(0, 2)
  const remainingCount = Math.max(0, sessions.length - visibleSessions.length)

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={cn(
        'h-auto min-h-[116px] flex-col items-stretch rounded-[20px] border px-2.5 py-2.5 text-left transition-all duration-200',
        'border-border/70 bg-card/72 hover:border-primary/25 hover:bg-card',
        !isCurrentMonth && 'opacity-45',
        isToday && 'border-primary/35 shadow-[0_0_0_1px_rgba(234,88,12,0.15)]',
        isSelected && 'border-primary/40 bg-accent shadow-[0_18px_30px_rgba(0,0,0,0.16)]',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'text-sm font-semibold text-foreground',
            !isCurrentMonth && 'text-muted-foreground',
          )}
        >
          {dateLabel}
        </span>
        {sessions.length > 0 ? (
          <span className="rounded-full border border-border/80 bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {sessions.length}
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex flex-1 flex-col gap-1.5">
        {visibleSessions.length > 0 ? (
          <>
            {visibleSessions.map((session) => {
              const typeMeta = getWorkoutTypeMeta(session.type)

              return (
                <div
                  key={session.id}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-2 py-1.5 text-xs',
                    typeMeta.pillClass,
                  )}
                >
                  <span className={cn('h-2 w-2 flex-shrink-0 rounded-full', typeMeta.dotClass)} />
                  <span className="min-w-0 flex-1 truncate font-medium">{session.name}</span>
                  {session.isPartnerWorkout ? (
                    <Users className="h-3.5 w-3.5 flex-shrink-0 opacity-80" aria-hidden="true" />
                  ) : null}
                </div>
              )
            })}

            {remainingCount > 0 ? (
              <span className="px-1 text-[11px] font-medium text-muted-foreground">
                +{remainingCount} autre{remainingCount > 1 ? 's' : ''}
              </span>
            ) : null}
          </>
        ) : (
          <div className="flex h-full items-end">
            <span className="sr-only">
              {isCurrentMonth ? 'Aucune séance planifiée' : 'Jour hors du mois courant'}
            </span>
          </div>
        )}
      </div>
    </Button>
  )
}
