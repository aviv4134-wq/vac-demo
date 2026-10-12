"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart, LogIn, LogOut, ShieldCheck, Umbrella, User as UserIcon } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function SiteHeader({ favoritesCount }: { favoritesCount: number }) {
  const { user, openAuthModal, logout } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="חופשה — דף הבית">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Umbrella className="size-5" aria-hidden="true" />
          </span>
          <span className="font-heading text-xl font-bold tracking-tight">חופשה</span>
        </Link>

        <nav aria-label="ניווט ראשי" className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/" className="transition hover:text-foreground">
            מקומות אירוח
          </Link>
          <Link href="/favorites" className="transition hover:text-foreground">
            המועדפים שלי
          </Link>
          {mounted && user?.role === "Admin" && (
            <Link
              href="/admin"
              className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-primary transition hover:bg-primary/20"
            >
              <ShieldCheck className="size-4" />
              ניהול מערכת (Admin)
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/favorites"
            className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition hover:border-primary/50"
          >
            <Heart className="size-4 fill-destructive text-destructive" aria-hidden="true" />
            <span className="tabular-nums">{mounted ? favoritesCount : 0}</span>
            <span className="sr-only">מועדפים</span>
            <span className="hidden sm:inline" aria-hidden="true">
              מועדפים
            </span>
          </Link>

          {mounted && user ? (
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1 text-sm font-medium text-foreground sm:flex">
                <UserIcon className="size-4 text-muted-foreground" />
                {user.name}
              </span>
              <button
                type="button"
                onClick={logout}
                title="התנתק"
                className="flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-sm text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">התנתק</span>
              </button>
            </div>
          ) : mounted ? (
            <button
              type="button"
              onClick={openAuthModal}
              className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              <LogIn className="size-4" />
              <span>התחברות</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
