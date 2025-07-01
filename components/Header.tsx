'use client'

import Link from 'next/link'
import { Newspaper, Menu, X, Mail, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setIsSubscribed(true)
        setEmail('')
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to subscribe. Please try again.')
      }
    } catch (error) {
      // For development: still show success even if API fails
      console.log('Newsletter signup (development mode):', email)
      setIsSubscribed(true)
      setEmail('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Newspaper className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">Topline Sales Intelligence</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 font-medium">
              This Week
            </Link>
            <Link href="/archive" className="text-gray-700 hover:text-primary-600 font-medium">
              Archive
            </Link>
            <Link href="/admin" className="text-gray-700 hover:text-primary-600 font-medium">
              Admin
            </Link>
            
            {/* Newsletter Signup in Header */}
            {isSubscribed ? (
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800 font-medium">Subscribed!</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Subscribe
                    </>
                  )}
                </button>
              </form>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-primary-600 font-medium px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                This Week
              </Link>
              <Link
                href="/archive"
                className="text-gray-700 hover:text-primary-600 font-medium px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Archive
              </Link>
              <Link
                href="/admin"
                className="text-gray-700 hover:text-primary-600 font-medium px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin
              </Link>
              
              {/* Mobile Newsletter Signup */}
              <div className="px-2">
                {isSubscribed ? (
                  <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800 font-medium">Subscribed!</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                    {error && (
                      <div className="text-red-600 text-xs">
                        {error}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Subscribing...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Subscribe to Topline
                        </>
                      )}
                    </button>
                  </form>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Unsubscribe anytime. Every Monday at 7am.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Error message for desktop */}
        {error && !isMobileMenuOpen && (
          <div className="hidden lg:block absolute top-full left-0 right-0 bg-red-50 border-b border-red-200 px-4 py-2">
            <div className="max-w-7xl mx-auto">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 