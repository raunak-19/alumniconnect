const mongoose = require('mongoose');
const opportunitySchema = new mongoose.Schema({
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  type: { type: String, enum: ['Internship', 'Full-Time', 'Referral Opportunity'], required: true },
  description: { type: String, default: '' },
  skillsRequired: [{ type: String }],
  deadline: { type: Date, required: true },
  referralLink: { type: String, required: true },
  hasReferralOption: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('Opportunity', opportunitySchema);
