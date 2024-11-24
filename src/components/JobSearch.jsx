import { useState, useEffect } from 'react'
import { generateCoverLetter } from '../lib/gemini'
import { sendJobApplication } from '../lib/email'
import { supabase } from '../lib/supabase'
import { jobSearchApi } from '../services/jobSearch'
import { FiBriefcase, FiMapPin, FiDollarSign, FiClock } from 'react-icons/fi'

export default function JobSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [applying, setApplying] = useState(false)
  const [page, setPage] = useState(1)
  const [salaryEstimate, setSalaryEstimate] = useState(null)

  const searchJobs = async (e) => {
    e?.preventDefault()
    setLoading(true)
    try {
      const result = await jobSearchApi.searchJobs(searchQuery, location, page)
      setJobs(result.data || [])
      
      // Get salary estimate for the search query
      if (searchQuery) {
        const salaryData = await jobSearchApi.getEstimatedSalary(searchQuery, location)
        setSalaryEstimate(salaryData.data)
      }
    } catch (error) {
      console.error('Error searching jobs:', error)
      alert('Error searching jobs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Load more jobs when page changes
  useEffect(() => {
    if (page > 1 && searchQuery) {
      searchJobs()
    }
  }, [page])

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

      // Get detailed job information
      const jobDetails = await jobSearchApi.getJobDetails(job.job_id)
      const fullJobDescription = jobDetails.data[0].job_description || job.job_description

      const generatedCoverLetter = await generateCoverLetter(fullJobDescription, profile)
      setCoverLetter(generatedCoverLetter)
    } catch (error) {
      console.error('Error generating cover letter:', error)
      alert('Error generating cover letter. Please try again.')
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
        to: selectedJob.employer_email,
        subject: `Application for ${selectedJob.job_title} position`,
        coverLetter,
        resume: resumeUrl.publicUrl
      })

      // Save application to database
      await supabase.from('applications').insert({
        user_id: user.id,
        job_title: selectedJob.job_title,
        company: selectedJob.employer_name,
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Next Opportunity</h1>
        <p className="text-gray-600 mb-6">Search through millions of jobs from top companies</p>
        
        <form onSubmit={searchJobs} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiBriefcase className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div className="flex-1 relative">
            <FiMapPin className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="City, state, or remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-500/50 transition-all font-medium shadow-lg shadow-primary-500/30 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Jobs'}
          </button>
        </form>

        {/* Salary Estimate */}
        {salaryEstimate && (
          <div className="mt-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
            <div className="flex items-center gap-2 text-primary-700">
              <FiDollarSign className="w-5 h-5" />
              <span className="font-medium">Estimated Salary Range:</span>
            </div>
            <p className="mt-1 text-gray-600">
              {salaryEstimate.min_salary} - {salaryEstimate.max_salary} {salaryEstimate.salary_currency} / year
            </p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Job Listings */}
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.job_id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{job.job_title}</h3>
                  <p className="text-gray-600">{job.employer_name}</p>
                  <p className="text-gray-500 flex items-center gap-1">
                    <FiMapPin className="w-4 h-4" />
                    {job.job_city}, {job.job_country}
                  </p>
                </div>
                {job.job_is_remote && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Remote
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {job.job_employment_type && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <FiBriefcase className="w-4 h-4" />
                    <span>{job.job_employment_type}</span>
                  </div>
                )}
                {job.job_posted_at_datetime_utc && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <FiClock className="w-4 h-4" />
                    <span>Posted {new Date(job.job_posted_at_datetime_utc).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <p className="text-gray-600 line-clamp-3">{job.job_description}</p>
              </div>

              <button
                onClick={() => handleJobSelect(job)}
                className="mt-4 w-full px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/50 transition-all font-medium disabled:opacity-50"
              >
                Apply Now
              </button>
            </div>
          ))}

          {jobs.length > 0 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setPage(page + 1)}
                disabled={loading}
                className="px-6 py-2 border-2 border-primary-500 text-primary-600 rounded-xl hover:bg-primary-50 focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all font-medium disabled:opacity-50"
              >
                Load More Jobs
              </button>
            </div>
          )}
        </div>

        {/* Application Form */}
        {selectedJob && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Apply to {selectedJob.job_title}
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={10}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={handleApply}
              disabled={applying || !coverLetter}
              className="w-full px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-500/50 transition-all font-medium shadow-lg shadow-primary-500/30 disabled:opacity-50"
            >
              {applying ? 'Sending Application...' : 'Send Application'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
