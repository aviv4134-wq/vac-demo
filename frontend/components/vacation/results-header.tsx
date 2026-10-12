"use client"

import { ArrowUpDown, SlidersHorizontal } from "lucide-react"
import type { SortOption } from "@/lib/types"

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "random", label: "מומלץ (אקראי)" },
  { value: "price-asc", label: "מחיר: מהנמוך לגבוה" },
  { value: "price-desc", label: "מחיר: מהגבוה לנמוך" },
  { value: "rating", label: "דירוג אורחים" },
]

interface ResultsHeaderProps {
  count: number
  cityLabel: string
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  activeFilters: number
  onOpenFilters: () => void
}

export function ResultsHeader({
  count,
  cityLabel,
  sort,
  onSortChange,
  activeFilters,
  onOpenFilters,
}: ResultsHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col">
        <h2 className="font-heading text-xl font-bold md:text-2xl">{cityLabel}</h2>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          נמצאו <span className="font-semibold text-foreground tabular-nums">{count}</span> מקומות אירוח
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenFilters}
          className="flex h-10 items-center gap-2 rounded-xl border bg-card px-3 text-sm font-medium lg:hidden"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          סינון
          {activeFilters > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {activeFilters}
            </span>
          )}
        </button>
        <label className="relative flex items-center">
          <span className="sr-only">מיון לפי</span>
          <ArrowUpDown
            className="pointer-events-none absolute start-3 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="h-10 rounded-xl border bg-card ps-9 pe-3 text-sm font-medium outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
