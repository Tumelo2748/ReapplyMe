// Job Search API Service
import axios from 'axios'

// Constants
const RAPID_API_KEY = import.meta.env.VITE_RAPID_API_KEY
const JSEARCH_BASE_URL = 'https://jsearch.p.rapidapi.com'

// API configuration
const rapidApiConfig = {
    headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    }
}

export const jobSearchApi = {
    // Search for jobs with various filters
    searchJobs: async ({ query, location, page = 1, employment_type, date_posted, remote_jobs_only }) => {
        if (!query) {
            throw new Error("Query parameter is required")
        }
        
        try {
            const queryParams = {
                query: `${query}${location ? ' in ' + location : ''}`,
                page: page.toString(),
                num_pages: '1',
            }

            // Add optional filters
            if (employment_type) {
                queryParams.employment_type = employment_type
            }
            if (date_posted) {
                queryParams.date_posted = date_posted
            }
            if (remote_jobs_only) {
                queryParams.remote_jobs_only = 'true'
            }

            const response = await axios.get(`${JSEARCH_BASE_URL}/search`, {
                params: queryParams,
                ...rapidApiConfig
            })
            return response.data
        } catch (error) {
            console.error('Error searching jobs:', error)
            throw error
        }
    },

    // Get job details by ID
    getJobDetails: async (jobId) => {
        try {
            const response = await axios.get(`${JSEARCH_BASE_URL}/job-details`, {
                params: { job_id: jobId },
                ...rapidApiConfig
            })
            return response.data
        } catch (error) {
            console.error('Error fetching job details:', error)
            throw error
        }
    },

    // Get estimated salaries for a job title
    getEstimatedSalary: async (jobTitle, location) => {
        if (!jobTitle) {
            throw new Error("Job title parameter is required")
        }
        if (!location) {
            throw new Error("Location parameter is required")
        }
        
        try {
            const response = await axios.get(`${JSEARCH_BASE_URL}/estimated-salary`, {
                params: {
                    job_title: jobTitle,
                    location: location,
                    radius: '100'
                },
                ...rapidApiConfig
            })
            return response.data
        } catch (error) {
            console.error('Error fetching salary estimate:', error)
            throw error
        }
    }
}
