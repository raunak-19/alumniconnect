const getModels = () => {
  if (global.useFallbackDb) return require('../config/localDb');
  return {
    User: require('../models/User'),
    Profile: require('../models/Profile'),
    Opportunity: require('../models/Opportunity'),
    ReferralRequest: require('../models/ReferralRequest'),
    Notification: require('../models/Notification'),
    Activity: require('../models/Activity'),
  };
};

// Helper to award points to alumni
const awardPoints = async (userId, points) => {
  const { User } = getModels();
  try {
    const user = await User.findById(userId);
    if (user) {
      if (global.useFallbackDb) {
        const path = require('path');
        const STORE_PATH = path.join(__dirname, '..', 'data_store.json');
        const store = JSON.parse(require('fs').readFileSync(STORE_PATH, 'utf8'));
        const idx = store.users.findIndex(u => u._id === userId.toString());
        if (idx !== -1) {
          store.users[idx].contributionPoints = (store.users[idx].contributionPoints || 0) + points;
        }
        require('fs').writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
      } else {
        user.contributionPoints = (user.contributionPoints || 0) + points;
        await user.save();
      }
    }
  } catch (err) {
    console.error('awardPoints error:', err);
  }
};

// ─── Alumni Search ───────────────────────────────────────────────────────────
exports.searchAlumni = async (req, res) => {
  try {
    const { q, company, department, batch, role } = req.query;
    const { User, Profile } = getModels();

    let alumniUsers = await User.find({ role: 'alumni' });
    let profiles = await Profile.find();

    // Merge user+profile
    let merged = alumniUsers.map(u => {
      const prof = profiles.find(p => p.user?.toString() === u._id?.toString());
      return {
        id: u._id,
        email: u.email,
        graduationYear: u.graduationYear,
        name: prof?.name || u.email.split('@')[0],
        department: prof?.department || '',
        company: prof?.company || '',
        designation: prof?.designation || '',
        skills: prof?.skills || [],
        isVerified: u.isVerified,
        contributionPoints: u.contributionPoints || 0,
      };
    });

    // Apply filters
    if (q) {
      const lq = q.toLowerCase();
      merged = merged.filter(a =>
        a.name.toLowerCase().includes(lq) ||
        a.company.toLowerCase().includes(lq) ||
        a.designation.toLowerCase().includes(lq) ||
        a.skills.some(s => s.toLowerCase().includes(lq))
      );
    }
    if (company) merged = merged.filter(a => a.company.toLowerCase().includes(company.toLowerCase()));
    if (department) merged = merged.filter(a => a.department.toLowerCase().includes(department.toLowerCase()));
    if (batch) merged = merged.filter(a => a.graduationYear?.toString() === batch);
    if (role) merged = merged.filter(a => a.designation.toLowerCase().includes(role.toLowerCase()));

    res.json(merged);
  } catch (e) {
    console.error('searchAlumni error:', e);
    res.status(500).json({ error: 'Alumni search failed.' });
  }
};

// ─── Student Search ───────────────────────────────────────────────────────────
exports.searchStudents = async (req, res) => {
  try {
    const { q, department } = req.query;
    const { User, Profile } = getModels();

    let studentUsers = await User.find({ role: 'student', isVerified: true });
    let profiles = await Profile.find();

    // Merge user+profile
    let merged = studentUsers.map(u => {
      const prof = profiles.find(p => p.user?.toString() === u._id?.toString());
      return {
        id: u._id,
        email: u.email,
        graduationYear: u.graduationYear,
        name: prof?.name || u.email.split('@')[0],
        department: prof?.department || '',
        skills: prof?.skills || [],
        isVerified: u.isVerified,
      };
    });

    // Apply filters
    if (q) {
      const lq = q.toLowerCase();
      merged = merged.filter(s =>
        s.name.toLowerCase().includes(lq) ||
        s.department.toLowerCase().includes(lq) ||
        s.skills.some(sk => sk.toLowerCase().includes(lq))
      );
    }
    if (department) merged = merged.filter(s => s.department.toLowerCase().includes(department.toLowerCase()));

    res.json(merged);
  } catch (e) {
    console.error('searchStudents error:', e);
    res.status(500).json({ error: 'Student search failed.' });
  }
};

