'use client'

import Link from 'next/link'
import { Mail, Newspaper } from 'lucide-react'
import NewsletterSignup from './NewsletterSignup'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Newspaper className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">Topline Intelligence</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 font-medium">
              Today
            </Link>
            <Link href="/archive" className="text-gray-700 hover:text-primary-600 font-medium">
              Archive
            </Link>
            <Link href="/admin" className="text-gray-700 hover:text-primary-600 font-medium">
              Admin
            </Link>
            <NewsletterSignup />
          </nav>

          {/* Mobile menu button */}
          <button className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
            <span className="sr-only">Open menu</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
} 