import { Suspense } from 'react'
import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WeeklyContent from '@/components/WeeklyContent'
import NewsletterSignup from '@/components/NewsletterSignup'
import LoadingSpinner from '@/components/LoadingSpinner'

export const metadata: Metadata = {
  title: 'This Week\'s Topline',
  description: 'The latest sales intelligence and market insights for enterprise sales professionals',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            This Week's <span className="text-primary-600">Topline</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Curated sales intelligence for enterprise professionals in marketing, media, and technology. 
            Sharp insights, strategic interpretation, ready for customer conversations.
          </p>
        </div>

        {/* Newsletter Signup */}
        <div className="mb-12">
          <NewsletterSignup />
        </div>

        {/* Weekly Content */}
        <Suspense fallback={<LoadingSpinner />}>
          <WeeklyContent />
        </Suspense>

        {/* Use Cases Section */}
        <section className="mt-16 mb-12">
          <h2 className="section-title text-center">How Sales Professionals Use Topline</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card">
              <div className="text-primary-600 text-lg font-semibold mb-2">Account Executives</div>
              <p className="text-gray-600">Pre-call prep & insight-driven outreach</p>
            </div>
            <div className="card">
              <div className="text-primary-600 text-lg font-semibold mb-2">Sales Managers</div>
              <p className="text-gray-600">Weekly team huddle material</p>
            </div>
            <div className="card">
              <div className="text-primary-600 text-lg font-semibold mb-2">Sales Enablement</div>
              <p className="text-gray-600">Add to onboarding or pitch library</p>
            </div>
            <div className="card">
              <div className="text-primary-600 text-lg font-semibold mb-2">CMO/VP Sales</div>
              <p className="text-gray-600">Forecast where buyers are headed</p>
            </div>
            <div className="card">
              <div className="text-primary-600 text-lg font-semibold mb-2">RevOps</div>
              <p className="text-gray-600">Align messaging with market realities</p>
            </div>
            <div className="card">
              <div className="text-primary-600 text-lg font-semibold mb-2">Executive Briefings</div>
              <p className="text-gray-600">Strategic context for leadership decisions</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
} 