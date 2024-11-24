import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

// Components
import Navbar from './components/Navbar'
import Home from './components/Home'
import Login from './components/Login'
import SignUp from './components/SignUp'
import Dashboard from './components/Dashboard'
import JobSearch from './components/JobSearch'
import ApplicationTracker from './components/ApplicationTracker'
import ResetPassword from './components/ResetPassword'
import UpdatePassword from './components/UpdatePassword'
import EmailTemplate from './components/EmailTemplate'
import Progress from './components/Progress'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar session={session} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={session ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/signup"
            element={session ? <Navigate to="/dashboard" /> : <SignUp />}
          />
          <Route
            path="/dashboard"
            element={session ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/job-search"
            element={session ? <JobSearch /> : <Navigate to="/login" />}
          />
          <Route
            path="/applications"
            element={session ? <ApplicationTracker /> : <Navigate to="/login" />}
          />
          <Route
            path="/email-template"
            element={session ? <EmailTemplate /> : <Navigate to="/login" />}
          />
          <Route
            path="/progress"
            element={session ? <Progress /> : <Navigate to="/login" />}
          />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
