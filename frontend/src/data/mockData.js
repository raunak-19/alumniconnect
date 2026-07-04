// Lightweight client-side "database" used so the app is fully demoable
// without a live MongoDB instance. Shape mirrors the real Mongoose models
// (User, Profile, Opportunity) so swapping in backend/services/api.js later
// is a drop-in replacement.

const DB_KEY = 'alumniconnect_db_v1';

const seed = {
  users: [
    {
      id: 'u-admin',
      email: 'admin@nitjsr.ac.in',
      password: 'admin123',
      role: 'admin',
      name: 'Placement Cell Admin',
      department: 'Training & Placement Cell',
      graduationYear: null,
      isVerified: true,
      createdAt: '2024-01-10',
    },
    {
      id: 'u-alumni-1',
      email: 'ravi.kumar@nitjsr.ac.in',
      password: 'password123',
      role: 'alumni',
      name: 'Ravi Kumar',
      department: 'Computer Science and Engineering (CSE)',
      graduationYear: 2021,
      company: 'Amazon',
      jobRole: 'SDE II',
      industry: 'Technology',
      experience: 5,
      skills: ['System Design', 'AWS', 'Java', 'Distributed Systems'],
      contributionPoints: 480,
      referralSuccessRate: 0.72,
      responsiveness: 0.91,
      seniority: 5,
      isVerified: true,
      badge: 'Top Contributor',
    },
    {
      id: 'u-alumni-2',
      email: 'sneha.das@nitjsr.ac.in',
      password: 'password123',
      role: 'alumni',
      name: 'Sneha Das',
      department: 'Electronics and Communication Engineering (ECE)',
      graduationYear: 2019,
      company: 'Deloitte',
      jobRole: 'Senior Consultant',
      industry: 'Consulting',
      experience: 7,
      skills: ['Strategy', 'Data Analytics', 'Client Management'],
      contributionPoints: 310,
      referralSuccessRate: 0.58,
      responsiveness: 0.75,
      seniority: 7,
      isVerified: true,
      badge: 'Verified Alumni',
    },
    {
      id: 'u-alumni-3',
      email: 'arjun.singh@nitjsr.ac.in',
      password: 'password123',
      role: 'alumni',
      name: 'Arjun Singh',
      department: 'Mechanical Engineering (ME)',
      graduationYear: 2022,
      company: 'Tata Steel',
      jobRole: 'Graduate Engineer Trainee',
      industry: 'Core Engineering',
      experience: 3,
      skills: ['CAD', 'Process Engineering', 'Six Sigma'],
      contributionPoints: 150,
      referralSuccessRate: 0.4,
      responsiveness: 0.6,
      seniority: 3,
      isVerified: true,
      badge: 'Verified Alumni',
    },
    {
      id: 'u-student-1',
      email: 'aditi.sharma@nitjsr.ac.in',
      password: 'password123',
      role: 'student',
      name: 'Aditi Sharma',
      department: 'Computer Science and Engineering (CSE)',
      graduationYear: 2027,
      skills: ['React', 'Python', 'DSA'],
      resumeUploaded: true,
      atsScore: 74,
    },
  ],
  opportunities: [
    {
      id: 'op-1',
      postedBy: 'u-alumni-1',
      postedByName: 'Ravi Kumar',
      company: 'Amazon',
      role: 'SDE Intern',
      type: 'Internship',
      industry: 'Technology',
      eligibility: 'CSE / ECE, Grad Year 2026-2027, CGPA 7.5+',
      requiredSkills: ['Data Structures', 'Java', 'Problem Solving'],
      deadline: '2026-08-15',
      referralLink: 'https://amazon.jobs/en/teams/university',
      seniorityScore: 5,
      contributionScore: 480,
      referralSuccessRate: 0.72,
      postedAt: '2026-06-20',
    },
    {
      id: 'op-2',
      postedBy: 'u-alumni-2',
      postedByName: 'Sneha Das',
      company: 'Deloitte',
      role: 'Analyst - Consulting',
      type: 'Full-Time',
      industry: 'Consulting',
      eligibility: 'All branches, Grad Year 2026, CGPA 7.0+',
      requiredSkills: ['Communication', 'Excel', 'Case Solving'],
      deadline: '2026-07-30',
      referralLink: 'https://careers.deloitte.com',
      seniorityScore: 7,
      contributionScore: 310,
      referralSuccessRate: 0.58,
      postedAt: '2026-06-18',
    },
    {
      id: 'op-3',
      postedBy: 'u-alumni-3',
      postedByName: 'Arjun Singh',
      company: 'Tata Steel',
      role: 'Graduate Engineer Trainee',
      type: 'Full-Time',
      industry: 'Core Engineering',
      eligibility: 'Mechanical / Metallurgy, Grad Year 2026',
      requiredSkills: ['CAD', 'Manufacturing Basics'],
      deadline: '2026-08-05',
      referralLink: 'https://www.tatasteel.com/careers',
      seniorityScore: 3,
      contributionScore: 150,
      referralSuccessRate: 0.4,
      postedAt: '2026-06-15',
    },
  ],
  referralRequests: [
    {
      id: 'rr-1',
      studentId: 'u-student-1',
      studentName: 'Aditi Sharma',
      opportunityId: 'op-1',
      alumniId: 'u-alumni-1',
      status: 'pending',
      message: "Hi Ravi, I'm a CSE '27 student with a strong DSA background — would appreciate a referral for the Amazon SDE Internship.",
      requestedAt: '2026-06-25',
    },
  ],
};

