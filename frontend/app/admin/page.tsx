"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { AlertCircle, Heart, Loader2, MapPin, Search, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react"
import { API_BASE_URL } from "@/lib/api"
import { formatPrice } from "@/lib/accommodations"
import { useAuth } from "@/lib/auth-context"
import { SiteHeader } from "@/components/vacation/site-header"

interface AdminItem {
  id: number
  name: string
  propertyType: string
  city: string
  minRoomPriceWithVat: number
  likesCount: number
  rating?: number | null
  reviewsCount: number
}

export default function AdminPage() {
  const { user, token, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null)

  // Frontend route guard: אם המשתמש לא אדמין, מפנה לדף הבית
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "Admin") {
        router.push("/")
      }
    }
  }, [user, authLoading, router])

  const fetcher = async (url: string) => {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) {
      if (res.status === 403 || res.status === 401) {
        throw new Error("גישה נדחתה: אין לך הרשאות מנהל (403 Forbidden)")
      }
      throw new Error("שגיאה בטעינת נתונים")
    }
    return res.json()
  }

  const { data: items, error, isLoading, mutate } = useSWR<AdminItem[]>(
    user?.role === "Admin" && token ? `${API_BASE_URL}/api/accommodations/admin/list` : null,
    fetcher
  )

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את "${name}" (ID: ${id})? פעולה זו אינה ניתנת לביטול.`)) {
      return
    }

    setDeletingId(id)
    setDeleteMessage(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/accommodations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        alert(errData.message || "שגיאה במחיקת מקום האירוח")
      } else {
        setDeleteMessage(`מקום האירוח "${name}" נמחק בהצלחה`)
        mutate(items?.filter((item) => item.id !== id), false)
      }
    } catch {
      alert("שגיאת תקשורת עם השרת")
    } finally {
      setDeletingId(null)
    }
  }

  if (authLoading || (!user && typeof window !== "undefined")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" dir="rtl">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (user?.role !== "Admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center" dir="rtl">
        <ShieldAlert className="size-16 text-destructive" />
        <h1 className="font-heading text-2xl font-bold">403 Forbidden - גישה חסומה</h1>
        <p className="text-sm text-muted-foreground">עמוד זה מיועד למנהלי מערכת בלבד. מועבר לדף הבית...</p>
      </div>
    )
  }

  const filteredItems = (items || []).filter((item) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      item.name.toLowerCase().includes(term) ||
      item.city.toLowerCase().includes(term) ||
      item.propertyType.toLowerCase().includes(term)
    )
  })

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SiteHeader favoritesCount={0} />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 font-heading text-3xl font-bold tracking-tight text-foreground">
              <ShieldCheck className="size-7 text-primary" />
              לוח ניהול מערכת (Admin Dashboard)
            </h1>
            <p className="text-sm text-muted-foreground">
              ניהול כלל החופשות במערכת, מעקב אחר מספר הלייקים שקיבל כל נכס, ומחיקת מקומות אירוח
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-primary/10 px-3.5 py-1.5 text-sm font-semibold text-primary">
              מחובר כמנהל: {user.email}
            </span>
          </div>
        </div>

        {deleteMessage && (
          <div className="mb-4 flex items-center justify-between rounded-xl bg-emerald-500/10 p-4 text-sm font-medium text-emerald-600">
            <span>{deleteMessage}</span>
            <button type="button" onClick={() => setDeleteMessage(null)} className="text-xs underline">
              סגור
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="size-5 shrink-0" />
            <span>{error.message}</span>
          </div>
        )}

        {/* שורת חיפוש וסטטיסטיקה */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חיפוש לפי שם נכס, עיר או סוג..."
              className="h-11 w-full rounded-xl border bg-card ps-9 pe-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-2"
            />
          </div>

          <div className="text-sm text-muted-foreground">
            סה&quot;כ נכסים: <strong className="text-foreground">{items?.length ?? 0}</strong> | מוצגים:{" "}
            <strong className="text-foreground">{filteredItems.length}</strong>
          </div>
        </div>

        {/* טבלת ניהול */}
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="border-b bg-muted/50 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5 text-start">ID</th>
                  <th className="px-4 py-3.5 text-start">שם הנכס</th>
                  <th className="px-4 py-3.5 text-start">סוג</th>
                  <th className="px-4 py-3.5 text-start">עיר</th>
                  <th className="px-4 py-3.5 text-start">מחיר ללילה</th>
                  <th className="px-4 py-3.5 text-start">
                    <span className="flex items-center gap-1">
                      <Heart className="size-3.5 fill-destructive text-destructive" />
                      מספר לייקים
                    </span>
                  </th>
                  <th className="px-4 py-3.5 text-start">דירוג</th>
                  <th className="px-4 py-3.5 text-center">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="size-6 animate-spin text-primary" />
                        <span>טוען את נתוני הניהול...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      לא נמצאו מקומות אירוח התואמים לחיפוש
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">#{item.id}</td>
                      <td className="px-4 py-3.5 font-semibold text-foreground">{item.name}</td>
                      <td className="px-4 py-3.5">
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                          {item.propertyType}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5 shrink-0" />
                          {item.city}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium tabular-nums">
                        ₪{formatPrice(item.minRoomPriceWithVat)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-600 tabular-nums">
                          <Heart className="size-3 fill-rose-600 text-rose-600" />
                          {item.likesCount ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 tabular-nums text-muted-foreground">
                        {item.rating ? item.rating.toFixed(1) : "חדש"} ({item.reviewsCount})
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          disabled={deletingId === item.id}
                          onClick={() => handleDelete(item.id, item.name)}
                          className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                          <span>מחק</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
