const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '..', 'data_store.json');

const defaultStore = () => ({
  users: [],
  profiles: [],
  resumes: [],
  opportunities: [],
  referralrequests: [],
  notifications: [],
  activities: [],
  messages: [],
});

const getStore = () => {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      fs.writeFileSync(STORE_PATH, JSON.stringify(defaultStore(), null, 2));
      return defaultStore();
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.referralrequests) parsed.referralrequests = [];
    if (!parsed.notifications) parsed.notifications = [];
    if (!parsed.activities) parsed.activities = [];
    if (!parsed.messages) parsed.messages = [];
    return parsed;
  } catch (e) {
    return defaultStore();
  }
};

const saveStore = (data) => {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
};

const newId = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
};

// ─── User ────────────────────────────────────────────────────────────────────
const User = {
  findOne: async (query) => {
    const s = getStore();
    return s.users.find(u => {
      if (query._id && u._id !== query._id.toString()) return false;
      if (query.email && u.email.toLowerCase() !== query.email.toLowerCase()) return false;
      return true;
    }) || null;
  },
  findById: async (id) => {
    const s = getStore();
    return s.users.find(u => u._id === id.toString()) || null;
  },
  findByIdAndUpdate: async (id, update, opts = {}) => {
    const s = getStore();
    const idx = s.users.findIndex(u => u._id === id.toString());
    if (idx === -1) return null;
    s.users[idx] = { ...s.users[idx], ...update };
    saveStore(s);
    return s.users[idx];
  },
  findByIdAndDelete: async (id) => {
    const s = getStore();
    const u = s.users.find(x => x._id === id.toString());
    s.users = s.users.filter(x => x._id !== id.toString());
    saveStore(s);
    return u || null;
  },
  create: async (data) => {
    const s = getStore();
    const u = { _id: newId(), ...data, createdAt: new Date().toISOString() };
    s.users.push(u);
    saveStore(s);
    return u;
  },
  find: async (query = {}) => {
    const s = getStore();
    let list = s.users;
    if (query.role) list = list.filter(u => u.role === query.role);
    return list;
  },
  countDocuments: async (query = {}) => {
    const s = getStore();
    let list = s.users;
    if (query.role) list = list.filter(u => u.role === query.role);
    return list.length;
  },
  save: async function () {
    const s = getStore();
    const idx = s.users.findIndex(u => u._id === this._id);
    if (idx !== -1) s.users[idx] = { ...s.users[idx], ...this };
    saveStore(s);
    return this;
  },
};

// ─── Profile ─────────────────────────────────────────────────────────────────
const Profile = {
  findOne: async (query) => {
    const s = getStore();
    return s.profiles.find(p => {
      if (query.user && p.user !== query.user.toString()) return false;
      return true;
    }) || null;
  },
  find: async () => {
    const s = getStore();
    return s.profiles;
  },
  create: async (data) => {
    const s = getStore();
    const p = { _id: newId(), ...data, user: data.user?.toString(), skills: data.skills || [], createdAt: new Date().toISOString() };
    s.profiles.push(p);
    saveStore(s);
    return p;
  },
  findOneAndUpdate: async (query, update, opts = {}) => {
    const s = getStore();
    const idx = s.profiles.findIndex(p => {
      if (query.user && p.user !== query.user.toString()) return false;
      return true;
    });
    if (idx === -1) {
      if (opts.upsert) {
        const p = { _id: newId(), ...query, ...update, user: query.user?.toString(), skills: update.skills || [], createdAt: new Date().toISOString() };
        s.profiles.push(p);
        saveStore(s);
        return p;
      }
      return null;
    }
    s.profiles[idx] = { ...s.profiles[idx], ...update, updatedAt: new Date().toISOString() };
    saveStore(s);
    return s.profiles[idx];
  },
  findOneAndDelete: async (query) => {
    const s = getStore();
    const p = s.profiles.find(x => x.user === query.user?.toString());
    s.profiles = s.profiles.filter(x => x.user !== query.user?.toString());
    saveStore(s);
    return p || null;
  },
};

// ─── Resume ──────────────────────────────────────────────────────────────────
const Resume = {
  findOne: async (query) => {
    const s = getStore();
    return s.resumes.find(r => r.user === query.user?.toString()) || null;
  },
  create: async (data) => {
    const s = getStore();
    const r = { _id: newId(), ...data, user: data.user?.toString(), createdAt: new Date().toISOString() };
    s.resumes.push(r);
    saveStore(s);
    return r;
  },
  findOneAndUpdate: async (query, update, opts = {}) => {
    const s = getStore();
    const idx = s.resumes.findIndex(r => r.user === query.user?.toString());
    if (idx === -1) {
      if (opts.upsert) {
        const r = { _id: newId(), user: query.user?.toString(), ...update, createdAt: new Date().toISOString() };
        s.resumes.push(r);
        saveStore(s);
        return r;
      }
      return null;
    }
    s.resumes[idx] = { ...s.resumes[idx], ...update, updatedAt: new Date().toISOString() };
    saveStore(s);
    return s.resumes[idx];
  },
};

