const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const alumniController = require('../controllers/alumniController');

router.get('/search', authMiddleware, alumniController.searchAlumni);
router.get('/profile/:id', authMiddleware, alumniController.getAlumniProfile);
router.get('/leaderboard', authMiddleware, alumniController.getLeaderboard);

router.post('/opportunity', authMiddleware, alumniController.postOpportunity);
router.get('/opportunities', authMiddleware, alumniController.listOpportunities);

router.post('/referral-request', authMiddleware, alumniController.sendReferralRequest);
router.get('/referral-requests/my', authMiddleware, alumniController.myReferralRequests);
router.get('/referral-requests/incoming', authMiddleware, alumniController.incomingReferralRequests);
router.post('/referral-request/:id/respond', authMiddleware, alumniController.respondToRequest);

module.exports = router;
