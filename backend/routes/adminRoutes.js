const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const ac = require('../controllers/adminController');

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') next();
  else res.status(403).json({ error: 'Access denied. Administrators only.' });
};

router.get('/analytics',            auth, adminOnly, ac.getAnalytics);
router.get('/users',                auth, adminOnly, ac.getAllUsers);
router.get('/pending',              auth, adminOnly, ac.getPendingRequests);
router.post('/users/:id/approve',   auth, adminOnly, ac.approveUser);
router.post('/users/:id/reject',    auth, adminOnly, ac.rejectUser);
router.post('/users/:id/verify',    auth, adminOnly, ac.toggleVerifyUser);
router.delete('/users/:id',         auth, adminOnly, ac.deleteUser);
router.get('/activity',             auth, adminOnly, ac.getPlatformActivity);

module.exports = router;
