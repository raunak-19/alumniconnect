const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const messageController = require('../controllers/messageController');

router.post('/send', authMiddleware, messageController.sendMessage);
router.get('/inbox', authMiddleware, messageController.getInbox);
router.get('/outbox', authMiddleware, messageController.getOutbox);
router.get('/thread/:otherId', authMiddleware, messageController.getThread);

module.exports = router;
