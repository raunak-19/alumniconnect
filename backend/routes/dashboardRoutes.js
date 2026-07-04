const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const getModels = () => {
  if (global.useFallbackDb) return require('../config/localDb');
  return {
    Notification: require('../models/Notification'),
    Activity: require('../models/Activity')
  };
};

// GET /api/dashboard/notifications
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const { Notification } = getModels();
    const list = await Notification.find({ user: req.user.id });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// POST /api/dashboard/notifications/read
router.post('/notifications/read', authMiddleware, async (req, res) => {
  try {
    const { Notification } = getModels();
    await Notification.updateMany({ user: req.user.id }, { isRead: true });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to mark notifications read.' });
  }
});

// GET /api/dashboard/activities
router.get('/activities', authMiddleware, async (req, res) => {
  try {
    const { Activity } = getModels();
    const list = await Activity.find();
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch activity feed.' });
  }
});

module.exports = router;
