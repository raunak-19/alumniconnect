const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { generateResumeReport, getMatchMetrics, getRoadmap, copilotChat } = require('../controllers/aiController');

router.post('/resume-ats', auth, generateResumeReport);
router.post('/match', auth, getMatchMetrics);
router.post('/roadmap', auth, getRoadmap);
router.post('/copilot', auth, copilotChat);

module.exports = router;
