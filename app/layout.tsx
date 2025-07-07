import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'BellDesk AI - Sales Intelligence Platform',
  description: 'Stay ahead with AI-powered sales intelligence and industry insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col min-h-full bg-gray-50`}>
        <Header />
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
} 