function load() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* fall through to reseed */
  }
  localStorage.setItem(DB_KEY, JSON.stringify(seed));
  return JSON.parse(JSON.stringify(seed));
}

function persist(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export const db = {
  reset() {
    localStorage.setItem(DB_KEY, JSON.stringify(seed));
  },
  getUsers() {
    return load().users;
  },
  findUserByEmail(email) {
    return load().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  createUser(user) {
    const database = load();
    database.users.push(user);
    persist(database);
    return user;
  },
  getOpportunities() {
    return load().opportunities;
  },
  addOpportunity(op) {
    const database = load();
    database.opportunities.unshift(op);
    persist(database);
    return op;
  },
  getReferralRequests() {
    return load().referralRequests;
  },
  addReferralRequest(rr) {
    const database = load();
    database.referralRequests.push(rr);
    persist(database);
    return rr;
  },
  updateReferralStatus(id, status) {
    const database = load();
    const rr = database.referralRequests.find((r) => r.id === id);
    if (rr) rr.status = status;
    persist(database);
    return rr;
  },
  updateUser(id, patch) {
    const database = load();
    const u = database.users.find((x) => x.id === id);
    if (u) Object.assign(u, patch);
    persist(database);
    return u;
  },
};

// Publicly available institutional placement data (guest / visitor view).
// Sourced from published 2025 placement season reports for NIT Jamshedpur
// (see https://www.nitjsr.ac.in/Students/Placements for the official page).
export const placementData = {
  academicYear: '2024-25',
  highestPackageLPA: 144,
  averagePackageLPA: 13.62,
  placementRate: 94.57,
  totalOffers: 700,
  recruitersVisited: 260,
  firstTimeRecruiters: 100,
  branchWise: [
    { branch: 'Computer Science & Engineering (CSE)', placementRate: 93.04, avgPackageLPA: 25.11 },
    { branch: 'Electronics & Communication (ECE)', placementRate: 92.39, avgPackageLPA: 19.0 },
    { branch: 'Electrical Engineering (EE)', placementRate: 91.58, avgPackageLPA: 16.5 },
    { branch: 'Mechanical Engineering (ME)', placementRate: 99.06, avgPackageLPA: 10.2 },
    { branch: 'Civil Engineering (CE)', placementRate: 90.1, avgPackageLPA: 7.39 },
    { branch: 'Production & Industrial Engg (PIE)', placementRate: 90.19, avgPackageLPA: 9.1 },
    { branch: 'Metallurgical & Materials Engg (MME)', placementRate: 100, avgPackageLPA: 9.33 },
  ],
  topRecruiters: [
    'Amazon', 'Adobe', 'Microsoft', 'Deloitte', 'EY', 'Infosys', 'Flipkart',
    'Samsung', 'Tata Steel', 'BNY Mellon', 'Accenture', 'HCL', 'Reliance', 'JP Morgan',
  ],
  sectorDistribution: [
    { sector: 'Software Development', share: 38 },
    { sector: 'Core Engineering', share: 35 },
    { sector: 'Data Science / Analytics', share: 12 },
    { sector: 'Consulting', share: 9 },
    { sector: 'Supply Chain / Other', share: 6 },
  ],
  sourceNote: 'Figures compiled from the 2025 placement season as reported via the institute\u2019s official placement cell disclosures. Visit the official page for the latest verified numbers.',
  sourceUrl: 'https://www.nitjsr.ac.in/Students/Placements',
};

export const collegeInfo = {
  name: 'National Institute of Technology, Jamshedpur',
  shortName: 'NIT Jamshedpur',
  established: 1960,
  status: 'Institute of National Importance',
  location: 'Adityapur, Jamshedpur, Jharkhand, India',
  website: 'https://www.nitjsr.ac.in',
};
