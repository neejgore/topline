import { Suspense } from 'react'
import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArchiveContent from '@/components/ArchiveContent'
import LoadingSpinner from '@/components/LoadingSpinner'

export const metadata: Metadata = {
  title: 'Archive',
  description: 'Browse past editions of Topline sales intelligence content',
}

export default function ArchivePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Topline Archive
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse past insights, articles, and metrics. Search for specific topics 
            or explore by category to find sales intelligence for your next conversation.
          </p>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <ArchiveContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
} 