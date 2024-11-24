import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { FiTrendingUp, FiAward, FiBookOpen, FiShare2 } from 'react-icons/fi'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

export default function Progress() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    applications: 0,
    interviews: 0,
    offers: 0,
    level: 1,
    points: 0,
    nextLevelPoints: 100,
  })
  const [achievements, setAchievements] = useState([])
  const [skillSuggestions, setSkillSuggestions] = useState([])
  const [referrals, setReferrals] = useState([])

  useEffect(() => {
    fetchUserProgress()
    fetchAchievements()
    fetchSkillSuggestions()
    fetchReferrals()
  }, [])

  const fetchUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Fetch application stats
      const { data: applications } = await supabase
        .from('applications')
        .select('status')
        .eq('user_id', user.id)

      // Calculate stats
      const stats = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1
        return acc
      }, {})

      setStats(prevStats => ({
        ...prevStats,
        applications: applications.length,
        interviews: stats.interview || 0,
        offers: stats.offer || 0,
      }))
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
      setAchievements(data || [])
    } catch (error) {
      console.error('Error fetching achievements:', error)
    }
  }

  const fetchSkillSuggestions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Get user's recent applications
      const { data: applications } = await supabase
        .from('applications')
        .select('job_title')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Mock skill suggestions based on job titles
      // In a real app, this would use AI to analyze job requirements
      const suggestions = [
        {
          title: 'AWS Cloud Practitioner',
          platform: 'Amazon Web Services',
          url: 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
          relevance: 0.95,
        },
        {
          title: 'React Development',
          platform: 'Udemy',
          url: 'https://www.udemy.com/course/react-the-complete-guide/',
          relevance: 0.9,
        },
        {
          title: 'Python for Data Science',
          platform: 'Coursera',
          url: 'https://www.coursera.org/learn/python-for-data-science',
          relevance: 0.85,
        },
      ]

      setSkillSuggestions(suggestions)
    } catch (error) {
      console.error('Error fetching skill suggestions:', error)
    }
  }

  const fetchReferrals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
      setReferrals(data || [])
    } catch (error) {
      console.error('Error fetching referrals:', error)
    }
  }

  const shareReferralLink = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const referralLink = `${window.location.origin}/signup?ref=${user.id}`
      await navigator.clipboard.writeText(referralLink)
      
      // Show success message using a toast or alert
      const message = document.createElement('div')
      message.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300'
      message.textContent = 'Referral link copied to clipboard!'
      document.body.appendChild(message)

      // Remove the message after 3 seconds
      setTimeout(() => {
        message.style.transform = 'translateY(100%)'
        setTimeout(() => document.body.removeChild(message), 300)
      }, 3000)
    } catch (error) {
      console.error('Error sharing referral link:', error)
      // Show error message
      const message = document.createElement('div')
      message.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg'
      message.textContent = 'Failed to generate referral link. Please try again.'
      document.body.appendChild(message)

      // Remove the error message after 3 seconds
      setTimeout(() => document.body.removeChild(message), 3000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Applications</h3>
            <FiTrendingUp className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.applications}</p>
              <p className="text-sm text-gray-500">Total Applications</p>
            </div>
            <div className="w-20 h-20">
              <CircularProgressbar
                value={(stats.applications / 10) * 100}
                maxValue={100}
                text={`${stats.applications}/10`}
                styles={buildStyles({
                  pathColor: '#4F46E5',
                  textColor: '#4F46E5',
                  trailColor: '#E5E7EB',
                })}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Interviews</h3>
            <FiTrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.interviews}</p>
              <p className="text-sm text-gray-500">Interview Invites</p>
            </div>
            <div className="w-20 h-20">
              <CircularProgressbar
                value={(stats.interviews / stats.applications) * 100}
                maxValue={100}
                text={`${Math.round((stats.interviews / stats.applications) * 100)}%`}
                styles={buildStyles({
                  pathColor: '#059669',
                  textColor: '#059669',
                  trailColor: '#E5E7EB',
                })}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Level Progress</h3>
            <FiAward className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">Level {stats.level}</p>
              <p className="text-sm text-gray-500">{stats.points} / {stats.nextLevelPoints} XP</p>
            </div>
            <div className="w-20 h-20">
              <CircularProgressbar
                value={(stats.points / stats.nextLevelPoints) * 100}
                maxValue={100}
                text={`${Math.round((stats.points / stats.nextLevelPoints) * 100)}%`}
                styles={buildStyles({
                  pathColor: '#D97706',
                  textColor: '#D97706',
                  trailColor: '#E5E7EB',
                })}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Offers</h3>
            <FiTrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.offers}</p>
              <p className="text-sm text-gray-500">Job Offers</p>
            </div>
            <div className="w-20 h-20">
              <CircularProgressbar
                value={(stats.offers / stats.interviews) * 100}
                maxValue={100}
                text={`${Math.round((stats.offers / stats.interviews) * 100)}%`}
                styles={buildStyles({
                  pathColor: '#2563EB',
                  textColor: '#2563EB',
                  trailColor: '#E5E7EB',
                })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recent Achievements</h3>
            <FiAward className="w-5 h-5 text-primary-600" />
          </div>
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <FiAward className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                  <p className="text-sm text-gray-500">{achievement.description}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-sm font-medium text-primary-600">+{achievement.points} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Suggestions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recommended Skills</h3>
            <FiBookOpen className="w-5 h-5 text-primary-600" />
          </div>
          <div className="space-y-4">
            {skillSuggestions.map((skill, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{skill.title}</h4>
                  <span className="text-sm text-primary-600">{Math.round(skill.relevance * 100)}% match</span>
                </div>
                <p className="text-sm text-gray-500 mb-3">Platform: {skill.platform}</p>
                <a
                  href={skill.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Learn More →
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Referral Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Referral Network</h3>
            <p className="text-sm text-gray-500 mt-1">Help your network find their next opportunity</p>
          </div>
          <FiShare2 className="w-5 h-5 text-primary-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Share Your Referral Link</h4>
            <p className="text-sm text-gray-500 mb-4">
              Invite friends to join ReapplyMe and earn rewards when they find success
            </p>
            <button
              onClick={shareReferralLink}
              className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Copy Referral Link
            </button>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Your Impact</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Referrals</span>
                <span className="text-sm font-medium text-gray-900">{referrals.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Successful Placements</span>
                <span className="text-sm font-medium text-gray-900">
                  {referrals.filter(r => r.status === 'placed').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Rewards Earned</span>
                <span className="text-sm font-medium text-gray-900">
                  {referrals.reduce((acc, r) => acc + (r.reward_points || 0), 0)} points
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
