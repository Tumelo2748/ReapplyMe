import { useState } from 'react'
import { generateCoverLetter } from '../lib/gemini'
import { sendJobApplication } from '../lib/email'
import { supabase } from '../lib/supabase'

export default function JobSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [applying, setApplying] = useState(false)

  const searchJobs = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // In a real application, you would integrate with job search APIs
      // This is a mock implementation
      const mockJobs = [
        {
          id: 1,
          title: 'Software Engineer',
          company: 'Tech Corp',
          location: 'San Francisco, CA',
          description: 'Looking for a skilled software engineer...',
          recruiter_email: 'recruiter@techcorp.com'
        },
        {
          id: 2,
          title: 'Frontend Developer',
          company: 'Web Solutions',
          location: 'Remote',
          description: 'Seeking an experienced frontend developer...',
          recruiter_email: 'hr@websolutions.com'
        },
      ]
      setJobs(mockJobs)
    } catch (error) {
      console.error('Error searching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJobSelect = async (job) => {
    setSelectedJob(job)
    setApplying(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const generatedCoverLetter = await generateCoverLetter(job.description, profile)
      setCoverLetter(generatedCoverLetter)
    } catch (error) {
      console.error('Error generating cover letter:', error)
    } finally {
      setApplying(false)
    }
  }

  const handleApply = async () => {
    setApplying(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Get resume URL
      const { data: resumeUrl } = await supabase.storage
        .from('resumes')
        .getPublicUrl(profile.resume_url)

      await sendJobApplication({
        to: selectedJob.recruiter_email,
        subject: `Application for ${selectedJob.title} position`,
        coverLetter,
        resume: resumeUrl.publicUrl
      })

      // Save application to database
      await supabase.from('applications').insert({
        user_id: user.id,
        job_title: selectedJob.title,
        company: selectedJob.company,
        status: 'applied',
        applied_at: new Date().toISOString(),
      })

      alert('Application sent successfully!')
      setSelectedJob(null)
      setCoverLetter('')
    } catch (error) {
      console.error('Error sending application:', error)
      alert('Error sending application: ' + error.message)
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Find Your Next Opportunity</h1>
        <form onSubmit={searchJobs} className="flex gap-4">
          <input
            type="text"
            placeholder="Job title or keywords"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Job Listings */}
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold">{job.title}</h3>
              <p className="text-gray-600">{job.company}</p>
              <p className="text-gray-500">{job.location}</p>
              <p className="mt-2">{job.description}</p>
              <button
                onClick={() => handleJobSelect(job)}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>

        {/* Application Form */}
        {selectedJob && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Apply to {selectedJob.title}</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={10}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            <button
              onClick={handleApply}
              disabled={applying || !coverLetter}
              className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {applying ? 'Sending Application...' : 'Send Application'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
