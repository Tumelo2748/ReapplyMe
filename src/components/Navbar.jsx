import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { FiMenu, FiX } from 'react-icons/fi'

export default function Navbar({ session }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const isActivePath = (path) => {
    return location.pathname === path ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
  }

  const navLinks = session ? [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/job-search', label: 'Job Search' },
    { path: '/applications', label: 'Applications' },
    { path: '/email-template', label: 'Email Templates' },
    { path: '/progress', label: 'Progress' }
  ] : [
    { path: '/', label: 'Home' }
  ]

  return (
    <nav className="w-full bg-white border-b border-gray-100 fixed top-0 z-50">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 xl:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center flex-1">
            <Link to="/" className="flex items-center flex-shrink-0">
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 bg-clip-text text-transparent whitespace-nowrap">
                ReapplyMe
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden xl:ml-10 xl:flex xl:space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${isActivePath(link.path)}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Tablet Navigation */}
            <div className="hidden md:flex xl:hidden ml-6 space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-2 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap ${isActivePath(link.path)}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side - Auth Buttons and Mobile Menu Button */}
          <div className="flex items-center space-x-4 ml-4">
            {/* Auth Button */}
            <div className="hidden md:block">
              {session ? (
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-3 py-1.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all font-medium whitespace-nowrap text-sm"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-500/50 transition-all font-medium shadow-lg shadow-primary-500/30 whitespace-nowrap text-sm"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500/20 transition-colors"
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? (
                <FiX className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FiMenu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isOpen
              ? 'max-h-screen opacity-100 visible'
              : 'max-h-0 opacity-0 invisible'
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-lg transition-colors ${isActivePath(link.path)}`}
              >
                {link.label}
              </Link>
            ))}
            {/* Mobile Auth Button */}
            <div className="pt-4 md:hidden">
              {session ? (
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
