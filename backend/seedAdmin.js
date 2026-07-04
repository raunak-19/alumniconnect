/**
 * seedAdmin.js — run once with: node seedAdmin.js
 * Seeds the admin account + sample alumni/student data into MongoDB Atlas.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Profile = require('./models/Profile');
const Opportunity = require('./models/Opportunity');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const seedUsers = [
  {
    email: 'admin@nitjsr.ac.in',
    password: 'admin123',
    role: 'admin',
    graduationYear: 2020,
    isVerified: true,
    profile: { name: 'Placement Cell Admin', department: 'Training & Placement Cell' },
  },
  {
    email: 'ravi.kumar@nitjsr.ac.in',
    password: 'password123',
    role: 'alumni',
    graduationYear: 2021,
    isVerified: true,
    profile: { name: 'Ravi Kumar', department: 'Computer Science and Engineering (CSE)', company: 'Amazon', designation: 'SDE II' },
  },
  {
    email: 'sneha.das@nitjsr.ac.in',
    password: 'password123',
    role: 'alumni',
    graduationYear: 2019,
    isVerified: true,
    profile: { name: 'Sneha Das', department: 'Electronics and Communication Engineering (ECE)', company: 'Deloitte', designation: 'Senior Consultant' },
  },
  {
    email: 'arjun.singh@nitjsr.ac.in',
    password: 'password123',
    role: 'alumni',
    graduationYear: 2022,
    isVerified: true,
    profile: { name: 'Arjun Singh', department: 'Mechanical Engineering (ME)', company: 'Tata Steel', designation: 'Graduate Engineer Trainee' },
  },
  {
    email: 'saksham123@gamil.com',
    password: 'Saksham123',
    role: 'alumni',
    graduationYear: 2020,
    isVerified: true,
    profile: { name: 'Saksham Sagar', department: 'Metallurgical and Materials Engineering (MME)', company: 'Tata Motors', designation: 'Manager' },
  },
  {
    email: 'aditi.sharma@nitjsr.ac.in',
    password: 'password123',
    role: 'student',
    graduationYear: 2027,
    isVerified: true,
    profile: { name: 'Aditi Sharma', department: 'Computer Science and Engineering (CSE)', skills: ['React', 'Python', 'DSA'] },
  },
  {
    email: '2025ugee045@nitjsr.ac.in',
    password: 'password123',
    role: 'student',
    graduationYear: 2029,
    isVerified: true,
    profile: { name: 'Raunak Srivastava', department: 'Electrical Engineering (EE)', skills: [] },
  },
];

const seedOpportunities = [
  {
    company: 'Amazon',
    role: 'SDE Intern',
    type: 'Internship',
    description: 'Software Development internship at Amazon for pre-final year students.',
    skillsRequired: ['Data Structures', 'Java', 'Problem Solving'],
    deadline: new Date('2026-08-15'),
    referralLink: 'https://amazon.jobs/en/teams/university',
    hasReferralOption: true,
  },
  {
    company: 'Deloitte',
    role: 'Analyst - Consulting',
    type: 'Full-Time',
    description: 'Consulting analyst role at Deloitte for 2026 graduates.',
    skillsRequired: ['Communication', 'Excel', 'Case Solving'],
    deadline: new Date('2026-07-30'),
    referralLink: 'https://careers.deloitte.com',
    hasReferralOption: true,
  },
  {
    company: 'Tata Steel',
    role: 'Graduate Engineer Trainee',
    type: 'Full-Time',
    description: 'GET program at Tata Steel for Mechanical / Metallurgy branches.',
    skillsRequired: ['CAD', 'Manufacturing Basics'],
    deadline: new Date('2026-08-05'),
    referralLink: 'https://www.tatasteel.com/careers',
    hasReferralOption: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
    console.log('✓ Connected to MongoDB Atlas');

    // Seed users
    for (const u of seedUsers) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        console.log(`  ↳ User ${u.email} already exists — skipping`);
        continue;
      }
      const hashed = await bcrypt.hash(u.password, 12);
      const created = await User.create({
        email: u.email,
        password: hashed,
        role: u.role,
        graduationYear: u.graduationYear,
        isVerified: u.isVerified,
        contributionPoints: u.contributionPoints || 0,
      });
      await Profile.create({
        user: created._id,
        name: u.profile.name,
        department: u.profile.department || '',
        skills: u.profile.skills || [],
        company: u.profile.company || '',
        designation: u.profile.designation || '',
      });
      console.log(`  ✓ Created ${u.role}: ${u.email}`);
    }

    // Seed opportunities (only if none exist)
    const opCount = await Opportunity.countDocuments();
    if (opCount === 0) {
      const alumniUser = await User.findOne({ role: 'alumni' });
      for (const op of seedOpportunities) {
        await Opportunity.create({ ...op, postedBy: alumniUser?._id });
        console.log(`  ✓ Created opportunity: ${op.role} @ ${op.company}`);
      }
    } else {
      console.log(`  ↳ ${opCount} opportunities already exist — skipping`);
    }

    console.log('\n✅ Seed complete!\n');
    console.log('  Admin login:   admin@nitjsr.ac.in  /  admin123');
    console.log('  Student login: aditi.sharma@nitjsr.ac.in  /  password123');
    console.log('  Alumni login:  ravi.kumar@nitjsr.ac.in  /  password123');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
