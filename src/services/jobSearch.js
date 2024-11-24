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
    searchJobs: async (query, location, page = 1) => {
        try {
            const response = await axios.get(`${JSEARCH_BASE_URL}/search`, {
                params: {
                    query: query,
                    location: location,
                    page: page.toString(),
                    num_pages: '1'
                },
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
            console.error('Error fetching salary estimates:', error)
            throw error
        }
    }
}
