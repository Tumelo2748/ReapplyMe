import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const generateCoverLetter = async (jobDescription, userProfile) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    Create a professional and personalized cover letter for a job application based on the following:
    
    Job Description:
    ${jobDescription}
    
    Candidate Profile:
    ${JSON.stringify(userProfile)}
    
    The cover letter should be formal, highlight relevant skills and experience, and express genuine interest in the position.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};
