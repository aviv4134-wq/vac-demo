"use client"

import { useId, type FormEvent, type ReactNode } from "react"
import { Loader2, Minus, ParkingCircle, Plus, RotateCcw, Search, Sparkles, Star, Waves } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { CITIES, PRICE_MAX, PRICE_MIN, PROPERTY_TYPES, formatPrice } from "@/lib/accommodations"
import type { SearchFilters } from "@/lib/types"

const RATING_OPTIONS = [
  { value: 0, label: "הכל" },
  { value: 7, label: "7+" },
  { value: 8, label: "8+" },
  { value: 9, label: "9+" },
]

const MAX_GUESTS = 12

const PROPERTY_TYPE_DB_MAPPING: Record<string, string> = {
  "מלון": "מלון",
  "וילה": "וילה",
  "דירת אירוח": "דירת אירוח",
  "אתר נופש": "אתר נופש",
  "צימר": "בית הארחה / צימר",
}

interface FiltersSidebarProps {
  draft: SearchFilters
  onChange: (next: SearchFilters) => void
  onSubmit: () => void
  onReset: () => void
  isSearching?: boolean
}

export function FiltersSidebar({ draft, onChange, onSubmit, onReset, isSearching = false }: FiltersSidebarProps) {
  const update = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) =>
    onChange({ ...draft, [key]: value })

  const toggleType = (type: string, checked: boolean) =>
    update("types", checked ? [...draft.types, type] : draft.types.filter((t) => t !== type))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit()
  }

  const [minPrice, maxPrice] = draft.priceRange

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="סינון תוצאות"
      className="flex flex-col gap-6 rounded-2xl border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold">סינון חיפוש</h2>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          איפוס
        </button>
      </div>

      <Field label="חיפוש חופשי" htmlFor="search-query">
        <div className="relative">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="search-query"
            type="search"
            value={draft.query}
            onChange={(e) => update("query", e.target.value)}
            placeholder="שם, עיר או מילת מפתח"
            className="h-11 w-full rounded-xl border bg-background ps-9 pe-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25"
          />
        </div>
      </Field>

      <Field label="עיר / אזור" htmlFor="search-city">
        <select
          id="search-city"
          value={draft.city}
          onChange={(e) => update("city", e.target.value)}
          className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25"
        >
          <option value="all">כל הארץ</option>
          {CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </Field>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-medium">סוג נכס</legend>
        <div className="grid grid-cols-2 gap-x-3 gap-y-3">
          {PROPERTY_TYPES.map((type) => {
            const dbValue = PROPERTY_TYPE_DB_MAPPING[type] ?? type
            return (
              <label key={type} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={draft.types.includes(dbValue)}
                  onCheckedChange={(checked) => toggleType(dbValue, checked === true)}
                />
                {type}
              </label>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 flex w-full items-baseline justify-between text-sm font-medium">
          <span>מחיר ללילה (כולל מע״מ)</span>
        </legend>
        <Slider
          value={draft.priceRange}
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={50}
          onValueChange={(value) => {
            if (Array.isArray(value)) update("priceRange", [value[0], value[1]])
          }}
          aria-label="טווח מחירים"
        />
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="rounded-lg bg-muted px-2.5 py-1 tabular-nums">₪{formatPrice(minPrice)}</span>
          <span className="text-muted-foreground" aria-hidden="true">
            —
          </span>
          <span className="rounded-lg bg-muted px-2.5 py-1 tabular-nums">
            ₪{formatPrice(maxPrice)}
            {maxPrice >= PRICE_MAX ? "+" : ""}
          </span>
        </div>
      </fieldset>

      <div className="flex items-center justify-between">
        <span id="guests-label" className="text-sm font-medium">
          מספר אורחים
        </span>
        <div className="flex items-center gap-3" role="group" aria-labelledby="guests-label">
          <CounterButton
            label="הפחת אורח"
            disabled={draft.guests <= 1}
            onClick={() => update("guests", draft.guests - 1)}
          >
            <Minus className="size-4" />
          </CounterButton>
          <span className="w-6 text-center font-heading text-base font-semibold tabular-nums" aria-live="polite">
            {draft.guests}
          </span>
          <CounterButton
            label="הוסף אורח"
            disabled={draft.guests >= MAX_GUESTS}
            onClick={() => update("guests", draft.guests + 1)}
          >
            <Plus className="size-4" />
          </CounterButton>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span id="nights-label" className="text-sm font-medium">
          מספר לילות
        </span>
        <div className="flex items-center gap-3" role="group" aria-labelledby="nights-label">
          <CounterButton
            label="הפחת לילה"
            disabled={draft.nights <= 1}
            onClick={() => update("nights", draft.nights - 1)}
          >
            <Minus className="size-4" />
          </CounterButton>
          <span className="w-6 text-center font-heading text-base font-semibold tabular-nums" aria-live="polite">
            {draft.nights}
          </span>
          <CounterButton
            label="הוסף לילה"
            disabled={draft.nights >= 14}
            onClick={() => update("nights", draft.nights + 1)}
          >
            <Plus className="size-4" />
          </CounterButton>
        </div>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-medium">שירותים</legend>
        <ToggleRow
          icon={<Waves className="size-4" />}
          label="בריכה"
          checked={draft.pool}
          onChange={(v) => update("pool", v)}
        />
        <ToggleRow
          icon={<Sparkles className="size-4" />}
          label="ג'קוזי"
          checked={draft.jacuzzi}
          onChange={(v) => update("jacuzzi", v)}
        />
        <ToggleRow
          icon={<ParkingCircle className="size-4" />}
          label="חניה חינם"
          checked={draft.parking}
          onChange={(v) => update("parking", v)}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-medium">דירוג אורחים מינימלי</legend>
        <div className="grid grid-cols-4 gap-2">
          {RATING_OPTIONS.map((option) => {
            const active = draft.minRating === option.value
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => update("minRating", option.value)}
                className={`flex h-9 items-center justify-center gap-1 rounded-lg border text-sm font-medium transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background hover:border-primary/50"
                }`}
              >
                {option.value > 0 && <Star className="size-3.5 fill-current" aria-hidden="true" />}
                {option.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <Button
        type="submit"
        size="lg"
        disabled={isSearching}
        aria-busy={isSearching}
        className="h-12 rounded-xl text-base font-semibold"
      >
        {isSearching ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Search className="size-4" aria-hidden="true" />
        )}
        {isSearching ? "מחפש..." : "חפש חופשה"}
      </Button>
    </form>
  )
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  )
}

function CounterButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-full border bg-background transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function ToggleRow({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: ReactNode
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  const labelId = useId()
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span
        id={labelId}
        onClick={() => onChange(!checked)}
        className="flex flex-1 cursor-pointer select-none items-center gap-2 text-foreground"
      >
        <span className="text-muted-foreground" aria-hidden="true">
          {icon}
        </span>
        {label}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} aria-labelledby={labelId} dir="ltr" />
    </div>
  )
}
