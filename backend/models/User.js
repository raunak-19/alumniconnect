const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'alumni', 'admin'], required: true },
  graduationYear: { type: Number, default: null },
  isVerified: { type: Boolean, default: false },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  documentPath: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  contributionPoints: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', userSchema);

