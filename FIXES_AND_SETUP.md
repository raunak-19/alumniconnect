# AlumniConnect — Bugs Fixed & How to Run

## Bugs found and fixed

**Empty stub files (0 bytes) that broke the app:**
- `frontend/src/components/Navbar.jsx` — rebuilt, shows role badge + logout.
- `frontend/src/components/ui/{Button,Card,Badge,Input,Skeleton}.jsx` — rebuilt as a small reusable UI kit and actually wired into every page.
- `frontend/src/pages/{AICopilot,AlumniSearch,ProfilePage,ReferralPortal}.jsx` — fully implemented (see below).
- `backend/controllers/dashboardController.js`, `backend/models/AIReport.js` — were empty and unreferenced anywhere; removed as dead code.

**Broken navigation/auth flow:**
- `App.jsx` only ever routed `/login` and `/dashboard` — `Register`, `AICopilot`, `AlumniSearch`, `ProfilePage`, `ReferralPortal` were unreachable. Added `/register`, and folded the others into role-based dashboards as tabs.
- `Login.jsx`'s submit handler only did `console.log(...)` — it never called the backend or the auth context, and never navigated anywhere. Same for "Continue as Guest" (just an `alert()`). Both are now fully functional.
- `Register.jsx` was a near-duplicate of `RegisterForm.jsx` (removed the duplicate) and also only `alert()`-ed on submit instead of creating an account or navigating.
- `Dashboard.jsx` rendered one identical generic view regardless of role, which didn't satisfy the problem statement's per-role feature split. It's now a router (`pages/Dashboard.jsx`) that renders `StudentDashboard` / `AlumniDashboard` / `AdminDashboard` / `GuestDashboard`.

**Other bugs:**
- `index.css` mixed Tailwind v4's `@import "tailwindcss"` with v3's `@tailwind base/components/utilities` directives — redundant/conflicting; cleaned up to the v4 syntax only.
- `backend/config/db.js` called `process.exit(1)` on a failed Mongo connection, hard-crashing the whole server instead of degrading gracefully.
- `backend/models/Opportunity.js`'s `type` enum was `['Internship', 'Job', 'Referral Opportunity']` but the intended frontend value is `'Full-Time'` — fixed the enum, and made `description` optional instead of required (frontend doesn't collect it).
- `backend/controllers/referralController.js`'s `createOpportunity` had no role check, so any authenticated user (not just alumni) could post an opportunity — added a 403 guard per the PS's security rules.

## Design decision: demo mode

There's no live MongoDB instance available to actually run the Express backend end-to-end here, so the **frontend now runs as a fully working, self-contained demo**: `frontend/src/data/mockData.js` acts as a mock database (backed by `localStorage`), seeded with demo accounts, opportunities, and referral requests. This mirrors the real Mongoose schemas, so wiring it back up to `backend/services` + `services/api.js` later is a drop-in swap, not a rewrite.

The real Express/Mongo backend code is still there and fixed, but wasn't the thing driving the demo below — set `MONGO_URI` in `backend/.env` to a real cluster and it'll come up normally (`npm start` inside `backend/`).

## Running the frontend demo

```
cd alumniconnect/frontend
npm install
npm run dev
```

Demo accounts (shown as one-tap buttons on the login screen too):
| Role | Email | Password |
|---|---|---|
| Student | aditi.sharma@nitjsr.ac.in | password123 |
| Alumni | ravi.kumar@nitjsr.ac.in | password123 |
| Admin | admin@nitjsr.ac.in | admin123 |

Or click **Continue as Guest** for the public dashboard (no login) — this shows general institute info and real placement statistics (highest package, average package, branch-wise breakdown, top recruiters, sector distribution) sourced from published NIT Jamshedpur 2025 placement season reports; see `nitjsr.ac.in/Students/Placements` for the official, most current figures.

## What each role's dashboard does (per the problem statement)

- **Student:** Overview (open opportunities, my referral requests, ATS score), Alumni Discovery (search + ranked results), Referral & Opportunity Portal (browse + request referral), AI Career Assistant (resume ATS scoring, referral message generator, career roadmap), Profile (skills editor).
- **Alumni:** Overview (contribution points, posts, pending requests) + contribution leaderboard, Post & Manage Opportunities, incoming Referral Requests (accept/decline — accepting awards contribution points), Profile.
- **Administrator:** Platform analytics (user counts, department distribution, referral status breakdown), Manage Users (table of all accounts/roles/verification), Platform Activity (all posted opportunities).
- **Guest:** Public college info + real placement statistics only — no access to profiles/opportunities, matching the PS's visitor security rule.
