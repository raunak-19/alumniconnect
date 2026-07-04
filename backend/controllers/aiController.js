const groq = require('../services/groqService');

exports.generateResumeReport = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    const report = await groq.analyzeResumeATS(resumeText || '', jobDescription || '');
    res.status(200).json(report);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'AI analysis failed.' });
  }
};

exports.getMatchMetrics = async (req, res) => {
  try {
    const { student, alumni } = req.body;
    res.status(200).json({ score: 85, explanation: 'Profiles match across engineering domain and shared skills.' });
  } catch (e) {
    res.status(500).json({ error: 'Match calculation failed.' });
  }
};

exports.getRoadmap = async (req, res) => {
  try {
    const { targetRole, currentSkills } = req.body;
    if (!targetRole) return res.status(400).json({ error: 'targetRole required.' });
    const roadmap = await groq.generateRoadmap(targetRole, currentSkills || []);
    res.json(roadmap);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Roadmap generation failed.' });
  }
};

exports.copilotChat = async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required.' });
    const reply = await groq.generateCopilotReply(message, context || {});
    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Copilot failed.' });
  }
};
