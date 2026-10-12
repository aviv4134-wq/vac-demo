"use client"

import { Heart, MapPin } from "lucide-react"
import { formatPrice } from "@/lib/accommodations"
import type { Accommodation } from "@/lib/types"
import { RatingBadge } from "./rating-badge"

const HIGHLIGHT_AMENITIES = ["בריכה", "ג'קוזי", "חוף פרטי", "חניה חינם", "ספא"]

interface AccommodationCardProps {
  accommodation: Accommodation
  isFavorite: boolean
  nights?: number
  onToggleFavorite: (id: number) => void
  onOpen: (accommodation: Accommodation) => void
}

export function AccommodationCard({
  accommodation,
  isFavorite,
  nights = 1,
  onToggleFavorite,
  onOpen,
}: AccommodationCardProps) {
  const amenities = accommodation.amenities ?? []
  const highlights = amenities.filter((a) => HIGHLIGHT_AMENITIES.includes(a)).slice(0, 3)
  const mainImage = (accommodation.images && accommodation.images.length > 0)
    ? accommodation.images[0]
    : "/placeholder.svg"

  const pricePerNight = accommodation.minRoomPriceWithVat
  const totalPrice = pricePerNight * nights

  return (
    <article className="group flex w-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden">
        <button
          type="button"
          onClick={() => onOpen(accommodation)}
          className="block size-full"
          aria-label={`צפה בתמונות של ${accommodation.name}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mainImage}
            alt={`${accommodation.name} ב${accommodation.city}`}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        </button>
        <span className="pointer-events-none absolute start-3 top-3 rounded-full bg-card/95 px-3 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
          {accommodation.type}
        </span>
        <button
          type="button"
          onClick={() => onToggleFavorite(accommodation.id)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "הסר מהמועדפים" : "הוסף למועדפים"}
          className="absolute end-3 top-3 flex size-9 items-center justify-center rounded-full bg-card/95 shadow-sm backdrop-blur transition-transform hover:scale-110 active:scale-95"
        >
          <Heart
            className={`size-4.5 transition-colors ${
              isFavorite ? "fill-destructive text-destructive" : "text-foreground"
            }`}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="truncate font-heading text-lg font-semibold leading-tight">
              <button
                type="button"
                onClick={() => onOpen(accommodation)}
                className="text-start hover:text-primary"
              >
                {accommodation.name}
              </button>
            </h3>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{accommodation.address}</span>
            </p>
          </div>
          <RatingBadge rating={accommodation.rating} reviewsCount={accommodation.reviewsCount} compact />
        </div>

        {highlights.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="שירותים בולטים">
            {highlights.map((amenity) => (
              <li
                key={amenity}
                className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                {amenity}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 border-t pt-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">החל מ-</span>
            <p className="flex items-baseline gap-1">
              <span className="font-heading text-xl font-bold tabular-nums">
                ₪{formatPrice(pricePerNight)}
              </span>
              <span className="text-sm text-muted-foreground">/ לילה</span>
            </p>
            {nights > 1 ? (
              <span className="text-xs text-muted-foreground">
                סה&quot;כ ₪{formatPrice(totalPrice)} ל-{nights} לילות · כולל מע״מ
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">כולל מע״מ</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onOpen(accommodation)}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            צפה בפרטים
          </button>
        </div>
      </div>
    </article>
  )
}
