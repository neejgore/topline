// DEPLOYMENT TIMESTAMP: 2024-12-08 - Force rebuild with API routes
import { Suspense } from 'react'
import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WeeklyContentWithFilter from '@/components/WeeklyContentWithFilter'
import LoadingSpinner from '@/components/LoadingSpinner'

export const metadata: Metadata = {
  title: 'Today\'s Topline',
  description: 'Daily sales intelligence and market insights for enterprise sales professionals',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Hero Section */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Today's <span className="text-primary-600">Topline</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Daily curated sales intelligence for enterprise professionals in media, CRM, marketing intelligence, and CDP solutions. 
            Fresh insights from the last 24 hours, ready for your customer conversations.
          </p>
        </div>

        {/* Weekly Content */}
        <Suspense fallback={<LoadingSpinner />}>
          <WeeklyContentWithFilter />
        </Suspense>

        {/* Use Cases Section */}
        <section className="mt-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">How Sales Professionals Use Topline</h2>
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