import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Flex Living</h1>
          <h2 className="text-2xl text-gray-600 mb-8">Reviews Dashboard</h2>
          
          <p className="text-gray-600 mb-12">
            Manage guest reviews and approve them for public display on property pages.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
            
            <Link
              href="/properties/PROP-000"
              className="bg-gray-100 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              View Property PROP-000
            </Link>
            
            <Link
              href="/properties/PROP-001"
              className="bg-gray-100 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              View Property PROP-001
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Quick Links</p>
            <div className="flex gap-4 justify-center text-sm">
              <a href="/api/reviews/hostaway" className="text-blue-600 hover:underline">
                API Endpoint
              </a>
              <span className="text-gray-300">•</span>
              <a
                href="https://github.com"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
