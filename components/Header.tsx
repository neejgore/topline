'use client'

import Link from 'next/link'
import { Newspaper, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Newspaper className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">Topline</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 font-medium">
              This Week
            </Link>
            <Link href="/archive" className="text-gray-700 hover:text-primary-600 font-medium">
              Archive
            </Link>
            <Link href="/admin" className="text-gray-700 hover:text-primary-600 font-medium">
              Admin
            </Link>
            <button className="btn btn-primary">
              Subscribe
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
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
          <div className="md:hidden py-4 border-t border-gray-200">
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
              <button className="btn btn-primary w-full">
                Subscribe
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 