import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const formatEmailContent = (content) => {
  // Add proper line breaks for email structure
  return content
    .replace(/Dear/g, '\nDear')
    .replace(/Best regards/gi, '\n\nBest regards')
    .replace(/Sincerely/gi, '\n\nSincerely')
    .replace(/Thank you/g, '\n\nThank you')
    .replace(/\. /g, '.\n\n')
    .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
    .trim();
};

export const enhanceTemplate = async (content, options) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Extract existing variables from the original content
    const variableRegex = /{{([^}]+)}}/g;
    const existingVariables = content.match(variableRegex) || [];
    const allowedVariablesStr = existingVariables.join(', ');

    const prompt = `
      Enhance this email template with the following requirements:
      Tone: ${options.tone || 'professional'}
      Length: ${options.length || 'maintain current length'}
      Emphasis: ${options.emphasis || 'balanced'}
      Style: ${options.style || 'professional'}
      
      IMPORTANT:
      1. ONLY use these existing variables: ${allowedVariablesStr}
      2. DO NOT create or use any new variables
      3. Maintain proper email structure with clear paragraph breaks
      
      Original template:
      ${content}
    `;

    const result = await model.generateContent(prompt);
    let enhancedContent = result.response.text();
    
    // Verify and fix any new variables that might have been added
    const newMatches = enhancedContent.match(variableRegex) || [];
    newMatches.forEach(match => {
      if (!existingVariables.includes(match)) {
        enhancedContent = enhancedContent.replace(match, '[Details]');
      }
    });

    return formatEmailContent(enhancedContent);
  } catch (error) {
    console.error('Error enhancing template:', error);
    throw error;
  }
};

export const generateCustomTemplate = async (templateType, context) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Generate a professional email template for: ${templateType}
      
      Context:
      - Company: {{COMPANY_NAME}}
      - Title: {{USER_TITLE}}
      - Skills: ${context.skills || 'to be filled'}
      - Experience: ${context.experience || 'to be filled'}
      - Category: ${context.category || 'General'}
      
      Requirements:
      1. Use proper email structure with clear paragraph breaks
      2. ONLY use these allowed variables in {{VARIABLE_NAME}} format:
         - {{USER_FIRSTNAME}}
         - {{USER_LASTNAME}}
         - {{USER_TITLE}}
         - {{COMPANY_NAME}}
         - {{USER_EMAIL}}
         - {{USER_PHONE}}
      3. DO NOT create or use any other variables
      4. Keep it professional and concise
      5. Include appropriate greeting and closing
    `;

    const result = await model.generateContent(prompt);
    let generatedContent = result.response.text();
    
    // Extract all variables from the generated content
    const variableRegex = /{{([^}]+)}}/g;
    const matches = generatedContent.match(variableRegex) || [];
    
    // List of allowed variables
    const allowedVariables = [
      '{{USER_FIRSTNAME}}',
      '{{USER_LASTNAME}}',
      '{{USER_TITLE}}',
      '{{COMPANY_NAME}}',
      '{{USER_EMAIL}}',
      '{{USER_PHONE}}'
    ];
    
    // Replace any non-allowed variables with appropriate defaults
    matches.forEach(match => {
      if (!allowedVariables.includes(match)) {
        generatedContent = generatedContent.replace(match, '[Details]');
      }
    });

    return formatEmailContent(generatedContent);
  } catch (error) {
    console.error('Error generating template:', error);
    throw error;
  }
};
