import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { emailTemplates } from '../data/emailTemplates';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EmailTemplate = () => {
  const [profile, setProfile] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [editableContent, setEditableContent] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('introduction');
  const [userTemplates, setUserTemplates] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplateName, setCurrentTemplateName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [templateVersions, setTemplateVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [canEdit, setCanEdit] = useState(false);
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

  const categories = [
    'General',
    'Job Application',
    'Follow-up',
    'Networking',
    'Thank You',
    'Custom'
  ];

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };

  useEffect(() => {
    fetchProfile();
    fetchUserTemplates();
  }, []);

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

  const fetchUserTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_email_templates')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        setUserTemplates(data || []);
      }
    } catch (error) {
      console.error('Error fetching user templates:', error);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const templateData = {
        user_id: user.id,
        name: currentTemplateName || `Custom ${emailTemplates[selectedTemplate].name}`,
        content: editableContent,
        template_type: selectedTemplate,
        category: selectedCategory,
        is_default: false,
      };

      // Save template
      const { data: savedTemplate, error } = await supabase
        .from('user_email_templates')
        .upsert(templateData)
        .select()
        .single();

      if (error) throw error;

      // Save version
      const { data: versions } = await supabase
        .from('template_versions')
        .select('version_number')
        .eq('template_id', savedTemplate.id)
        .order('version_number', { ascending: false })
        .limit(1);

      const nextVersion = versions?.length > 0 ? versions[0].version_number + 1 : 1;

      const { error: versionError } = await supabase
        .from('template_versions')
        .insert({
          template_id: savedTemplate.id,
          content: editableContent,
          version_number: nextVersion,
          created_by: user.id
        });

      if (versionError) throw versionError;

      await fetchUserTemplates();
      await fetchTemplateVersions(savedTemplate.id);
      setIsEditing(false);
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    } finally {
      setSaving(false);
    }
  };

  const fetchTemplateVersions = async (templateId) => {
    try {
      const { data, error } = await supabase
        .from('template_versions')
        .select('*')
        .eq('template_id', templateId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setTemplateVersions(data || []);
    } catch (error) {
      console.error('Error fetching template versions:', error);
    }
  };

  const handleShareTemplate = async () => {
    try {
      if (!shareEmail) return;

      const { data: userToShare, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', shareEmail)
        .single();

      if (userError) throw userError;

      const { error: shareError } = await supabase
        .from('shared_templates')
        .insert({
          template_id: selectedTemplate,
          shared_with: userToShare.id,
          can_edit: canEdit,
          shared_by: profile.id
        });

      if (shareError) throw shareError;

      alert('Template shared successfully!');
      setShareEmail('');
      setCanEdit(false);
    } catch (error) {
      console.error('Error sharing template:', error);
      alert('Error sharing template');
    }
  };

  useEffect(() => {
    if (profile && companyName) {
      let content = emailTemplates[selectedTemplate].content;
      const nameParts = (profile.full_name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      content = content.replace(/{{USER_FIRSTNAME}}/g, firstName);
      content = content.replace(/{{USER_LASTNAME}}/g, lastName);
      content = content.replace(/{{USER_TITLE}}/g, profile.title || '[Your Title]');
      content = content.replace(/{{COMPANY_NAME}}/g, companyName);

      Object.entries(additionalFields).forEach(([key, value]) => {
        const placeholder = `[${key.toLowerCase().replace(/_/g, ' ')}]`;
        content = content.replace(
          new RegExp(`{{${key}}}`, 'g'),
          value || placeholder
        );
      });

      setEmailContent(content);
      if (!isEditing) {
        setEditableContent(content);
      }
    }
  }, [profile, companyName, selectedTemplate, additionalFields, isEditing]);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(isEditing ? editableContent : emailContent);
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
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Email Template Editor</h2>
      
      {(!profile?.full_name || !profile?.title) && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">
            Please complete your profile in the Dashboard to include your name and title in the email templates.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Template Selection and Variables */}
        <div className="space-y-6">
          <div>
            <label htmlFor="categorySelect" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="categorySelect"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="templateSelect" className="block text-sm font-medium text-gray-700 mb-2">
              Select Template
            </label>
            <select
              id="templateSelect"
              value={selectedTemplate}
              onChange={(e) => {
                setSelectedTemplate(e.target.value);
                setIsEditing(false);
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
              <optgroup label="Default Templates">
                {Object.entries(emailTemplates).map(([key, template]) => (
                  <option key={key} value={key}>
                    {template.name}
                  </option>
                ))}
              </optgroup>
              {userTemplates.length > 0 && (
                <optgroup label="Your Templates">
                  {userTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </optgroup>
              )}
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

          {isEditing && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Share Template</h3>
                <div>
                  <label htmlFor="shareEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Share with (email)
                  </label>
                  <input
                    type="email"
                    id="shareEmail"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter email address"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canEdit"
                    checked={canEdit}
                    onChange={(e) => setCanEdit(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="canEdit" className="ml-2 block text-sm text-gray-900">
                    Allow editing
                  </label>
                </div>
                <button
                  onClick={handleShareTemplate}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors"
                >
                  Share Template
                </button>
              </div>

              {templateVersions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Version History</h3>
                  <select
                    value={selectedVersion?.id || ''}
                    onChange={(e) => {
                      const version = templateVersions.find(v => v.id === e.target.value);
                      if (version) {
                        setSelectedVersion(version);
                        setEditableContent(version.content);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Current Version</option>
                    {templateVersions.map((version) => (
                      <option key={version.id} value={version.id}>
                        Version {version.version_number} - {new Date(version.created_at).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Side - Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  isEditing
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isEditing ? 'Preview' : 'Edit'}
              </button>
              {isEditing && (
                <button
                  onClick={handleSaveTemplate}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Template'}
                </button>
              )}
            </div>
            <button
              onClick={handleCopyToClipboard}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              {isCopied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={currentTemplateName}
                onChange={(e) => setCurrentTemplateName(e.target.value)}
                placeholder="Template Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="border rounded-md">
                <ReactQuill
                  value={editableContent}
                  onChange={setEditableContent}
                  modules={modules}
                  className="h-[500px] bg-white"
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="whitespace-pre-wrap font-mono text-sm">
                {emailContent}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailTemplate;
