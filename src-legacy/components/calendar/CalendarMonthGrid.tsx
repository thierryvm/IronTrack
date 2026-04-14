'use client'

import type { TouchEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import ActionButton from '@/components/ui/action-button'

import CalendarDayCell from './CalendarDayCell'
import type { CalendarSession } from './calendar-utils'
import { formatDateToYMD, WEEKDAY_LABELS } from './calendar-utils'

interface CalendarMonthGridProps {
  days: Array<{ date: Date; isCurrentMonth: boolean }>
  monthLabel: string
  selectedDate: Date | null
  onNextMonth: () => void
  onPreviousMonth: () => void
  onResetToToday: () => void
  onSelectDate: (date: Date) => void
  onTouchEnd: (event: TouchEvent<HTMLDivElement>) => void
  onTouchStart: (event: TouchEvent<HTMLDivElement>) => void
  resolveSessionsForDate: (dateYmd: string) => CalendarSession[]
}

export default function CalendarMonthGrid({
  days,
  monthLabel,
  selectedDate,
  onNextMonth,
  onPreviousMonth,
  onResetToToday,
  onSelectDate,
  onTouchEnd,
  onTouchStart,
  resolveSessionsForDate,
}: CalendarMonthGridProps) {
  const todayYmd = formatDateToYMD(new Date())
  const selectedYmd = selectedDate ? formatDateToYMD(selectedDate) : null

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Vue mensuelle
          </p>
          <h2 className="text-2xl font-semibold capitalize text-foreground">{monthLabel}</h2>
        </div>

        <div className="flex items-center gap-2">
          <ActionButton type="button" tone="icon" onClick={onPreviousMonth} aria-label="Mois précédent">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </ActionButton>
          <ActionButton type="button" tone="primary" onClick={onResetToToday}>
            Aujourd’hui
          </ActionButton>
          <ActionButton type="button" tone="icon" onClick={onNextMonth} aria-label="Mois suivant">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </ActionButton>
        </div>
      </div>

      <div
        className="space-y-2 rounded-[26px] border border-border/80 bg-background/55 p-3 sm:p-4"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: 'pan-y pinch-zoom' }}
      >
        <div className="grid grid-cols-7 gap-2">
          {WEEKDAY_LABELS.map((dayLabel) => (
            <div
              key={dayLabel}
              className="px-1 pb-1 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              {dayLabel}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dateYmd = formatDateToYMD(day.date)

            return (
              <CalendarDayCell
                key={dateYmd}
                dateLabel={day.date.getDate()}
                isCurrentMonth={day.isCurrentMonth}
                isSelected={selectedYmd === dateYmd}
                isToday={todayYmd === dateYmd}
                sessions={resolveSessionsForDate(dateYmd)}
                onSelect={() => onSelectDate(day.date)}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
