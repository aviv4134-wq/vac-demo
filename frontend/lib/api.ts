import { DEFAULT_FILTERS, PRICE_MAX, PRICE_MIN } from "./accommodations"
import type { Accommodation, SearchFilters } from "./types"

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5113").replace(/\/$/, "")

export const ACCOMMODATIONS_ENDPOINT = `${API_BASE_URL}/api/accommodations`

export function buildSearchParams(filters: SearchFilters) {
  const params = new URLSearchParams()
  const [minPrice, maxPrice] = filters.priceRange

  if (filters.query.trim()) {
    params.set("query", filters.query.trim())
    params.set("searchTerm", filters.query.trim())
  }
  if (filters.city !== DEFAULT_FILTERS.city && filters.city !== "all") {
    params.set("city", filters.city)
  }
  for (const type of filters.types) {
    params.append("type", type)
    params.append("propertyTypes", type)
  }
  if (minPrice > PRICE_MIN) params.set("minPrice", String(minPrice))
  if (maxPrice < PRICE_MAX) params.set("maxPrice", String(maxPrice))
  if (filters.guests > 0) {
    params.set("guests", String(filters.guests))
    params.set("minCapacity", String(filters.guests))
  }
  if (filters.nights > 1) params.set("nights", String(filters.nights))
  if (filters.pool) params.set("hasPool", "true")
  if (filters.jacuzzi) params.set("hasJacuzzi", "true")
  if (filters.parking) params.set("freeParking", "true")
  if (filters.minRating > 0) params.set("minRating", String(filters.minRating))

  return params
}

export function buildAccommodationsUrl(filters: SearchFilters) {
  const query = buildSearchParams(filters).toString()
  return query ? `${ACCOMMODATIONS_ENDPOINT}?${query}` : ACCOMMODATIONS_ENDPOINT
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function fetchAccommodations(url: string): Promise<Accommodation[]> {
  let response: Response
  try {
    response = await fetch(url, { headers: { Accept: "application/json" } })
  } catch {
    throw new ApiError(`לא ניתן להתחבר לשרת בכתובת ${API_BASE_URL}`)
  }

  if (!response.ok) {
    throw new ApiError(`השרת החזיר שגיאה (${response.status})`, response.status)
  }

  const body: unknown = await response.json()

  // Accept a bare array or common ASP.NET envelope shapes ({ items }, { data }, { $values }).
  if (Array.isArray(body)) return body as Accommodation[]
  if (body && typeof body === "object") {
    const envelope = body as Record<string, unknown>
    const list = envelope.items ?? envelope.data ?? envelope.$values ?? envelope.results
    if (Array.isArray(list)) return list as Accommodation[]
  }
  throw new ApiError("מבנה התשובה מהשרת אינו תקין")
}