// ─── Opportunity ─────────────────────────────────────────────────────────────
const Opportunity = {
  find: async () => {
    const s = getStore();
    return [...s.opportunities].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  countDocuments: async () => {
    const s = getStore();
    return s.opportunities.length;
  },
  create: async (data) => {
    const s = getStore();
    const op = { 
      _id: newId(), 
      ...data, 
      postedBy: data.postedBy?.toString(), 
      hasReferralOption: data.hasReferralOption !== undefined ? !!data.hasReferralOption : true,
      createdAt: new Date().toISOString() 
    };
    s.opportunities.push(op);
    saveStore(s);
    return op;
  },
};

// ─── ReferralRequest ─────────────────────────────────────────────────────────
const ReferralRequest = {
  findOne: async (query) => {
    const s = getStore();
    return s.referralrequests.find(r => {
      if (query.student && r.student !== query.student.toString()) return false;
      if (query.alumni && r.alumni !== query.alumni.toString()) return false;
      if (query.opportunity != null && r.opportunity !== query.opportunity.toString()) return false;
      return true;
    }) || null;
  },
  find: async (query = {}) => {
    const s = getStore();
    let list = s.referralrequests;
    if (query.student) list = list.filter(r => r.student === query.student.toString());
    if (query.alumni) list = list.filter(r => r.alumni === query.alumni.toString());
    return list;
  },
  create: async (data) => {
    const s = getStore();
    const r = { _id: newId(), ...data, student: data.student?.toString(), alumni: data.alumni?.toString(), opportunity: data.opportunity?.toString(), createdAt: new Date().toISOString() };
    s.referralrequests.push(r);
    saveStore(s);
    return r;
  },
  findByIdAndUpdate: async (id, update, opts = {}) => {
    const s = getStore();
    const idx = s.referralrequests.findIndex(r => r._id === id.toString());
    if (idx === -1) return null;
    s.referralrequests[idx] = { ...s.referralrequests[idx], ...update };
    saveStore(s);
    return s.referralrequests[idx];
  }
};

// ─── Notification ───────────────────────────────────────────────────────────
const Notification = {
  find: async (query = {}) => {
    const s = getStore();
    let list = s.notifications;
    if (query.user) list = list.filter(n => n.user === query.user.toString());
    return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  create: async (data) => {
    const s = getStore();
    const n = { _id: newId(), ...data, user: data.user?.toString(), isRead: false, createdAt: new Date().toISOString() };
    s.notifications.push(n);
    saveStore(s);
    return n;
  },
  updateMany: async (query, update) => {
    const s = getStore();
    s.notifications.forEach(n => {
      if (query.user && n.user === query.user.toString()) {
        Object.assign(n, update);
      }
    });
    saveStore(s);
    return { ok: true };
  }
};

// ─── Activity ──────────────────────────────────────────────────────────────
const Activity = {
  find: async () => {
    const s = getStore();
    return [...s.activities].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 15);
  },
  create: async (data) => {
    const s = getStore();
    const act = { _id: newId(), ...data, user: data.user?.toString(), createdAt: new Date().toISOString() };
    s.activities.push(act);
    saveStore(s);
    return act;
  }
};

// ─── Message ───────────────────────────────────────────────────────────────
const Message = {
  find: async (query = {}) => {
    const s = getStore();
    let list = s.messages;
    if (query.receiver) list = list.filter(m => m.receiver === query.receiver.toString());
    if (query.sender) list = list.filter(m => m.sender === query.sender.toString());
    if (query.$or) {
      list = s.messages.filter(m => {
        return query.$or.some(cond => {
          return Object.keys(cond).every(key => m[key] === cond[key].toString());
        });
      });
    }
    return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  create: async (data) => {
    const s = getStore();
    const m = { _id: newId(), ...data, sender: data.sender?.toString(), receiver: data.receiver?.toString(), createdAt: new Date().toISOString() };
    s.messages.push(m);
    saveStore(s);
    return m;
  }
};

module.exports = { User, Profile, Resume, Opportunity, ReferralRequest, Notification, Activity, Message };
