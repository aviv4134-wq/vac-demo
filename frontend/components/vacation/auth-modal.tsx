"use client"

import React, { useState } from "react"
import { AlertCircle, Loader2, Lock, Mail, User as UserIcon, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth()
  const [tab, setTab] = useState<"login" | "register">("login")

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isAuthModalOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    if (tab === "login") {
      const res = await login(email, password)
      if (!res.success) {
        setError(res.error || "התחברות נכשלה")
      }
    } else {
      if (!name.trim()) {
        setError("נא להזין שם מלא")
        setIsSubmitting(false)
        return
      }
      const res = await register(name, email, password)
      if (!res.success) {
        setError(res.error || "הרשמה נכשלה")
      }
    }
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        dir="rtl"
      >
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute start-4 top-4 rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="סגור"
        >
          <X className="size-5" />
        </button>

        <div className="mb-6 text-center">
          <h2 className="font-heading text-2xl font-bold">
            {tab === "login" ? "התחברות לחשבון" : "יצירת חשבון חדש"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === "login"
              ? "הזן אימייל וסיסמה כדי לגשת למועדפים שלך"
              : "הירשם בקלות כדי לנהל את החופשות המועדפות שלך"}
          </p>
        </div>

        {/* טאבים: התחברות / הרשמה */}
        <div className="mb-6 flex rounded-xl bg-muted p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab("login")
              setError(null)
            }}
            className={`flex-1 rounded-lg py-2 transition ${
              tab === "login"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            התחברות (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register")
              setError(null)
            }}
            className={`flex-1 rounded-lg py-2 transition ${
              tab === "register"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            הרשמה (Sign Up)
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {tab === "register" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="auth-name">
                שם מלא
              </label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="auth-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ישראל ישראלי"
                  className="h-11 w-full rounded-xl border bg-background ps-9 pe-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="auth-email">
              כתובת אימייל
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="h-11 w-full rounded-xl border bg-background ps-9 pe-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="auth-password">
              סיסמה
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="לפחות 6 תווים"
                className="h-11 w-full rounded-xl border bg-background ps-9 pe-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : tab === "login" ? (
              "התחבר"
            ) : (
              "צור חשבון"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
