const getModels = () => {
  if (global.useFallbackDb) return require('../config/localDb');
  return {
    Message: require('../models/Message'),
    Profile: require('../models/Profile'),
    Notification: require('../models/Notification'),
  };
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { Message, Profile, Notification } = getModels();
    const { receiverId, receiverName, content } = req.body;
    if (!receiverId || !content?.trim()) {
      return res.status(400).json({ error: 'Receiver and content are required.' });
    }

    // Fetch sender's profile for name
    let senderName = req.user.email;
    try {
      const prof = await Profile.findOne({ user: req.user.id });
      if (prof?.name) senderName = prof.name;
    } catch (_) {}

    const msg = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      senderName,
      receiverName: receiverName || '',
      content: content.trim(),
    });

    // Create a notification for the receiver
    try {
      await Notification.create({
        user: receiverId,
        title: 'New Message 💬',
        content: `You received a message from ${senderName}: "${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"`,
      });
    } catch (_) {}

    res.status(201).json(msg);
  } catch (e) {
    console.error('sendMessage error:', e);
    res.status(500).json({ error: 'Failed to send message.' });
  }
};

// Get inbox (messages received by logged-in user)
exports.getInbox = async (req, res) => {
  try {
    const { Message } = getModels();
    const msgs = await Message.find({ receiver: req.user.id });
    res.json(msgs);
  } catch (e) {
    console.error('getInbox error:', e);
    res.status(500).json({ error: 'Failed to fetch inbox.' });
  }
};

// Get outbox (messages sent by logged-in user)
exports.getOutbox = async (req, res) => {
  try {
    const { Message } = getModels();
    const msgs = await Message.find({ sender: req.user.id });
    res.json(msgs);
  } catch (e) {
    console.error('getOutbox error:', e);
    res.status(500).json({ error: 'Failed to fetch outbox.' });
  }
};

// Get thread between current user and another user (marks all notifications from this sender as read too)
exports.getThread = async (req, res) => {
  try {
    const { Message, Notification } = getModels();
    const { otherId } = req.params;
    const msgs = await Message.find({
      $or: [
        { sender: req.user.id, receiver: otherId },
        { sender: otherId, receiver: req.user.id },
      ],
    });
    // Sort array locally because fallback list might not be sorted
    msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Reset notification count for notifications from this sender/message
    try {
      await Notification.updateMany({ user: req.user.id }, { isRead: true });
    } catch (_) {}

    res.json(msgs);
  } catch (e) {
    console.error('getThread error:', e);
    res.status(500).json({ error: 'Failed to fetch thread.' });
  }
};
