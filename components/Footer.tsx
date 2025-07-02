import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">Topline</h3>
            <p className="text-gray-400 leading-relaxed mb-4">
              Daily sales intelligence for enterprise professionals in marketing, media, and technology. 
              Sharp insights, strategic interpretation, ready for customer conversations.
            </p>
            <p className="text-sm text-gray-500">© 2024 Zeta Global. All rights reserved.</p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  Today's Topline
                </a>
              </li>
              <li>
                <a href="/archive" className="hover:text-white transition-colors">
                  Archive
                </a>
              </li>
              <li>
                <a href="/newsletter" className="hover:text-white transition-colors">
                  Newsletter
                </a>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            Powered by <span className="text-primary-400 font-semibold">Zeta Global</span>
          </p>
        </div>
      </div>
    </footer>
  )
} 