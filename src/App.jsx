import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

// Components
import Navbar from './components/Navbar'
import Home from './components/Home'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import JobSearch from './components/JobSearch'
import ApplicationTracker from './components/ApplicationTracker'
import EmailTemplate from './components/EmailTemplate'
import ResetPassword from './components/ResetPassword'
import UpdatePassword from './components/UpdatePassword'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar session={session} />
        
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route 
              path="/dashboard" 
              element={session ? <Dashboard /> : <Login />} 
            />
            <Route 
              path="/job-search" 
              element={session ? <JobSearch /> : <Login />} 
            />
            <Route 
              path="/applications" 
              element={session ? <ApplicationTracker /> : <Login />} 
            />
            <Route 
              path="/email-template" 
              element={session ? <EmailTemplate /> : <Login />} 
            />
          </Routes>
        
      </div>
    </Router>
  )
}

export default App
