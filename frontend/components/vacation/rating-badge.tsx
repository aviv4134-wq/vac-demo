import { Sparkles, Star } from "lucide-react"
import { formatPrice } from "@/lib/accommodations"

function ratingLabel(rating: number) {
  if (rating >= 9) return "מצוין"
  if (rating >= 8) return "טוב מאוד"
  if (rating >= 7) return "טוב"
  return "סביר"
}

function hasRating(rating: number | null | undefined): rating is number {
  return typeof rating === "number" && Number.isFinite(rating) && rating > 0
}

export function RatingBadge({
  rating,
  reviewsCount,
  compact = false,
}: {
  rating?: number | null
  reviewsCount?: number | null
  compact?: boolean
}) {
  const reviews = reviewsCount ?? 0

  if (!hasRating(rating)) {
    return (
      <span className="flex shrink-0 items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-sm font-semibold text-secondary-foreground">
        <Sparkles className="size-3.5" aria-hidden="true" />
        חדש
      </span>
    )
  }

  // הגנה מלאה מפני null/undefined לפני הפעלת toFixed()
  const formattedRating = rating ? rating.toFixed(1) : "חדש"

  if (compact) {
    return (
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="flex items-center gap-1 rounded-lg bg-primary px-2 py-1 text-sm font-bold text-primary-foreground tabular-nums">
          <Star className="size-3.5 fill-accent text-accent" aria-hidden="true" />
          {formattedRating}
        </span>
        <span className="text-xs text-muted-foreground">({formatPrice(reviews)} ביקורות)</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-sm font-bold text-primary-foreground tabular-nums">
        <Star className="size-3.5 fill-accent text-accent" aria-hidden="true" />
        {formattedRating}
      </span>
      <span className="text-sm">
        <span className="font-semibold">{ratingLabel(rating)}</span>
        <span className="text-muted-foreground"> · {formatPrice(reviews)} ביקורות</span>
      </span>
    </div>
  )
}
