import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function ApplicationTracker() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getApplications()
  }, [])

  const getApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      let { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error('Error loading applications:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId)

      if (error) throw error
      
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ))
    } catch (error) {
      console.error('Error updating application:', error.message)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Application Tracker</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {applications.map((application) => (
            <li key={application.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {application.job_title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {application.company}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <select
                      value={application.status}
                      onChange={(e) => updateApplicationStatus(application.id, e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    >
                      <option value="applied">Applied</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offered">Offered</option>
                      <option value="rejected">Rejected</option>
                      <option value="accepted">Accepted</option>
                    </select>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Applied on: {new Date(application.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        {
                          applied: 'bg-yellow-100 text-yellow-800',
                          interviewing: 'bg-blue-100 text-blue-800',
                          offered: 'bg-green-100 text-green-800',
                          rejected: 'bg-red-100 text-red-800',
                          accepted: 'bg-purple-100 text-purple-800',
                        }[application.status]
                      }`}
                    >
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
