// DEPLOYMENT TIMESTAMP: 2024-12-08 - Force rebuild with API routes
import { Suspense } from 'react'
import { Metadata } from 'next'
import DailyContent from '@/components/DailyContent'
import LoadingSpinner from '@/components/LoadingSpinner'
import NewsletterSignup from '@/components/NewsletterSignup'

export const metadata: Metadata = {
  title: "Today's Topline",
  description: 'Daily sales intelligence and market insights for enterprise sales professionals',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Main Content */}
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Stay ahead with
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {' '}sales intelligence
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Curated daily insights, metrics, and industry developments to power your sales conversations
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">15+</div>
                  <div className="text-sm text-gray-600">Premium Sources</div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-600">Daily</div>
                  <div className="text-sm text-gray-600">Fresh Content</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">AI-Powered</div>
                  <div className="text-sm text-gray-600">Insights</div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Newsletter Signup */}
            <div>
              <NewsletterSignup />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Today's Intelligence</h2>
          <p className="text-lg text-gray-600">
            Fresh insights and metrics to fuel your sales conversations
          </p>
        </div>
        
        <Suspense fallback={<LoadingSpinner />}>
          <DailyContent />
        </Suspense>

        {/* Use Cases Section */}
        <section className="mt-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
            How Sales Professionals Use Topline
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card">
              <div className="text-primary-600 text-lg font-semibold mb-2">Account Executives</div>
              <p className="text-gray-600">Pre-call prep & insight-driven outreach</p>
            </div>
            <div className="card">
              <div className="text-primary-600 text-lg font-semibold mb-2">Sales Managers</div>
              <p className="text-gray-600">Daily team huddle material</p>
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
      </div>
    </div>
  )
} 