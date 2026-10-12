"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { DirectionProvider } from "@base-ui/react/direction-provider"
import { Loader2, RefreshCw, SearchX, ServerCrash, X } from "lucide-react"
import { DEFAULT_FILTERS, countActiveFilters, shuffle } from "@/lib/accommodations"
import { API_BASE_URL, buildAccommodationsUrl, fetchAccommodations } from "@/lib/api"
import type { Accommodation, SearchFilters, SortOption } from "@/lib/types"
import { AccommodationCard } from "./accommodation-card"
import { AccommodationDetails } from "./accommodation-details"
import { FiltersSidebar } from "./filters-sidebar"
import { ResultsHeader } from "./results-header"
import { SiteHeader } from "./site-header"

function sortAccommodations(list: Accommodation[], sort: SortOption) {
  const copy = [...list]
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.minRoomPriceWithVat - b.minRoomPriceWithVat)
    case "price-desc":
      return copy.sort((a, b) => b.minRoomPriceWithVat - a.minRoomPriceWithVat)
    case "rating":
      return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    default:
      return copy
  }
}

export function VacationSearch() {
  const [draftFilters, setDraftFilters] = useState<SearchFilters>(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<SortOption>("random")
  const [shuffleSeed, setShuffleSeed] = useState(0)
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("user_favorites")
        if (saved) return new Set(JSON.parse(saved))
      } catch {
        // ignore
      }
    }
    return new Set()
  })
  const [selected, setSelected] = useState<Accommodation | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const requestUrl = buildAccommodationsUrl(appliedFilters)
  const { data, error, isLoading, isValidating, mutate } = useSWR(requestUrl, fetchAccommodations, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  })

  const results = useMemo(() => {
    if (!data) return []
    const base = sort === "random" ? shuffle(data) : data
    return sortAccommodations(base, sort)
    // shuffleSeed forces a new random order when "random" is re-selected
  }, [data, sort, shuffleSeed]) // eslint-disable-line react-hooks/exhaustive-deps

  const isFetching = isLoading || isValidating

  const handleSortChange = (next: SortOption) => {
    if (next === "random") setShuffleSeed((s) => s + 1)
    setSort(next)
  }

  const applyFilters = () => {
    if (buildAccommodationsUrl(draftFilters) === requestUrl) mutate()
    else setAppliedFilters(draftFilters)
    setMobileFiltersOpen(false)
  }

  const resetFilters = () => {
    setDraftFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)
  }

  const toggleFavorite = (id: number) =>
    setFavorites((current) => {
      const next = new Set(current)
      const isAdding = !next.has(id)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        localStorage.setItem("user_favorites", JSON.stringify(Array.from(next)))
        fetch(`${API_BASE_URL}/api/accommodations/${id}/like?isLike=${isAdding}`, { method: "POST" }).catch(() => {})
      } catch {
        // ignore
      }
      return next
    })

  const cityLabel =
    appliedFilters.city === "all" ? "חופשות בכל הארץ" : `חופשות ב${appliedFilters.city}`

  return (
    <DirectionProvider direction="rtl">
      <SiteHeader favoritesCount={favorites.size} />

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8 lg:flex-row lg:items-start lg:gap-8">
        <aside
          aria-label="מסננים"
          className={
            mobileFiltersOpen
              ? "fixed inset-0 z-40 overflow-y-auto bg-background p-4 lg:static lg:z-auto lg:bg-transparent lg:p-0"
              : "hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:rounded-2xl"
          }
        >
          <div className="mx-auto flex w-full max-w-md flex-col gap-3 lg:w-80">
            {mobileFiltersOpen && (
              <div className="flex items-center justify-end lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="סגור מסננים"
                  className="flex size-10 items-center justify-center rounded-full border bg-card"
                >
                  <X className="size-5" />
                </button>
              </div>
            )}
            <FiltersSidebar
              draft={draftFilters}
              onChange={setDraftFilters}
              onSubmit={applyFilters}
              onReset={resetFilters}
              isSearching={isFetching}
            />
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-6" aria-busy={isFetching}>
          <ResultsHeader
            count={results.length}
            cityLabel={cityLabel}
            sort={sort}
            onSortChange={handleSortChange}
            activeFilters={countActiveFilters(appliedFilters)}
            onOpenFilters={() => setMobileFiltersOpen(true)}
          />

          {error && !data ? (
            <StatusPanel
              icon={<ServerCrash className="size-10 text-destructive" aria-hidden="true" />}
              title="לא הצלחנו לטעון את מקומות האירוח"
              description={`${error.message}. ודאו ששרת ה-API פועל ומאפשר בקשות CORS מכתובת זו.`}
              action={
                <button
                  type="button"
                  onClick={() => mutate()}
                  disabled={isFetching}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} aria-hidden="true" />
                  נסה שוב
                </button>
              }
            />
          ) : isLoading && !data ? (
            <LoadingState />
          ) : results.length > 0 ? (
            <div className="relative">
              {isValidating && (
                <div
                  role="status"
                  className="absolute inset-0 z-10 flex items-start justify-center rounded-2xl bg-background/60 pt-24 backdrop-blur-[1px]"
                >
                  <span className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium shadow-md">
                    <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
                    מעדכן תוצאות...
                  </span>
                </div>
              )}
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((accommodation, index) => (
                  <li
                    key={accommodation.id}
                    className="flex animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-500"
                    style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
                  >
                    <AccommodationCard
                      accommodation={accommodation}
                      isFavorite={favorites.has(accommodation.id)}
                      nights={appliedFilters.nights}
                      onToggleFavorite={toggleFavorite}
                      onOpen={setSelected}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <StatusPanel
              icon={<SearchX className="size-10 text-muted-foreground" aria-hidden="true" />}
              title="לא נמצאו מקומות אירוח"
              description="נסו להרחיב את טווח המחירים, להפחית את מספר האורחים או להסיר חלק מהמסננים."
              action={
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  איפוס מסננים
                </button>
              }
            />
          )}
        </main>
      </div>

      <AccommodationDetails accommodation={selected} onClose={() => setSelected(null)} />
    </DirectionProvider>
  )
}

function LoadingState() {
  return (
    <div role="status" className="flex flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-20 text-center">
      <Loader2 className="size-10 animate-spin text-primary" aria-hidden="true" />
      <p className="font-heading text-lg font-semibold">טוען מקומות אירוח...</p>
      <p className="text-sm text-muted-foreground">מחפשים עבורכם את החופשה המושלמת</p>
    </div>
  )
}

function StatusPanel({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
      {icon}
      <h3 className="font-heading text-lg font-semibold">{title}</h3>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action}
    </div>
  )
}
