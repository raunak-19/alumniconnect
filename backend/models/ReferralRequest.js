const mongoose = require('mongoose');

const referralRequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  alumni: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', default: null },
  message: { type: String, default: '' },
  studentName: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('ReferralRequest', referralRequestSchema);
