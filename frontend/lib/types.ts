export interface AccommodationRoom {
  id: number
  accommodationId: number
  roomType: string
  bedType: string
  capacity: number
  basePrice: number
  priceWithVat: number
  isAvailable: boolean
  features: string[]
}

export interface Accommodation {
  id: number
  name: string
  type: string
  description: string
  city: string
  address: string
  latitude: number
  longitude: number
  rating?: number | null
  reviewsCount: number
  stars?: number
  basePrice: number
  priceWithVat: number
  currency: string
  hasBreakfast: boolean
  amenities: string[]
  images: string[]
  rooms: AccommodationRoom[]
  maxCapacity: number
  minRoomPriceWithVat: number
  bookingUrl: string
  likesCount?: number
}

export interface User {
  id: number
  email: string
  name: string
  role: "User" | "Admin"
}

export type SortOption = "random" | "price-asc" | "price-desc" | "rating"

export interface SearchFilters {
  query: string
  city: string
  types: string[]
  priceRange: [number, number]
  guests: number
  nights: number
  pool: boolean
  jacuzzi: boolean
  parking: boolean
  minRating: number
}
