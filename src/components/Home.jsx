import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-10"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Automate Your</span>
              <span className="block bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Job Applications
              </span>
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-xl text-gray-600 sm:max-w-3xl">
              Let AI help you craft personalized cover letters and send job applications automatically.
              Save time and apply to more jobs with ReapplyMe.
            </p>
            <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
              <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-1 sm:gap-5">
                <Link
                  to="/login"
                  className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:px-10"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent uppercase tracking-wide">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to streamline your job search
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
              {/* Feature 1 */}
              <div className="p-8 bg-white rounded-xl shadow-card hover:shadow-hover transition-shadow">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    AI-Powered Cover Letters
                  </h3>
                  <p className="mt-2 text-base text-gray-600">
                    Generate personalized cover letters using advanced AI technology
                    that highlights your relevant skills and experience.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-8 bg-white rounded-xl shadow-card hover:shadow-hover transition-shadow">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Automated Applications
                  </h3>
                  <p className="mt-2 text-base text-gray-600">
                    Send your applications directly through our platform with just
                    one click, saving you valuable time.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-8 bg-white rounded-xl shadow-card hover:shadow-hover transition-shadow">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Job Search Aggregation
                  </h3>
                  <p className="mt-2 text-base text-gray-600">
                    Search across multiple job platforms in one place, with
                    advanced filtering options.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="p-8 bg-white rounded-xl shadow-card hover:shadow-hover transition-shadow">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Application Tracking
                  </h3>
                  <p className="mt-2 text-base text-gray-600">
                    Keep track of all your applications in one place, with status
                    updates and follow-up reminders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
