// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Products CMS | Admin Dashboard',
    template: '%s | Products CMS'
  },
  description: 'Powerful admin dashboard for managing products, users, and business operations. Built with Next.js, MongoDB, and modern authentication.',
  keywords: ['admin', 'dashboard', 'cms', 'products', 'management', 'nextjs'],
  authors: [{ name: 'Products CMS Team' }],
  creator: 'Products CMS',
  publisher: 'Products CMS',
  robots: {
    index: false, // Since this is an admin dashboard
    follow: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="en" 
      className="dark" 
      suppressHydrationWarning
    >
      <body 
        className={cn(
          inter.className,
          "min-h-screen bg-background font-sans antialiased",
          "scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700"
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}