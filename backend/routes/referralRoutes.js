const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const referralController = require('../controllers/referralController');
router.post('/post', authMiddleware, referralController.createOpportunity);
router.get('/list', authMiddleware, referralController.getAllOpportunities);
module.exports = router;
