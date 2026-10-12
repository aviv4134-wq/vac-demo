"use client"

import { useState } from "react"
import { BedDouble, Check, Coffee, ExternalLink, MapPin, Star, Users, X } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { formatPrice } from "@/lib/accommodations"
import type { Accommodation } from "@/lib/types"
import { RatingBadge } from "./rating-badge"

interface AccommodationDetailsProps {
  accommodation: Accommodation | null
  onClose: () => void
}

export function AccommodationDetails({ accommodation, onClose }: AccommodationDetailsProps) {
  return (
    <Dialog open={accommodation !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[92vh] w-full flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-4xl"
      >
        {accommodation && <DetailsBody key={accommodation.id} accommodation={accommodation} />}
      </DialogContent>
    </Dialog>
  )
}

function DetailsBody({ accommodation }: { accommodation: Accommodation }) {
  const [activeImage, setActiveImage] = useState(0)

  const images = (accommodation.images && accommodation.images.length > 0)
    ? accommodation.images
    : ["/placeholder.svg"]
  const safeActiveIndex = activeImage < images.length ? activeImage : 0
  const amenities = accommodation.amenities ?? []
  const rooms = accommodation.rooms ?? []

  return (
    <div dir="rtl" className="min-h-0 overflow-y-auto">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[safeActiveIndex] || "/placeholder.svg"}
          alt={`${accommodation.name} — תמונה ${safeActiveIndex + 1} מתוך ${images.length}`}
          className="aspect-[16/10] w-full object-cover md:aspect-[2/1]"
        />
        <DialogClose
          aria-label="סגור"
          className="absolute end-3 top-3 flex size-9 items-center justify-center rounded-full bg-card/95 text-foreground shadow-md backdrop-blur transition-transform hover:scale-105"
        >
          <X className="size-4.5" />
        </DialogClose>
        <span className="absolute start-3 top-3 rounded-full bg-card/95 px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
          {accommodation.type}
        </span>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-5 pt-3" role="tablist" aria-label="גלריית תמונות">
          {images.map((src, index) => (
            <button
              key={src + index}
              type="button"
              role="tab"
              aria-selected={index === safeActiveIndex}
              aria-label={`תמונה ${index + 1}`}
              onClick={() => setActiveImage(index)}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 ring-offset-2 ring-offset-popover transition ${
                index === safeActiveIndex ? "ring-primary" : "opacity-70 ring-transparent hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src || "/placeholder.svg"} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-6 p-5 md:p-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <DialogTitle className="font-heading text-2xl font-bold text-balance">
                {accommodation.name}
              </DialogTitle>
              {Boolean(accommodation.stars && accommodation.stars > 0) && (
                <span className="flex items-center" aria-label={`${accommodation.stars} כוכבים`}>
                  {Array.from({ length: accommodation.stars! }, (_, i) => (
                    <Star key={i} className="size-3.5 fill-accent text-accent" aria-hidden="true" />
                  ))}
                </span>
              )}
            </div>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {accommodation.address}
            </p>
          </div>
          <RatingBadge rating={accommodation.rating} reviewsCount={accommodation.reviewsCount} />
        </header>

        <DialogDescription className="text-base leading-relaxed text-foreground/85 text-pretty">
          {accommodation.description}
        </DialogDescription>

        {amenities.length > 0 && (
          <section aria-labelledby="amenities-heading" className="flex flex-col gap-3">
            <h3 id="amenities-heading" className="font-heading text-base font-semibold">
              שירותים ומתקנים
            </h3>
            <ul className="flex flex-wrap gap-2">
              {amenities.map((amenity) => (
                <li
                  key={amenity}
                  className="flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm"
                >
                  {amenity === "כולל ארוחת בוקר" ? (
                    <Coffee className="size-3.5 text-primary" aria-hidden="true" />
                  ) : (
                    <Check className="size-3.5 text-primary" aria-hidden="true" />
                  )}
                  {amenity}
                </li>
              ))}
            </ul>
          </section>
        )}

        {rooms.length > 0 && (
          <section aria-labelledby="rooms-heading" className="flex flex-col gap-3">
            <h3 id="rooms-heading" className="font-heading text-base font-semibold">
              חדרים זמינים ({rooms.filter((r) => r.isAvailable).length}/{rooms.length})
            </h3>
            <ul className="flex flex-col gap-3">
              {rooms.map((room) => (
                <li
                  key={room.id}
                  className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                    room.isAvailable ? "bg-card" : "bg-muted/60 opacity-70"
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{room.roomType}</span>
                      {!room.isAvailable && (
                        <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                          לא זמין
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <BedDouble className="size-4" aria-hidden="true" />
                        {room.bedType}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="size-4" aria-hidden="true" />
                        עד {room.capacity} אורחים
                      </span>
                    </div>
                    {(room.features && room.features.length > 0) && (
                      <ul className="flex flex-wrap gap-1.5">
                        {room.features.map((feature) => (
                          <li key={feature} className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-start sm:items-end">
                    <span className="font-heading text-xl font-bold tabular-nums">₪{formatPrice(room.priceWithVat)}</span>
                    <span className="text-xs text-muted-foreground">
                      ללילה · לפני מע״מ ₪{formatPrice(room.basePrice)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <footer className="sticky bottom-0 flex items-center justify-between gap-4 border-t bg-popover/95 px-5 py-4 backdrop-blur md:px-6">
        <p className="flex flex-col">
          <span className="text-xs text-muted-foreground">החל מ-</span>
          <span className="font-heading text-xl font-bold tabular-nums">
            ₪{formatPrice(accommodation.minRoomPriceWithVat)}
            <span className="text-sm font-normal text-muted-foreground"> / לילה</span>
          </span>
        </p>
        {accommodation.bookingUrl ? (
          <a
            href={accommodation.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            להזמנה ב-Booking
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        ) : (
          <span className="text-sm text-muted-foreground">פרטים נוספים בדלפק</span>
        )}
      </footer>
    </div>
  )
}
