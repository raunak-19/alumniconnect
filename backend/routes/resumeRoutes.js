const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const rc = require('../controllers/resumeController');

router.get('/', auth, rc.getResume);
router.post('/', auth, rc.saveResume);
router.post('/check-ats', auth, rc.checkATS);
router.post('/polish-section', auth, rc.polishSection);
router.post('/generate-summary', auth, rc.generateSummary);

module.exports = router;
