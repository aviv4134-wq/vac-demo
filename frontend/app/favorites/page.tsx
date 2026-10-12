"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { ArrowUpDown, Heart, Loader2, MapPin, SearchX, Trash2 } from "lucide-react"
import { API_BASE_URL, fetchAccommodations } from "@/lib/api"
import type { Accommodation } from "@/lib/types"
import { SiteHeader } from "@/components/vacation/site-header"
import { AccommodationCard } from "@/components/vacation/accommodation-card"
import { AccommodationDetails } from "@/components/vacation/accommodation-details"

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "rating">("price-asc")
  const [selected, setSelected] = useState<Accommodation | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("user_favorites")
      if (saved) {
        setFavoriteIds(JSON.parse(saved))
      }
    } catch {
      // ignore
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // טעינת כל החופשות כדי להציג את אלו שסומנו במועדפים
  const { data: allAccommodations, isLoading } = useSWR<Accommodation[]>(
    `${API_BASE_URL}/api/accommodations?pageSize=1000`,
    fetchAccommodations,
    { revalidateOnFocus: false }
  )

  const favoriteAccommodations = useMemo(() => {
    if (!allAccommodations || favoriteIds.length === 0) return []
    const favSet = new Set(favoriteIds)
    let filtered = allAccommodations.filter((item) => favSet.has(item.id))

    // סינון לפי עיר
    if (selectedCity !== "all") {
      filtered = filtered.filter((item) => item.city === selectedCity)
    }

    // מיון לפי מחיר / דירוג
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "price-asc") {
        return a.minRoomPriceWithVat - b.minRoomPriceWithVat
      }
      if (sortBy === "price-desc") {
        return b.minRoomPriceWithVat - a.minRoomPriceWithVat
      }
      return (b.rating ?? 0) - (a.rating ?? 0)
    })

    return filtered
  }, [allAccommodations, favoriteIds, selectedCity, sortBy])

  // רשימת ערים ייחודיות מתוך המועדפים
  const availableCities = useMemo(() => {
    if (!allAccommodations || favoriteIds.length === 0) return []
    const favSet = new Set(favoriteIds)
    const cities = new Set<string>()
    allAccommodations.forEach((item) => {
      if (favSet.has(item.id) && item.city) {
        cities.add(item.city)
      }
    })
    return Array.from(cities).sort()
  }, [allAccommodations, favoriteIds])

  const removeFavorite = (id: number) => {
    const nextIds = favoriteIds.filter((item) => item !== id)
    setFavoriteIds(nextIds)
    try {
      localStorage.setItem("user_favorites", JSON.stringify(nextIds))
      fetch(`${API_BASE_URL}/api/accommodations/${id}/like?isLike=false`, { method: "POST" }).catch(() => {})
    } catch {
      // ignore
    }
  }

  const clearAllFavorites = () => {
    setFavoriteIds([])
    try {
      localStorage.removeItem("user_favorites")
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SiteHeader favoritesCount={favoriteIds.length} />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* כותרת דף וסרגל בקרה */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 font-heading text-3xl font-bold tracking-tight">
              <Heart className="size-7 fill-destructive text-destructive" />
              המועדפים שלי
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {favoriteIds.length > 0
                ? `שמרת ${favoriteIds.length} מקומות אירוח במועדפים`
                : "עדיין לא שמרת מקומות אירוח במועדפים"}
            </p>
          </div>

          {favoriteIds.length > 0 && (
            <button
              type="button"
              onClick={clearAllFavorites}
              className="flex items-center gap-1.5 self-start rounded-xl border border-destructive/30 px-3.5 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10 sm:self-auto"
            >
              <Trash2 className="size-4" />
              נקה את כל המועדפים
            </button>
          )}
        </div>

        {favoriteIds.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-4 shadow-sm">
            {/* סינון לפי עיר */}
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              <label htmlFor="city-filter" className="text-sm font-medium">
                סינון לפי עיר:
              </label>
              <select
                id="city-filter"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="h-10 rounded-xl border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-2"
              >
                <option value="all">כל הערים ({favoriteIds.length})</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* מיון לפי מחיר / דירוג */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="size-4 text-muted-foreground" />
              <label htmlFor="sort-filter" className="text-sm font-medium">
                מיון לפי:
              </label>
              <select
                id="sort-filter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 rounded-xl border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-2"
              >
                <option value="price-asc">מחיר: מהנמוך לגבוה</option>
                <option value="price-desc">מחיר: מהגבוה לנמוך</option>
                <option value="rating">דירוג אורחים הגבוה ביותר</option>
              </select>
            </div>
          </div>
        )}

        {/* תוכן ראשי */}
        {!isLoaded || isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">טוען את המועדפים שלך...</p>
          </div>
        ) : favoriteIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed bg-card px-6 py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <Heart className="size-7 text-muted-foreground" />
            </div>
            <h2 className="font-heading text-xl font-semibold">אין לך מועדפים שמורים עדיין</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              סייר בין מגוון המלונות, הוילות והצימרים ולחץ על סמל ה-❤️ כדי לשמור את המקומות שאהבת לרשימה זו.
            </p>
            <Link
              href="/"
              className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
            >
              חזרה לחיפוש חופשות
            </Link>
          </div>
        ) : favoriteAccommodations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
            <SearchX className="size-8 text-muted-foreground" />
            <h2 className="font-heading text-lg font-semibold">לא נמצאו מועדפים בעיר שנבחרה</h2>
            <button
              type="button"
              onClick={() => setSelectedCity("all")}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              הצג את כל המועדפים
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {favoriteAccommodations.map((item) => (
              <li key={item.id} className="relative">
                <AccommodationCard
                  accommodation={item}
                  isFavorite={true}
                  onToggleFavorite={removeFavorite}
                  onOpen={setSelected}
                />
              </li>
            ))}
          </ul>
        )}
      </main>

      <AccommodationDetails accommodation={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
