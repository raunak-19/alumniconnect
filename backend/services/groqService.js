const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const chat = async (messages, jsonMode = false) => {
  const params = {
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.7,
    max_tokens: 2048,
  };
  if (jsonMode) {
    params.response_format = { type: 'json_object' };
    params.temperature = 0.3;
  }
  const completion = await groq.chat.completions.create(params);
  return completion.choices[0]?.message?.content || '';
};

exports.analyzeResumeATS = async (resumeText, jobDescription = '') => {
  const prompt = `You are an expert ATS (Applicant Tracking System) analyzer and resume coach.
Analyze the following resume${jobDescription ? ' against the job description' : ''} and return a JSON object.

${jobDescription ? `Job Description:\n${jobDescription}\n\n` : ''}Resume Text:\n${resumeText}

Return ONLY valid JSON with this exact structure:
{
  "atsScore": <number 0-100>,
  "grade": "<A/B/C/D>",
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": [
    {"section": "<section name>", "issue": "<what's wrong>", "fix": "<specific fix>"}
  ],
  "missingKeywords": ["<keyword 1>", "<keyword 2>"],
  "matchedKeywords": ["<keyword 1>", "<keyword 2>"],
  "formattingIssues": ["<issue 1>", "<issue 2>"],
  "actionItems": ["<action 1>", "<action 2>", "<action 3>"]
}`;

  const text = await chat([{ role: 'user', content: prompt }], true);
  try {
    return JSON.parse(text);
  } catch {
    return {
      atsScore: 65,
      grade: 'C',
      summary: 'Could not fully parse the resume. Please ensure it contains clear sections.',
      strengths: [],
      improvements: [],
      missingKeywords: [],
      matchedKeywords: [],
      formattingIssues: ['Resume text may not be properly formatted'],
      actionItems: ['Review resume formatting', 'Add clear section headers'],
    };
  }
};

exports.generateRoadmap = async (targetRole, currentSkills = []) => {
  const prompt = `You are a senior tech career coach. Generate a detailed career roadmap for someone targeting: "${targetRole}".
Their current skills: ${currentSkills.length > 0 ? currentSkills.join(', ') : 'none listed'}.

Return ONLY valid JSON:
{
  "targetRole": "${targetRole}",
  "estimatedTime": "<e.g. 6-12 months>",
  "phases": [
    {
      "phase": 1,
      "title": "<phase title>",
      "duration": "<e.g. 2 months>",
      "goals": ["<goal 1>", "<goal 2>"],
      "skills": ["<skill 1>", "<skill 2>"],
      "resources": [{"name": "<resource name>", "type": "<Course/Book/Project>", "link": ""}],
      "milestone": "<what to achieve by end of this phase>"
    }
  ],
  "requiredSkills": ["<skill 1>", "<skill 2>"],
  "skillGaps": ["<gap 1>", "<gap 2>"],
  "jobTitles": ["<related title 1>", "<related title 2>"],
  "salaryRange": "<e.g. ₹8-20 LPA>",
  "topCompanies": ["<company 1>", "<company 2>", "<company 3>"]
}`;

  const text = await chat([{ role: 'user', content: prompt }], true);
  try {
    return JSON.parse(text);
  } catch {
    return { targetRole, phases: [], requiredSkills: [], skillGaps: [], error: 'Generation failed' };
  }
};

exports.generateCopilotReply = async (message, context = {}) => {
  const systemPrompt = `You are an expert AI career assistant for engineering students and alumni at NIT Jamshedpur. 
You help with: resume writing, job search strategies, interview preparation, skill development, networking, and career planning.
Keep responses concise, practical, and encouraging. Use bullet points where helpful.
Context about user: ${JSON.stringify(context)}`;

  return chat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message },
  ]);
};

exports.polishResumeSection = async (section, content, targetRole = '') => {
  const prompt = `You are an expert resume writer for engineering professionals${targetRole ? ` targeting ${targetRole}` : ''}.
Improve the following ${section} section of a resume to be more impactful, ATS-friendly, and quantified where possible.
Use strong action verbs. Keep bullet points concise (1-2 lines each).

Original content:
${content}

Return ONLY the improved text, no explanations, no JSON.`;

  return chat([{ role: 'user', content: prompt }]);
};

exports.generateProfessionalSummary = async (resumeData) => {
  const { name, targetRole, targetCompany, skills, experience, education } = resumeData;
  const prompt = `Write a 3-4 sentence professional summary for a resume. 
Name: ${name || 'the candidate'}
Target Role: ${targetRole || 'Software Engineer'}
Target Company: ${targetCompany || 'top tech companies'}
Key Skills: ${(skills?.technical || []).slice(0, 8).join(', ')}
Experience: ${(experience || []).map(e => e.role).join(', ')}
Education: ${(education || []).map(e => `${e.degree} from ${e.institution}`).join(', ')}

Write a powerful, confident, ATS-optimized summary. Return ONLY the summary text, no quotes.`;

  return chat([{ role: 'user', content: prompt }]);
};
