const path = require('path');

const getModels = () => {
  if (global.useFallbackDb) return require('../config/localDb');
  return {
    User: require('../models/User'),
    Profile: require('../models/Profile'),
    Opportunity: require('../models/Opportunity'),
  };
};

/* ── Analytics ─────────────────────────────────────── */
exports.getAnalytics = async (req, res) => {
  try {
    const { User, Profile, Opportunity } = getModels();
    const totalUsers = await User.countDocuments();
    const students   = await User.countDocuments({ role: 'student' });
    const alumni     = await User.countDocuments({ role: 'alumni' });
    const admins     = await User.countDocuments({ role: 'admin' });
    const totalOps   = await Opportunity.countDocuments();
    const pending    = await User.countDocuments({ verificationStatus: 'pending' });

    const profiles = await Profile.find();
    const byDepartment = {};
    profiles.forEach(p => {
      const dep = p.department || 'Unspecified';
      if (dep) byDepartment[dep] = (byDepartment[dep] || 0) + 1;
    });

    res.json({ totalUsers, students, alumni, admins, totalOps, pending, byDepartment });
  } catch (e) {
    console.error('getAnalytics error:', e);
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
};

/* ── All Users ─────────────────────────────────────── */
exports.getAllUsers = async (req, res) => {
  try {
    const { User, Profile } = getModels();
    const users    = await User.find({ verificationStatus: { $ne: 'pending' } }).sort({ createdAt: -1 });
    const profiles = await Profile.find();

    const merged = users.map(u => {
      const prof = profiles.find(p => p.user?.toString() === u._id?.toString());
      return {
        id: u._id,
        email: u.email,
        role: u.role,
        graduationYear: u.graduationYear,
        isVerified: u.isVerified,
        verificationStatus: u.verificationStatus,
        createdAt: u.createdAt,
        name: prof?.name || '',
        department: prof?.department || '',
        company: prof?.company || '',
        designation: prof?.designation || '',
      };
    });

    res.json(merged);
  } catch (e) {
    console.error('getAllUsers error:', e);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

/* ── Pending Verification Requests ─────────────────── */
exports.getPendingRequests = async (req, res) => {
  try {
    const { User, Profile } = getModels();
    const users    = await User.find({ verificationStatus: 'pending' }).sort({ createdAt: -1 });
    const profiles = await Profile.find();

    const merged = users.map(u => {
      const prof = profiles.find(p => p.user?.toString() === u._id?.toString());
      return {
        id: u._id,
        email: u.email,
        role: u.role,
        graduationYear: u.graduationYear,
        verificationStatus: u.verificationStatus,
        documentPath: u.documentPath || '',
        createdAt: u.createdAt,
        name: prof?.name || '',
        department: prof?.department || '',
      };
    });

    res.json(merged);
  } catch (e) {
    console.error('getPendingRequests error:', e);
    res.status(500).json({ error: 'Failed to fetch pending requests.' });
  }
};

/* ── Approve a pending user ─────────────────────────── */
exports.approveUser = async (req, res) => {
  try {
    const { User } = getModels();
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.verificationStatus = 'approved';
    user.isVerified = true;
    user.rejectionReason = '';
    await user.save();

    res.json({ message: 'User approved successfully.', user: { id: user._id, verificationStatus: 'approved' } });
  } catch (e) {
    console.error('approveUser error:', e);
    res.status(500).json({ error: 'Failed to approve user.' });
  }
};

/* ── Reject a pending user ──────────────────────────── */
exports.rejectUser = async (req, res) => {
  try {
    const { User } = getModels();
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.verificationStatus = 'rejected';
    user.isVerified = false;
    user.rejectionReason = req.body.reason || '';
    await user.save();

    res.json({ message: 'User rejected.', user: { id: user._id, verificationStatus: 'rejected' } });
  } catch (e) {
    console.error('rejectUser error:', e);
    res.status(500).json({ error: 'Failed to reject user.' });
  }
};

/* ── Toggle verify (existing users tab) ─────────────── */
exports.toggleVerifyUser = async (req, res) => {
  try {
    const { User } = getModels();
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.isVerified = !user.isVerified;
    await user.save();

    res.json({ message: 'Verification status updated.', user: { id: user._id, isVerified: user.isVerified } });
  } catch (e) {
    console.error('toggleVerify error:', e);
    res.status(500).json({ error: 'Failed to update verification.' });
  }
};

/* ── Delete user ─────────────────────────────────────── */
exports.deleteUser = async (req, res) => {
  try {
    const { User, Profile } = getModels();
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    await Profile.findOneAndDelete({ user: req.params.id });
    res.json({ message: 'User deleted successfully.' });
  } catch (e) {
    console.error('deleteUser error:', e);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
};

/* ── Platform Activity ───────────────────────────────── */
exports.getPlatformActivity = async (req, res) => {
  try {
    const { Opportunity, Profile } = getModels();
    const ops      = await Opportunity.find().sort({ createdAt: -1 });
    const profiles = await Profile.find();

    const activities = ops.map(op => {
      const prof = profiles.find(p => p.user?.toString() === op.postedBy?.toString());
      return {
        id: op._id,
        role: op.role,
        company: op.company,
        type: op.type,
        deadline: op.deadline,
        postedByName: prof?.name || 'Alumni Member',
        postedAt: op.createdAt,
      };
    });

    res.json(activities);
  } catch (e) {
    console.error('getPlatformActivity error:', e);
    res.status(500).json({ error: 'Failed to fetch platform activity.' });
  }
};
