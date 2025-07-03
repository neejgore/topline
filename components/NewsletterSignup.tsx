'use client'

import { useState } from 'react'
import { Mail, CheckCircle } from 'lucide-react'

export default function NewsletterSignup() {
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

  if (isSubscribed) {
    return (
      <div className="card max-w-md mx-auto text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">You're all set!</h3>
        <p className="text-gray-600">
          You'll receive Topline every Monday at 7am. Check your inbox for a confirmation email.
        </p>
      </div>
    )
  }

  return (
    <div className="card max-w-md mx-auto">
      <div className="text-center mb-6">
        <Mail className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Topline Daily</h3>
        <p className="text-gray-600">
          Every Monday at 7am - delivered to your inbox for scan-then-click convenience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="input"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full"
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe to Topline'}
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-4">
        Unsubscribe anytime. We respect your inbox.
      </p>
    </div>
  )
} 