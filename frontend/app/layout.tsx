import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Heebo, Rubik } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { AuthModal } from '@/components/vacation/auth-modal'

const heebo = Heebo({ subsets: ['hebrew', 'latin'], variable: '--font-heebo' })
const rubik = Rubik({ subsets: ['hebrew', 'latin'], variable: '--font-rubik' })

export const metadata: Metadata = {
  title: 'חופשה | חיפוש חופשות ומקומות אירוח בישראל',
  description:
    'מצאו מלונות, וילות, צימרים ודירות אירוח בכל רחבי ישראל. סננו לפי עיר, מחיר, מספר אורחים ושירותים והזמינו בקלות.',
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/icon.svg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f6f8f9',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${rubik.variable} bg-background`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
