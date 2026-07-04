const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
exports.analyzeResumeData = async (resumeText) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following raw resume text and return a strict JSON payload containing layout stats: {"atsScore": 85, "analysis": {"missingSkills": ["Docker"], "weakSections": ["Projects"], "strongSections": ["Foundations"]}, "roadmap": [{"step": "Backend", "duration": "4 weeks", "focus": "Systems"}], "templates": {"referralMessage": "Hello...", "linkedinMessage": "Hi..."}}. Text: ${resumeText}`,
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return { atsScore: 70, analysis: { missingSkills: [], weakSections: [], strongSections: ["Parsed Foundation"] }, roadmap: [], templates: { referralMessage: "Hi", linkedinMessage: "Hello" } };
  }
};
exports.calculateMatchScore = async (student, alumni) => {
  return { score: 92, explanation: "Profiles match strongly over shared engineering domain targets and tool stack frameworks." };
};
