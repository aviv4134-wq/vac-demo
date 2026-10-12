import type { SearchFilters } from "./types"

export const CITIES = [
  "ירושלים",
  "תל אביב",
  "אילת",
  "חיפה",
  "ים המלח",
  "ראש פינה",
  "נתניה",
  "מצפה רמון",
]

export const PROPERTY_TYPES = ["מלון", "וילה", "דירת אירוח", "צימר", "אתר נופש"]

export const PRICE_MIN = 0
export const PRICE_MAX = 4000

export const DEFAULT_FILTERS: SearchFilters = {
  query: "",
  city: "all",
  types: [],
  priceRange: [PRICE_MIN, PRICE_MAX],
  guests: 2,
  nights: 1,
  pool: false,
  jacuzzi: false,
  parking: false,
  minRating: 0,
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function countActiveFilters(filters: SearchFilters) {
  let count = 0
  if (filters.query.trim()) count++
  if (filters.city !== "all") count++
  if (filters.types.length) count++
  if (filters.priceRange[0] > PRICE_MIN || filters.priceRange[1] < PRICE_MAX) count++
  if (filters.guests !== DEFAULT_FILTERS.guests) count++
  if (filters.nights !== DEFAULT_FILTERS.nights) count++
  if (filters.pool) count++
  if (filters.jacuzzi) count++
  if (filters.parking) count++
  if (filters.minRating > 0) count++
  return count
}

const priceFormatter = new Intl.NumberFormat("he-IL", { maximumFractionDigits: 0 })

export function formatPrice(value: number) {
  return priceFormatter.format(value)
}
