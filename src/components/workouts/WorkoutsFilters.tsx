import { Filter } from 'lucide-react'

import { Button } from '@/components/ui/button'

export type WorkoutFilterStatus = 'all' | 'pending' | 'completed'

interface WorkoutsFiltersProps {
  filterStatus: WorkoutFilterStatus
  activeCount: number
  totalCount: number
  currentPage: number
  totalPages: number
  onFilterChange: (value: WorkoutFilterStatus) => void
}

const filterOptions: Array<{ value: WorkoutFilterStatus; label: string; helper: string }> = [
  { value: 'all', label: 'Toutes', helper: 'vue complète' },
  { value: 'pending', label: 'À venir', helper: 'encore planifiées' },
  { value: 'completed', label: 'Terminées', helper: 'déjà validées' },
]

export default function WorkoutsFilters({
  filterStatus,
  activeCount,
  totalCount,
  currentPage,
  totalPages,
  onFilterChange,
}: WorkoutsFiltersProps) {
  return (
    <section className="rounded-[26px] border border-border bg-card/82 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.16)] sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Vue active
            </p>
            <h2 className="text-lg font-semibold text-foreground">
              {activeCount} séance{activeCount > 1 ? 's' : ''} visible{activeCount > 1 ? 's' : ''}
            </h2>
            <p className="text-sm text-muted-foreground">
              {filterStatus === 'all'
                ? `sur ${totalCount} enregistrée${totalCount > 1 ? 's' : ''}`
                : `filtre appliqué sur ${totalCount} séance${totalCount > 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="rounded-[18px] border border-border/70 bg-background/42 px-3 py-3 text-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Pagination
            </p>
            <p className="mt-1 font-semibold text-foreground">
              Page {currentPage} / {totalPages}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" aria-hidden="true" />
            Filtrer :
          </span>

          {filterOptions.map((filter) => {
            const isActive = filter.value === filterStatus

            return (
              <Button
                key={filter.value}
                type="button"
                size="sm"
                variant={isActive ? 'default' : 'outline'}
                onClick={() => onFilterChange(filter.value)}
                className={
                  isActive
                    ? 'rounded-[16px] border-primary/20 bg-primary text-primary-foreground hover:bg-primary-hover'
                    : 'rounded-[16px] border-border bg-background/52 text-foreground hover:border-primary/20 hover:bg-accent'
                }
              >
                {filter.label}
                <span className="hidden text-xs opacity-80 sm:inline">· {filter.helper}</span>
              </Button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