// ─── Get a single Alumni Profile ─────────────────────────────────────────────
exports.getAlumniProfile = async (req, res) => {
  try {
    const { User, Profile } = getModels();
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'alumni') return res.status(404).json({ error: 'Alumni not found.' });
    const prof = await Profile.findOne({ user: user._id });
    res.json({
      id: user._id,
      email: user.email,
      graduationYear: user.graduationYear,
      name: prof?.name || '',
      department: prof?.department || '',
      company: prof?.company || '',
      designation: prof?.designation || '',
      skills: prof?.skills || [],
      isVerified: user.isVerified,
      contributionPoints: user.contributionPoints || 0,
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch alumni profile.' });
  }
};

// ─── Post Opportunity (alumni only) ─────────────────────────────────────────
exports.postOpportunity = async (req, res) => {
  try {
    const { Opportunity, Profile, Activity } = getModels();
    const opp = await Opportunity.create({ ...req.body, postedBy: req.user.id });
    
    // Award 15 points for posting an opportunity
    await awardPoints(req.user.id, 15);

    // Add activity feed entry
    try {
      const prof = await Profile.findOne({ user: req.user.id });
      await Activity.create({
        user: req.user.id,
        userName: prof?.name || 'Alumni Member',
        userRole: 'alumni',
        type: 'posted_job',
        details: `posted a new job match: ${opp.role} at ${opp.company}`,
      });
    } catch (_) {}

    res.status(201).json(opp);
  } catch (e) {
    console.error('postOpportunity error:', e);
    res.status(500).json({ error: 'Failed to post opportunity.' });
  }
};

// ─── List All Opportunities ──────────────────────────────────────────────────
exports.listOpportunities = async (req, res) => {
  try {
    const { Opportunity, Profile } = getModels();
    const ops = await Opportunity.find();
    const profiles = await Profile.find();
    
    // Convert Mongoose doc to plain object if necessary
    const result = ops.map(op => {
      const plainOp = op.toObject ? op.toObject() : op;
      const prof = profiles.find(p => p.user?.toString() === plainOp.postedBy?.toString());
      return {
        ...plainOp,
        postedByName: prof?.name || 'Alumni',
        postedByCompany: prof?.company || '',
        postedByDepartment: prof?.department || '',
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(result);
  } catch (e) {
    console.error('listOpportunities error:', e);
    res.status(500).json({ error: 'Failed to fetch opportunities.' });
  }
};

// ─── Send Referral Request (student → alumni) ────────────────────────────────
exports.sendReferralRequest = async (req, res) => {
  try {
    const { ReferralRequest, Profile, Notification, Activity, Opportunity } = getModels();
    const alumniId = req.body.alumniId || req.body.alumni;
    const { opportunityId, message } = req.body;

    if (!alumniId) return res.status(400).json({ error: 'Alumni ID is required.' });

    const studentProf = await Profile.findOne({ user: req.user.id });

    // Check for duplicate — only if opportunityId is also the same
    const existing = await ReferralRequest.findOne({
      student: req.user.id,
      alumni: alumniId,
      opportunity: opportunityId || null,
    });
    if (existing) return res.status(400).json({ error: 'You have already sent a request to this alumni.' });

    const request = await ReferralRequest.create({
      student: req.user.id,
      alumni: alumniId,
      opportunity: opportunityId || null,
      message,
      studentName: studentProf?.name || req.user.email,
      status: 'pending',
    });

    // Create a notification for the alumni
    try {
      const opp = opportunityId ? await Opportunity.findById(opportunityId) : null;
      const oppTitle = opp ? `${opp.role} at ${opp.company}` : 'general position';
      await Notification.create({
        user: alumniId,
        title: 'New Referral Request 📩',
        content: `${studentProf?.name || req.user.email} requested a referral for ${oppTitle}.`,
      });
    } catch (_) {}

    // Add activity feed entry
    try {
      await Activity.create({
        user: req.user.id,
        userName: studentProf?.name || req.user.email,
        userRole: 'student',
        type: 'referral_requested',
        details: `requested a referral from alumni`,
      });
    } catch (_) {}

    res.status(201).json(request);
  } catch (e) {
    console.error('sendReferralRequest error:', e);
    res.status(500).json({ error: 'Failed to send referral request: ' + e.message });
  }
};

// ─── My Referral Requests (student's sent requests) ──────────────────────────
exports.myReferralRequests = async (req, res) => {
  try {
    const { ReferralRequest, Profile, Opportunity } = getModels();
    const requests = await ReferralRequest.find({ student: req.user.id });
    const profiles = await Profile.find();
    const ops = await Opportunity.find();
    const result = requests.map(r => {
      const plainReq = r.toObject ? r.toObject() : r;
      const alumProf = profiles.find(p => p.user?.toString() === plainReq.alumni?.toString());
      const opp = ops.find(o => o._id?.toString() === plainReq.opportunity?.toString());
      return {
        ...plainReq,
        alumniName: alumProf?.name || 'Alumni Member',
        alumniCompany: alumProf?.company || '',
        opportunityTitle: opp ? `${opp.role} at ${opp.company}` : 'General Referral Checkup',
      };
    });
    res.json(result);
  } catch (e) {
    console.error('myReferralRequests error:', e);
    res.status(500).json({ error: 'Failed to fetch your referral requests.' });
  }
};

// ─── Incoming Requests for Alumni ────────────────────────────────────────────
exports.incomingReferralRequests = async (req, res) => {
  try {
    const { ReferralRequest, Profile, Opportunity } = getModels();
    const requests = await ReferralRequest.find({ alumni: req.user.id });
    const profiles = await Profile.find();
    const ops = await Opportunity.find();
    const result = requests.map(r => {
      const plainReq = r.toObject ? r.toObject() : r;
      const studProf = profiles.find(p => p.user?.toString() === plainReq.student?.toString());
      const opp = ops.find(o => o._id?.toString() === plainReq.opportunity?.toString());
      return {
        ...plainReq,
        studentName: studProf?.name || plainReq.studentName || 'Student',
        studentDepartment: studProf?.department || '',
        studentSkills: studProf?.skills || [],
        opportunityTitle: opp ? `${opp.role} at ${opp.company}` : 'General Referral Checkup',
      };
    });
    res.json(result);
  } catch (e) {
    console.error('incomingReferralRequests error:', e);
    res.status(500).json({ error: 'Failed to fetch incoming requests.' });
  }
};

// ─── Respond to Referral Request ────────────────────────────────────────────
exports.respondToRequest = async (req, res) => {
  try {
    const { ReferralRequest, Notification, Activity, Profile, Opportunity } = getModels();
    const { status } = req.body; // 'accepted' | 'declined'
    if (!['accepted', 'declined'].includes(status)) return res.status(400).json({ error: 'Invalid status.' });
    
    const request = await ReferralRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!request) return res.status(404).json({ error: 'Request not found.' });

    // Award 30 points to alumni if they accept and refer the student
    if (status === 'accepted') {
      await awardPoints(request.alumni, 30);
    }

    // Create a notification for the student
    try {
      const alumProf = await Profile.findOne({ user: request.alumni });
      const opp = request.opportunity ? await Opportunity.findById(request.opportunity) : null;
      const oppTitle = opp ? `${opp.role} at ${opp.company}` : 'general position';
      await Notification.create({
        user: request.student,
        title: status === 'accepted' ? 'Referral Accepted! 🎉' : 'Referral Update ✉',
        content: `Your referral request for ${oppTitle} has been ${status} by ${alumProf?.name || 'an Alumni'}.`,
      });
    } catch (_) {}

    // Add activity feed entry
    try {
      if (status === 'accepted') {
        const alumProf = await Profile.findOne({ user: request.alumni });
        await Activity.create({
          user: request.alumni,
          userName: alumProf?.name || 'Alumni Member',
          userRole: 'alumni',
          type: 'referral_accepted',
          details: `accepted a referral request for a student`,
        });
      }
    } catch (_) {}

    res.json(request);
  } catch (e) {
    console.error('respondToRequest error:', e);
    res.status(500).json({ error: 'Failed to update request.' });
  }
};

// ─── Leaderboard ─────────────────────────────────────────────────────────────
exports.getLeaderboard = async (req, res) => {
  try {
    const { User, Profile, Opportunity, ReferralRequest } = getModels();
    const alumniList = await User.find({ role: 'alumni' });
    const profiles = await Profile.find();

    const leaderboard = await Promise.all(alumniList.map(async (u) => {
      const prof = profiles.find(p => p.user?.toString() === u._id?.toString());
      
      let oppsPostedCount = 0;
      let referralsApprovedCount = 0;

      if (global.useFallbackDb) {
        const opps = await Opportunity.find() || [];
        oppsPostedCount = opps.filter(o => o.postedBy?.toString() === u._id?.toString()).length;

        const reqs = await ReferralRequest.find() || [];
        referralsApprovedCount = reqs.filter(r => r.alumni?.toString() === u._id?.toString() && r.status === 'accepted').length;
      } else {
        oppsPostedCount = await Opportunity.countDocuments({ postedBy: u._id });
        referralsApprovedCount = await ReferralRequest.countDocuments({ alumni: u._id, status: 'accepted' });
      }

      const actualPoints = (oppsPostedCount * 15) + (referralsApprovedCount * 30);

      return {
        id: u._id,
        name: prof?.name || u.email.split('@')[0],
        company: prof?.company || '',
        designation: prof?.designation || '',
        contributionPoints: actualPoints,
      };
    }));

    leaderboard.sort((a, b) => b.contributionPoints - a.contributionPoints);

    res.json(leaderboard);
  } catch (e) {
    console.error('getLeaderboard error:', e);
    res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
};
