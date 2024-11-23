import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FiUser, FiBriefcase, FiBook, FiAward, FiInfo } from 'react-icons/fi';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [about, setAbout] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    getProfile();
  }, []);

  useEffect(() => {
    // Calculate profile completion percentage
    const fields = [fullName, title, about, skills, experience, education];
    const filledFields = fields.filter(field => field.trim().length > 0).length;
    setProfileCompletion(Math.round((filledFields / fields.length) * 100));
  }, [fullName, title, about, skills, experience, education]);

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFullName(data.full_name || '');
        setTitle(data.title || '');
        setAbout(data.about || '');
        setSkills(data.skills || '');
        setExperience(data.experience || '');
        setEducation(data.education || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setSaveStatus('saving');
      const { data: { user } } = await supabase.auth.getUser();

      const updates = {
        id: user.id,
        full_name: fullName,
        title: title,
        about: about,
        skills: skills,
        experience: experience,
        education: education,
        updated_at: new Date().toISOString(),
      };

      let { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header with Profile Completion */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile Dashboard</h1>
                <p className="mt-2 text-gray-600">Complete your profile to increase your chances of landing your dream job.</p>
              </div>
              <div className="flex flex-col items-center bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">{profileCompletion}%</div>
                <div className="text-sm text-gray-600">Profile Completion</div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={updateProfile} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <FiUser className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Software Engineer"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                    <textarea
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      placeholder="Brief introduction about yourself and your career goals..."
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <FiAward className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
                </div>
                <div>
                  <textarea
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="List your key skills (e.g., JavaScript, React, Node.js, Project Management)"
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <FiBriefcase className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Experience</h2>
                </div>
                <div>
                  <textarea
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="Describe your work experience (e.g., Company Name - Position - Duration - Key Achievements)"
                    rows={6}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <FiBook className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Education</h2>
                </div>
                <div>
                  <textarea
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="List your educational background (e.g., University Name - Degree - Graduation Year)"
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end items-center gap-4">
                {saveStatus === 'success' && (
                  <span className="text-green-600">Profile saved successfully!</span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-red-600">Error saving profile. Please try again.</span>
                )}
                <button
                  type="submit"
                  disabled={loading || saveStatus === 'saving'}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 flex items-center gap-2"
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
