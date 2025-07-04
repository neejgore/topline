import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
              Topline
            </h3>
            <p className="text-gray-300 mb-4 max-w-md">
              Curated daily sales intelligence for enterprise professionals. 
              Stay ahead with insights that matter.
            </p>
            <div className="flex space-x-4">
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-400">15+</div>
                <div className="text-xs text-gray-400">Sources</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-indigo-400">Daily</div>
                <div className="text-xs text-gray-400">Updates</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-purple-400">AI</div>
                <div className="text-xs text-gray-400">Powered</div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white transition-colors">
                  Topline for {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </a>
              </li>
              <li>
                <a href="/archive" className="text-gray-300 hover:text-white transition-colors">
                  Archive
                </a>
              </li>
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Industries</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-300">Technology & Media</li>
              <li className="text-gray-300">Consumer & Retail</li>
              <li className="text-gray-300">Financial Services</li>
              <li className="text-gray-300">Healthcare</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © 2024 Topline by Zeta Global. All rights reserved.
          </div>
          <div className="text-gray-400 text-sm mt-4 md:mt-0">
            Built for enterprise sales professionals
          </div>
        </div>
      </div>
    </footer>
  )
} 