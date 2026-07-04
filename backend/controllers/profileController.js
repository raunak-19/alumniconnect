const getModels = () => {
  if (global.useFallbackDb) return require('../config/localDb');
  return {
    User: require('../models/User'),
    Profile: require('../models/Profile'),
    Resume: require('../models/Resume'),
  };
};

// GET /api/profile/me  — current user's profile
exports.getMyProfile = async (req, res) => {
  try {
    const { User, Profile, Resume } = getModels();
    const user = await User.findById(req.user.id);
    const profile = await Profile.findOne({ user: req.user.id });
    const resume = await Resume.findOne({ user: req.user.id });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      graduationYear: user.graduationYear,
      name: profile?.name || '',
      department: profile?.department || '',
      company: profile?.company || '',
      designation: profile?.designation || '',
      skills: profile?.skills || [],
      lastAtsScore: resume?.lastAtsScore ?? null,
    });
  } catch (e) {
    console.error('getMyProfile error:', e);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};

// PUT /api/profile/me  — update current user's profile (name, dept, company, designation, skills)
exports.updateMyProfile = async (req, res) => {
  try {
    const { Profile } = getModels();
    const { name, department, company, designation, skills } = req.body;

    // Validate and sanitize skills array
    const cleanSkills = Array.isArray(skills)
      ? skills.map(s => String(s).trim()).filter(Boolean)
      : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : []);

    const updateData = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (department !== undefined) updateData.department = String(department).trim();
    if (company !== undefined) updateData.company = String(company).trim();
    if (designation !== undefined) updateData.designation = String(designation).trim();
    updateData.skills = cleanSkills;

    const updated = await Profile.findOneAndUpdate(
      { user: req.user.id },
      updateData,
      { new: true, upsert: true }
    );

    res.json({
      name: updated.name,
      department: updated.department,
      company: updated.company,
      designation: updated.designation,
      skills: updated.skills || [],
    });
  } catch (e) {
    console.error('updateMyProfile error:', e);
    res.status(500).json({ error: 'Failed to update profile: ' + e.message });
  }
};
