import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { emailTemplates } from '../data/emailTemplates';

const EmailTemplate = () => {
  const [profile, setProfile] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('introduction');
  const [additionalFields, setAdditionalFields] = useState({
    EVENT_NAME: '',
    INDUSTRY_TOPIC: '',
    INTERESTING_FACT: '',
    EXPERIENCE_HIGHLIGHTS: '',
    KEY_ACHIEVEMENTS: '',
    TECHNICAL_SKILLS: '',
    INDUSTRY_CHALLENGE: '',
    SOLUTION_APPROACH: '',
    PROFESSIONAL_PASSION: '',
    SPECIAL_SKILLS: '',
    EXPERTISE_AREA: '',
    COMPANY_STRENGTH: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          let { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error && error.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const updates = {
              id: user.id,
              full_name: '',
              title: '',
              about: '',
              skills: '',
              experience: '',
              education: '',
              updated_at: new Date().toISOString(),
            };

            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .upsert(updates)
              .select()
              .single();

            if (createError) throw createError;
            data = newProfile;
          } else if (error) {
            throw error;
          }

          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile && companyName) {
      let content = emailTemplates[selectedTemplate].content;
      // Split full name into first and last name
      const nameParts = (profile.full_name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Replace basic variables
      content = content.replace(/{{USER_FIRSTNAME}}/g, firstName);
      content = content.replace(/{{USER_LASTNAME}}/g, lastName);
      content = content.replace(/{{USER_TITLE}}/g, profile.title || '[Your Title]');
      content = content.replace(/{{COMPANY_NAME}}/g, companyName);

      // Replace additional fields
      Object.entries(additionalFields).forEach(([key, value]) => {
        const placeholder = `[${key.toLowerCase().replace(/_/g, ' ')}]`;
        content = content.replace(
          new RegExp(`{{${key}}}`, 'g'),
          value || placeholder
        );
      });

      setEmailContent(content);
    }
  }, [profile, companyName, selectedTemplate, additionalFields]);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(emailContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleFieldChange = (field, value) => {
    setAdditionalFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get required fields for current template
  const getRequiredFields = () => {
    const content = emailTemplates[selectedTemplate].content;
    const matches = content.match(/{{([A-Z_]+)}}/g) || [];
    return matches
      .map(match => match.replace(/[{}]/g, ''))
      .filter(field => !['USER_FIRSTNAME', 'USER_LASTNAME', 'USER_TITLE', 'COMPANY_NAME'].includes(field));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const requiredFields = getRequiredFields();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Email Template Generator</h2>
      
      {(!profile?.full_name || !profile?.title) && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">
            Please complete your profile in the Dashboard to include your name and title in the email templates.
          </p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label htmlFor="templateSelect" className="block text-sm font-medium text-gray-700 mb-2">
            Select Template
          </label>
          <select
            id="templateSelect"
            value={selectedTemplate}
            onChange={(e) => {
              setSelectedTemplate(e.target.value);
              // Reset additional fields when template changes
              setAdditionalFields(prev => {
                const newFields = {};
                Object.keys(prev).forEach(key => {
                  newFields[key] = '';
                });
                return newFields;
              });
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            {Object.entries(emailTemplates).map(([key, template]) => (
              <option key={key} value={key}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
            Company Name
          </label>
          <input
            type="text"
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter company name"
          />
        </div>

        {requiredFields.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
            {requiredFields.map((field) => (
              <div key={field}>
                <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-2">
                  {field.replace(/_/g, ' ').toLowerCase()}
                </label>
                <input
                  type="text"
                  id={field}
                  value={additionalFields[field]}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={`Enter ${field.replace(/_/g, ' ').toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Generated Email</h3>
            <button
              onClick={handleCopyToClipboard}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              {isCopied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md font-mono text-sm">
            {emailContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplate;
