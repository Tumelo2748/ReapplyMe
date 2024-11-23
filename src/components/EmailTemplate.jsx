import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { emailTemplates } from "../data/emailTemplates";
import ReactQuill from "react-quill";
import DOMPurify from "dompurify";
import "react-quill/dist/quill.snow.css";
import { enhanceTemplate, generateCustomTemplate } from "../services/gemini";

const EmailTemplate = () => {
  const [profile, setProfile] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [userTitle, setUserTitle] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [editableContent, setEditableContent] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("introduction");
  const [userTemplates, setUserTemplates] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplateName, setCurrentTemplateName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [templateVersions, setTemplateVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [shareEmail, setShareEmail] = useState("");
  const [canEdit, setCanEdit] = useState(false);
  const [aiOptions, setAiOptions] = useState({
    tone: "",
    length: "",
    emphasis: "",
    style: "",
  });
  const [prevTemplate, setPrevTemplate] = useState("");

  const categories = [
    "General",
    "Job Application",
    "Follow-up",
    "Networking",
    "Thank You",
    "Custom",
  ];

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  };

  const applyVariables = (content) => {
    if (!content) return "";

    const nameParts = (profile?.full_name || "").split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    return content
      .replace(/{{USER_FIRSTNAME}}/g, firstName)
      .replace(/{{USER_LASTNAME}}/g, lastName)
      .replace(/{{USER_TITLE}}/g, userTitle || profile?.title || "[Your Title]")
      .replace(/{{USER_EMAIL}}/g, userEmail || profile?.email || "[Your Email]")
      .replace(/{{USER_PHONE}}/g, userPhone || profile?.phone || "[Your Phone]")
      .replace(/{{COMPANY_NAME}}/g, companyName || "[Company Name]");
  };

  const formatPreviewContent = (htmlContent) => {
    if (!htmlContent) return "";

    // Create a temporary div to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = DOMPurify.sanitize(htmlContent);

    // Get the text content
    let text = tempDiv.innerText;

    // Ensure proper line breaks for email structure
    text = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
      .join("\n\n");

    return text;
  };

  useEffect(() => {
    fetchProfile();
    fetchUserTemplates();
  }, []);

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        let { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code === "PGRST116") {
          const updates = {
            id: user.id,
            full_name: "",
            title: "",
            about: "",
            skills: "",
            experience: "",
            education: "",
            updated_at: new Date().toISOString(),
          };

          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
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
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTemplates = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("user_email_templates")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;
        setUserTemplates(data || []);
      }
    } catch (error) {
      console.error("Error fetching user templates:", error);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      setSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const templateData = {
        user_id: user.id,
        name:
          currentTemplateName ||
          `Custom ${emailTemplates[selectedTemplate].name}`,
        content: editableContent,
        template_type: selectedTemplate,
        category: selectedCategory,
        is_default: false,
      };

      // Save template
      const { data: savedTemplate, error } = await supabase
        .from("user_email_templates")
        .upsert(templateData)
        .select()
        .single();

      if (error) throw error;

      // Save version
      const { data: versions } = await supabase
        .from("template_versions")
        .select("version_number")
        .eq("template_id", savedTemplate.id)
        .order("version_number", { ascending: false })
        .limit(1);

      const nextVersion =
        versions?.length > 0 ? versions[0].version_number + 1 : 1;

      const { error: versionError } = await supabase
        .from("template_versions")
        .insert({
          template_id: savedTemplate.id,
          content: editableContent,
          version_number: nextVersion,
          created_by: user.id,
        });

      if (versionError) throw versionError;

      await fetchUserTemplates();
      await fetchTemplateVersions(savedTemplate.id);
      setIsEditing(false);
      alert("Template saved successfully!");
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Error saving template");
    } finally {
      setSaving(false);
    }
  };

  const fetchTemplateVersions = async (templateId) => {
    try {
      const { data, error } = await supabase
        .from("template_versions")
        .select("*")
        .eq("template_id", templateId)
        .order("version_number", { ascending: false });

      if (error) throw error;
      setTemplateVersions(data || []);
    } catch (error) {
      console.error("Error fetching template versions:", error);
    }
  };

  const handleShareTemplate = async () => {
    try {
      if (!shareEmail) return;

      const { data: userToShare, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", shareEmail)
        .single();

      if (userError) throw userError;

      const { error: shareError } = await supabase
        .from("shared_templates")
        .insert({
          template_id: selectedTemplate,
          shared_with: userToShare.id,
          can_edit: canEdit,
          shared_by: profile.id,
        });

      if (shareError) throw shareError;

      alert("Template shared successfully!");
      setShareEmail("");
      setCanEdit(false);
    } catch (error) {
      console.error("Error sharing template:", error);
      alert("Error sharing template");
    }
  };

  const handleEnhanceTemplate = async () => {
    try {
      setEnhancing(true);
      const enhancedContent = await enhanceTemplate(editableContent, aiOptions);
      const processedContent = applyVariables(enhancedContent);
      setEditableContent(processedContent);
      setEmailContent(processedContent);
    } catch (error) {
      console.error("Error enhancing template:", error);
      alert("Failed to enhance template. Please try again.");
    } finally {
      setEnhancing(false);
    }
  };

  const handleGenerateCustomTemplate = async () => {
    try {
      setEnhancing(true);
      const context = {
        company: companyName,
        title: profile?.title,
        skills: profile?.skills,
        experience: profile?.experience,
        category: selectedCategory,
      };
      const generatedContent = await generateCustomTemplate(
        selectedTemplate,
        context
      );
      const processedContent = applyVariables(generatedContent);
      setEditableContent(processedContent);
      setEmailContent(processedContent);
    } catch (error) {
      console.error("Error generating template:", error);
      alert("Failed to generate template. Please try again.");
    } finally {
      setEnhancing(false);
    }
  };

  const toggleEditMode = () => {
    if (isEditing) {
      // Switching to preview mode - update email content with current editable content
      setEmailContent(editableContent);
    }
    setIsEditing(!isEditing);
  };

  useEffect(() => {
    if (profile && companyName) {
      // Only load template content when selecting a new template or initializing
      if (!isEditing || selectedTemplate !== prevTemplate) {
        let content = emailTemplates[selectedTemplate].content;
        const nameParts = (profile.full_name || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        content = content
          .replace(/{{USER_FIRSTNAME}}/g, firstName)
          .replace(/{{USER_LASTNAME}}/g, lastName)
          .replace(/{{USER_TITLE}}/g, profile.title || "[Your Title]")
          .replace(/{{COMPANY_NAME}}/g, companyName);

        Object.entries(aiOptions).forEach(([key, value]) => {
          const placeholder = `[${key.toLowerCase().replace(/_/g, " ")}]`;
          content = content.replace(
            new RegExp(`{{${key}}}`, "g"),
            value || placeholder
          );
        });

        setEmailContent(content);
        setEditableContent(content);
      }
      setPrevTemplate(selectedTemplate);
    }
  }, [profile, companyName, selectedTemplate, aiOptions]);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        isEditing ? editableContent : emailContent
      );
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleFieldChange = (field, value) => {
    setAiOptions((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getRequiredFields = () => {
    const content = emailTemplates[selectedTemplate].content;
    const matches = content.match(/{{([A-Z_]+)}}/g) || [];
    return matches
      .map((match) => match.replace(/[{}]/g, ""))
      .filter(
        (field) =>
          ![
            "USER_FIRSTNAME",
            "USER_LASTNAME",
            "USER_TITLE",
            "COMPANY_NAME",
          ].includes(field)
      );
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Email Template Editor
        </h2>
        <p className="mt-2 text-gray-600">
          Craft professional emails with AI-powered enhancements
        </p>
      </div>

      {(!profile?.full_name || !profile?.title) && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">
            Please complete your profile in the Dashboard to include your name
            and title in the email templates.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          {/* Template Selection Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b">
              Template Settings
            </h3>

            <div>
              <label
                htmlFor="categorySelect"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category
              </label>
              <select
                id="categorySelect"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="templateSelect"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Template
              </label>
              <select
                id="templateSelect"
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  setIsEditing(false);
                  setAiOptions({
                    tone: "",
                    length: "",
                    emphasis: "",
                    style: "",
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white"
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
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
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
            <div>
              <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b">
                Additional Fields
              </h3>
              <div className="space-y-4">
                {requiredFields.map((field) => (
                  <div key={field}>
                    <label
                      htmlFor={field}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {field}
                    </label>
                    <input
                      type="text"
                      id={field}
                      value={aiOptions[field] || ""}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={`Enter ${field}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* additinal fields */}

          {/* Template Sharing Section */}
          {isEditing && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b">
                Share Template
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="shareEmail"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
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
                  <label
                    htmlFor="canEdit"
                    className="ml-2 block text-sm text-gray-900"
                  >
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
            </div>
          )}
        </div>

        {/* Right Side - Editor */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-4">
                <button
                  onClick={toggleEditMode}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    isEditing
                      ? "bg-gray-200 text-gray-800"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {isEditing ? "Preview" : "Edit"}
                </button>
                {isEditing && (
                  <button
                    onClick={handleSaveTemplate}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Template"}
                  </button>
                )}
              </div>
              <button
                onClick={handleCopyToClipboard}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                {isCopied ? "Copied!" : "Copy to Clipboard"}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-6">
                <input
                  type="text"
                  value={currentTemplateName}
                  onChange={(e) => setCurrentTemplateName(e.target.value)}
                  placeholder="Template Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />

                {/* AI Enhancement Settings */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      AI Enhancement Options
                    </h3>
                    <p className="text-sm text-gray-600">
                      Customize how the AI enhances your email template
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tone
                        <span className="ml-2 text-xs text-gray-500">
                          How should your email sound?
                        </span>
                      </label>
                      <select
                        value={aiOptions.tone}
                        onChange={(e) =>
                          setAiOptions((prev) => ({
                            ...prev,
                            tone: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      >
                        <option value="">Select tone</option>
                        <option value="professional">
                          Professional - Formal and business-like
                        </option>
                        <option value="confident">
                          Confident - Strong and assertive
                        </option>
                        <option value="enthusiastic">
                          Enthusiastic - Positive and energetic
                        </option>
                        <option value="formal">
                          Formal - Traditional and respectful
                        </option>
                        <option value="friendly">
                          Friendly - Warm and approachable
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Length
                        <span className="ml-2 text-xs text-gray-500">
                          How detailed should it be?
                        </span>
                      </label>
                      <select
                        value={aiOptions.length}
                        onChange={(e) =>
                          setAiOptions((prev) => ({
                            ...prev,
                            length: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      >
                        <option value="">Select length</option>
                        <option value="shorter">
                          Shorter - Brief and to the point
                        </option>
                        <option value="concise">
                          Concise - Balanced length
                        </option>
                        <option value="detailed">
                          Detailed - More comprehensive
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emphasis
                        <span className="ml-2 text-xs text-gray-500">
                          What to highlight?
                        </span>
                      </label>
                      <select
                        value={aiOptions.emphasis}
                        onChange={(e) =>
                          setAiOptions((prev) => ({
                            ...prev,
                            emphasis: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      >
                        <option value="">Select emphasis</option>
                        <option value="skills">
                          Skills - Focus on technical abilities
                        </option>
                        <option value="experience">
                          Experience - Highlight work history
                        </option>
                        <option value="achievements">
                          Achievements - Emphasize accomplishments
                        </option>
                        <option value="culture fit">
                          Culture Fit - Show alignment with company
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Style
                        <span className="ml-2 text-xs text-gray-500">
                          Writing approach?
                        </span>
                      </label>
                      <select
                        value={aiOptions.style}
                        onChange={(e) =>
                          setAiOptions((prev) => ({
                            ...prev,
                            style: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      >
                        <option value="">Select style</option>
                        <option value="modern">
                          Modern - Contemporary and fresh
                        </option>
                        <option value="traditional">
                          Traditional - Classic and conventional
                        </option>
                        <option value="creative">
                          Creative - Innovative and unique
                        </option>
                        <option value="direct">
                          Direct - Clear and straightforward
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-4">
                    <button
                      onClick={handleEnhanceTemplate}
                      disabled={enhancing}
                      className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        {enhancing
                          ? "Enhancing..."
                          : "Enhance Current Template"}
                      </span>
                    </button>
                    <button
                      onClick={handleGenerateCustomTemplate}
                      disabled={enhancing}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        {enhancing ? "Generating..." : "Generate New Template"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Rich Text Editor */}
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
              <div className="bg-gray-50 rounded-lg p-6 min-h-[500px]">
                <div className="whitespace-pre-wrap font-sans text-base leading-relaxed">
                  {formatPreviewContent(emailContent)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplate;
