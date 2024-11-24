import { useState, useEffect } from 'react'
import { generateCoverLetter } from '../lib/gemini'
import { sendJobApplication } from '../lib/email'
import { supabase } from '../lib/supabase'
import { jobSearchApi } from '../services/jobSearch'
import { FiBriefcase, FiMapPin, FiDollarSign, FiClock, FiX, FiExternalLink, FiSearch, FiFilter } from 'react-icons/fi'

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
  const [filters, setFilters] = useState({
    employmentType: '',
    datePosted: '',
    remoteOnly: false,
  })
  const [error, setError] = useState(null)
  const [selectedJobDetails, setSelectedJobDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const searchJobs = async (e) => {
    e?.preventDefault()
    if (!searchQuery.trim()) {
      setError('Please enter a job title, keyword, or company name')
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const query = {
        query: searchQuery.trim(),
        location: location.trim(),
        page,
        employment_type: filters.employmentType,
        date_posted: filters.datePosted,
        remote_jobs_only: filters.remoteOnly,
      }
      
      const result = await jobSearchApi.searchJobs(query)
      setJobs(prev => page === 1 ? result.data : [...prev, ...result.data])
      
      // Only fetch salary data if we have both job title and location
      if (page === 1 && searchQuery.trim() && location.trim()) {
        try {
          const salaryData = await jobSearchApi.getEstimatedSalary(searchQuery.trim(), location.trim())
          setSalaryEstimate(salaryData.data)
        } catch (salaryError) {
          console.error('Error fetching salary estimate:', salaryError)
          // Don't show the main error for salary fetch issues
        }
      } else {
        // Clear salary estimate if no location
        setSalaryEstimate(null)
      }
    } catch (error) {
      console.error('Error searching jobs:', error)
      setError(error.message || 'Failed to fetch jobs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Reset page when search params change
  useEffect(() => {
    setPage(1)
  }, [searchQuery, location, filters])

  // Load more jobs when page changes
  useEffect(() => {
    if (page > 1) {
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

  const viewJobDetails = async (job) => {
    setLoadingDetails(true)
    try {
      const details = await jobSearchApi.getJobDetails(job.job_id)
      setSelectedJobDetails(details.data[0])
    } catch (error) {
      console.error('Error fetching job details:', error)
      setError('Failed to load job details. Please try again.')
    } finally {
      setLoadingDetails(false)
    }
  }

  const closeJobDetails = () => {
    setSelectedJobDetails(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={searchJobs} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="City, state, or remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/50 font-medium min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Find Jobs'}
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-gray-600">
                <FiFilter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <select
                value={filters.employmentType}
                onChange={(e) => setFilters(prev => ({ ...prev, employmentType: e.target.value }))}
                className="text-sm border-0 text-gray-600 focus:ring-0 cursor-pointer hover:text-primary-600"
              >
                <option value="">Job Type</option>
                <option value="FULLTIME">Full Time</option>
                <option value="PARTTIME">Part Time</option>
                <option value="CONTRACTOR">Contract</option>
                <option value="INTERN">Internship</option>
              </select>
              <select
                value={filters.datePosted}
                onChange={(e) => setFilters(prev => ({ ...prev, datePosted: e.target.value }))}
                className="text-sm border-0 text-gray-600 focus:ring-0 cursor-pointer hover:text-primary-600"
              >
                <option value="">Date Posted</option>
                <option value="today">Last 24 hours</option>
                <option value="3days">Last 3 days</option>
                <option value="week">Last week</option>
                <option value="month">Last month</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-primary-600">
                <input
                  type="checkbox"
                  checked={filters.remoteOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, remoteOnly: e.target.checked }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                Remote Only
              </label>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Salary Estimate */}
        {salaryEstimate && (
          <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 text-gray-900">
              <FiDollarSign className="w-5 h-5 text-primary-600" />
              <span className="font-medium">Estimated Salary Range</span>
            </div>
            <p className="mt-2 text-gray-600">
              {salaryEstimate.min_salary} - {salaryEstimate.max_salary} {salaryEstimate.salary_currency} / year
            </p>
          </div>
        )}

        {/* Job Results */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Job Listings */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {jobs.length} Jobs Found
            </h2>
            {jobs.map((job) => (
              <div
                key={job.job_id}
                onClick={() => viewJobDetails(job)}
                className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="p-6">
                  <h3 className="text-lg font-medium text-primary-600 group-hover:text-primary-700">
                    {job.job_title}
                  </h3>
                  <p className="text-gray-900 mt-1">{job.employer_name}</p>
                  
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FiMapPin className="w-4 h-4" />
                      <span>{job.job_city}, {job.job_country}</span>
                      {job.job_is_remote && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                          Remote
                        </span>
                      )}
                    </div>
                    {job.job_employment_type && (
                      <div className="flex items-center gap-2">
                        <FiBriefcase className="w-4 h-4" />
                        <span>{job.job_employment_type}</span>
                      </div>
                    )}
                    {job.job_posted_at_datetime_utc && (
                      <div className="flex items-center gap-2">
                        <FiClock className="w-4 h-4" />
                        <span>Posted {new Date(job.job_posted_at_datetime_utc).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <p className="text-gray-600 line-clamp-2">{job.job_description}</p>
                  </div>
                </div>
              </div>
            ))}

            {jobs.length > 0 && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all font-medium disabled:opacity-50"
                >
                  Load More Jobs
                </button>
              </div>
            )}
          </div>

          {/* Job Details Panel (Fixed on Desktop) */}
          <div className="hidden lg:block sticky top-[100px] h-[calc(100vh-88px)]">
            {selectedJobDetails ? (
              <div className="bg-white border mt-10 border-gray-200 rounded-lg h-full flex flex-col">
                {/* Fixed Header */}
                <div className="p-6 border-b border-gray-200 bg-white sticky top-0">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedJobDetails.job_title}
                      </h2>
                      <p className="text-lg text-gray-600 mt-1">
                        {selectedJobDetails.employer_name}
                      </p>
                    </div>
                    <button
                      onClick={closeJobDetails}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiMapPin className="w-4 h-4" />
                      <span>
                        {selectedJobDetails.job_city}, {selectedJobDetails.job_country}
                        {selectedJobDetails.job_is_remote && " (Remote)"}
                      </span>
                    </div>
                    {selectedJobDetails.job_employment_type && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiBriefcase className="w-4 h-4" />
                        <span>{selectedJobDetails.job_employment_type}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleJobSelect(selectedJobDetails)}
                      className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/50 font-medium"
                    >
                      Apply with AI
                    </button>
                    {selectedJobDetails.job_apply_link && (
                      <a
                        href={selectedJobDetails.job_apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 font-medium"
                      >
                        Apply on Company Site
                        <FiExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-3xl mx-auto">
                    <div className="prose max-w-none">
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h3>
                        <div 
                          className="text-gray-600 space-y-4 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: selectedJobDetails.job_description }}
                        />
                      </div>

                      {selectedJobDetails.job_highlights?.Qualifications && (
                        <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Qualifications</h3>
                          <ul className="list-disc pl-5 text-gray-600 space-y-2">
                            {selectedJobDetails.job_highlights.Qualifications.map((qual, index) => (
                              <li key={index} className="pl-2">{qual}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedJobDetails.job_highlights?.Responsibilities && (
                        <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Responsibilities</h3>
                          <ul className="list-disc pl-5 text-gray-600 space-y-2">
                            {selectedJobDetails.job_highlights.Responsibilities.map((resp, index) => (
                              <li key={index} className="pl-2">{resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedJobDetails.job_highlights?.Benefits && (
                        <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h3>
                          <ul className="list-disc pl-5 text-gray-600 space-y-2">
                            {selectedJobDetails.job_highlights.Benefits.map((benefit, index) => (
                              <li key={index} className="pl-2">{benefit}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg h-full flex items-center justify-center text-gray-500">
                <p>Select a job to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Job Details Modal */}
      {selectedJobDetails && (
        <div className="lg:hidden fixed inset-0 bg-gray-500 bg-opacity-75 z-50">
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-h-[90vh] flex flex-col">
                {/* Fixed Header - Same as desktop */}
                <div className="p-6 border-b border-gray-200 bg-white sticky top-0">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedJobDetails.job_title}
                      </h2>
                      <p className="text-lg text-gray-600 mt-1">
                        {selectedJobDetails.employer_name}
                      </p>
                    </div>
                    <button
                      onClick={closeJobDetails}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiMapPin className="w-4 h-4" />
                      <span>
                        {selectedJobDetails.job_city}, {selectedJobDetails.job_country}
                        {selectedJobDetails.job_is_remote && " (Remote)"}
                      </span>
                    </div>
                    {selectedJobDetails.job_employment_type && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiBriefcase className="w-4 h-4" />
                        <span>{selectedJobDetails.job_employment_type}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleJobSelect(selectedJobDetails)}
                      className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/50 font-medium"
                    >
                      Apply with AI
                    </button>
                    {selectedJobDetails.job_apply_link && (
                      <a
                        href={selectedJobDetails.job_apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 font-medium"
                      >
                        Apply on Company Site
                        <FiExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Scrollable Content - Same as desktop */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-3xl mx-auto">
                    <div className="prose max-w-none">
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h3>
                        <div 
                          className="text-gray-600 space-y-4 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: selectedJobDetails.job_description }}
                        />
                      </div>

                      {selectedJobDetails.job_highlights?.Qualifications && (
                        <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Qualifications</h3>
                          <ul className="list-disc pl-5 text-gray-600 space-y-2">
                            {selectedJobDetails.job_highlights.Qualifications.map((qual, index) => (
                              <li key={index} className="pl-2">{qual}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedJobDetails.job_highlights?.Responsibilities && (
                        <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Responsibilities</h3>
                          <ul className="list-disc pl-5 text-gray-600 space-y-2">
                            {selectedJobDetails.job_highlights.Responsibilities.map((resp, index) => (
                              <li key={index} className="pl-2">{resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedJobDetails.job_highlights?.Benefits && (
                        <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h3>
                          <ul className="list-disc pl-5 text-gray-600 space-y-2">
                            {selectedJobDetails.job_highlights.Benefits.map((benefit, index) => (
                              <li key={index} className="pl-2">{benefit}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
