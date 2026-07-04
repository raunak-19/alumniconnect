const groq = require('../services/groqService');

const getResume = () => {
  if (global.useFallbackDb) return require('../config/localDb').Resume;
  return require('../models/Resume');
};

exports.getResume = async (req, res) => {
  try {
    const Resume = getResume();
    let resume = await Resume.findOne({ user: req.user.id });
    if (!resume) {
      resume = await Resume.create({ user: req.user.id });
    }
    res.json(resume);
  } catch (e) {
    console.error('getResume error:', e);
    res.status(500).json({ error: 'Failed to fetch resume.' });
  }
};

exports.saveResume = async (req, res) => {
  try {
    const Resume = getResume();
    
    // Clean client-generated _id strings that are not valid 24-character hex ObjectIds
    const body = { ...req.body };
    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

    const arraySections = ['education', 'experience', 'projects', 'achievements', 'certifications', 'extracurriculars'];
    arraySections.forEach(section => {
      if (Array.isArray(body[section])) {
        body[section] = body[section].map(item => {
          const newItem = { ...item };
          if (newItem._id && !isValidObjectId(newItem._id)) {
            delete newItem._id; // Let Mongoose generate a valid ObjectId
          }
          return newItem;
        });
      }
    });

    const resume = await Resume.findOneAndUpdate(
      { user: req.user.id },
      { ...body, user: req.user.id },
      { new: true, upsert: true, runValidators: false }
    );
    res.json(resume);
  } catch (e) {
    console.error('saveResume error:', e);
    res.status(500).json({ error: 'Failed to save resume: ' + e.message });
  }
};

exports.checkATS = async (req, res) => {
  try {
    const Resume = getResume();
    const { resumeText, jobDescription } = req.body;
    if (!resumeText) return res.status(400).json({ error: 'Resume text required.' });
    const result = await groq.analyzeResumeATS(resumeText, jobDescription);
    if (result.atsScore) {
      await Resume.findOneAndUpdate({ user: req.user.id }, { lastAtsScore: result.atsScore });
    }
    res.json(result);
  } catch (e) {
    console.error('checkATS error:', e);
    res.status(500).json({ error: 'ATS analysis failed.' });
  }
};

exports.polishSection = async (req, res) => {
  try {
    const { section, content, targetRole } = req.body;
    if (!section || !content) return res.status(400).json({ error: 'Section and content required.' });
    const improved = await groq.polishResumeSection(section, content, targetRole);
    res.json({ improved });
  } catch (e) {
    res.status(500).json({ error: 'Section polish failed.' });
  }
};

exports.generateSummary = async (req, res) => {
  try {
    const summary = await groq.generateProfessionalSummary(req.body);
    res.json({ summary });
  } catch (e) {
    res.status(500).json({ error: 'Summary generation failed.' });
  }
};
