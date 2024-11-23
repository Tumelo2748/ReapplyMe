import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Navbar({ session }) {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav className="w-full bg-white border-b border-gray-100">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 bg-clip-text text-transparent">
                ReapplyMe
              </span>
            </Link>
            
            <div className="hidden sm:ml-10 sm:flex sm:space-x-4">
              <Link
                to="/"
                className="px-3 py-2 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50"
              >
                Home
              </Link>
              {session && (
                <>
                  <Link
                    to="/dashboard"
                    className="px-3 py-2 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/job-search"
                    className="px-3 py-2 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50"
                  >
                    Job Search
                  </Link>
                  <Link
                    to="/applications"
                    className="px-3 py-2 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50"
                  >
                    Applications
                  </Link>
                  <Link
                    to="/email-template"
                    className="px-3 py-2 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50"
                  >
                    Email Templates
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center">
            {session ? (
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all font-medium"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-500/50 transition-all font-medium shadow-lg shadow-primary-500/30"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
