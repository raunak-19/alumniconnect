const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getModels = () => {
  if (global.useFallbackDb) return require('../config/localDb');
  return {
    User: require('../models/User'),
    Profile: require('../models/Profile'),
  };
};

const isValidNitjsrEmail = (email) => {
  return (
    /@nitjsr\.ac\.in$/i.test(email) ||
    email.endsWith('.edu.in') ||
    email.endsWith('.edu') ||
    email.endsWith('.ac.in') ||
    email.endsWith('@gmail.com')
  );
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/* ─────────────────────────────────────────────────────
   REGISTER
   Accepts multipart/form-data so a document can be uploaded.
   Account is created with verificationStatus = 'pending'.
   Admin must approve before the user can log in.
───────────────────────────────────────────────────── */
exports.register = async (req, res) => {
  try {
    const { email, password, name, department, graduationYear, accountType } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    const { User, Profile } = getModels();

    // Determine role first (needed for email validation)
    const currentYear = new Date().getFullYear();
    const gradYear = parseInt(graduationYear, 10) || currentYear;
    let role = 'student';
    if (accountType === 'Alumni' || accountType === 'alumni') {
      role = 'alumni';
    }

    // Email validation: students need @nitjsr.ac.in, alumni can use any valid email
    if (role === 'student' && !isValidNitjsrEmail(email)) {
      return res.status(400).json({ error: 'Students must use their @nitjsr.ac.in institutional email address.' });
    }
    if (role === 'alumni' && !isValidEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ error: 'An account with this email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 12);

    // Document path from multer — required
    const documentPath = req.file ? req.file.filename : '';
    if (!documentPath) {
      return res.status(400).json({ error: 'A verification document is required (ID card, registration slip, or degree certificate).' });
    }

    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      graduationYear: gradYear,
      isVerified: false,
      verificationStatus: 'pending',  // 🔑 must be approved by admin before login
      documentPath,
    });

    await Profile.create({
      user: newUser._id,
      name: name || email.split('@')[0],
      department: department || '',
      skills: [],
    });

    // Return minimal info — no JWT, no dashboard access yet
    res.status(201).json({
      pending: true,
      message: 'Registration received. Your account is awaiting admin verification. You will be able to login once approved.',
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        verificationStatus: 'pending',
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed. ' + error.message });
  }
};

/* ─────────────────────────────────────────────────────
   LOGIN
   Checks verificationStatus before granting access.
───────────────────────────────────────────────────── */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { User, Profile } = getModels();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password.' });

    // Admins bypass verification checks
    if (user.role !== 'admin') {
      if (user.verificationStatus === 'pending') {
        return res.status(403).json({
          error: 'Your account is awaiting admin verification. Please check back later.',
          verificationStatus: 'pending',
        });
      }
      if (user.verificationStatus === 'rejected') {
        return res.status(403).json({
          error: `Your registration was rejected by the administrator.${user.rejectionReason ? ' Reason: ' + user.rejectionReason : ''} Please contact the placement cell.`,
          verificationStatus: 'rejected',
        });
      }
    }

    const profile = await Profile.findOne({ user: user._id });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: profile?.name || email.split('@')[0],
        department: profile?.department || '',
        graduationYear: user.graduationYear,
        skills: profile?.skills || [],
        company: profile?.company || '',
        designation: profile?.designation || '',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. ' + error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const { User, Profile } = getModels();
    const user = await User.findById(req.user.id);
    const profile = await Profile.findOne({ user: req.user.id });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      name: profile?.name || '',
      department: profile?.department || '',
      graduationYear: user.graduationYear,
      skills: profile?.skills || [],
      company: profile?.company || '',
      designation: profile?.designation || '',
    });
  } catch (e) {
    console.error('GetMe error:', e);
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
};
