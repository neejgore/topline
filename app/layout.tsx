import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Topline - Sales Intelligence Platform',
    template: '%s | Topline'
  },
  description: 'Curated weekly sales intelligence for enterprise sales professionals in marketing, media, and technology.',
  keywords: ['sales intelligence', 'martech', 'adtech', 'sales enablement', 'newsletter', 'enterprise sales'],
  authors: [{ name: 'Topline Team' }],
  creator: 'Zeta Global',
  publisher: 'Zeta Global',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://topline.zetaglobal.com',
    title: 'Topline - Sales Intelligence Platform',
    description: 'Curated weekly sales intelligence for enterprise sales professionals',
    siteName: 'Topline',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Topline - Sales Intelligence Platform',
    description: 'Curated weekly sales intelligence for enterprise sales professionals',
    creator: '@zetaglobal',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <div className="min-h-full">
          {children}
        </div>
      </body>
    </html>
  )
} 