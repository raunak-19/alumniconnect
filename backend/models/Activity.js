const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, default: 'Someone' },
  userRole: { type: String, enum: ['student', 'alumni', 'admin'] },
  type: { type: String, required: true }, // 'posted_job', 'referral_requested', 'referral_accepted', 'profile_updated', 'joined'
  details: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);
