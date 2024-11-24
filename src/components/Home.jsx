import { Link } from 'react-router-dom'
import { FiSearch, FiTrendingUp, FiAward, FiBookOpen, FiShare2, FiMail } from 'react-icons/fi'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold">
            <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 bg-clip-text text-transparent">
              Your AI-Powered
            </span>
            <br />
            <span className="text-gray-900">Job Search Assistant</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Streamline your job search with intelligent tools, track your progress, and boost your career opportunities with ReapplyMe.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-500/50 transition-all font-medium shadow-lg shadow-primary-500/30"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">
            Supercharge Your Job Search
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to land your dream job, powered by AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Smart Job Search */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
              <FiSearch className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Smart Job Search
            </h3>
            <p className="text-gray-600">
              Find relevant job opportunities with AI-powered search that understands your skills and preferences.
            </p>
          </div>

          {/* Progress Tracking */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <FiTrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Progress Insights
            </h3>
            <p className="text-gray-600">
              Visualize your application journey with detailed analytics and AI-powered insights on your progress.
            </p>
          </div>

          {/* Gamified Experience */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
              <FiAward className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Gamified Experience
            </h3>
            <p className="text-gray-600">
              Stay motivated with achievements, levels, and rewards as you progress in your job search journey.
            </p>
          </div>

          {/* Skill Development */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <FiBookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Skill Boost
            </h3>
            <p className="text-gray-600">
              Get personalized recommendations for courses and certifications to enhance your qualifications.
            </p>
          </div>

          {/* Referral Network */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <FiShare2 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Referral Network
            </h3>
            <p className="text-gray-600">
              Share opportunities and earn rewards by helping others in their job search journey.
            </p>
          </div>

          {/* Email Templates */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
              <FiMail className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Smart Templates
            </h3>
            <p className="text-gray-600">
              Create professional emails and cover letters with AI-powered templates customized for each application.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-3xl p-8 md:p-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Join thousands of job seekers who have already discovered the power of AI-assisted job searching.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-xl hover:bg-primary-50 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all font-medium shadow-lg"
          >
            Start Your Journey
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-gray-500">
          <p> 2024 ReapplyMe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
