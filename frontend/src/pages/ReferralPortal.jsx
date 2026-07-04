import React, { useMemo, useState } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { db } from '../data/mockData';

// For duplicate/identical openings, referral links from alumni with higher
// seniority, contribution score, and referral success rate are prioritized —
// directly mirrors the PS's Referral & Opportunity Portal rule.
function rankOpportunities(opportunities) {
  return [...opportunities].sort((a, b) => {
    const scoreA = a.seniorityScore * 0.3 + a.contributionScore * 0.01 + a.referralSuccessRate * 100 * 0.4;
    const scoreB = b.seniorityScore * 0.3 + b.contributionScore * 0.01 + b.referralSuccessRate * 100 * 0.4;
    return scoreB - scoreA;
  });
}

export default function ReferralPortal({ user, refreshKey, onDataChanged }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    company: '', role: '', type: 'Internship', eligibility: '', requiredSkills: '', deadline: '', referralLink: '',
  });

  const opportunities = useMemo(() => rankOpportunities(db.getOpportunities()), [refreshKey]);

  const handlePost = (e) => {
    e.preventDefault();
    db.addOpportunity({
      id: `op-${Date.now()}`,
      postedBy: user.id,
      postedByName: user.name,
      company: form.company,
      role: form.role,
      type: form.type,
      industry: user.industry || 'General',
      eligibility: form.eligibility,
      requiredSkills: form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      deadline: form.deadline,
      referralLink: form.referralLink,
      seniorityScore: user.seniority || 1,
      contributionScore: user.contributionPoints || 0,
      referralSuccessRate: user.referralSuccessRate || 0.5,
      postedAt: new Date().toISOString().slice(0, 10),
    });
    setForm({ company: '', role: '', type: 'Internship', eligibility: '', requiredSkills: '', deadline: '', referralLink: '' });
    setShowForm(false);
    onDataChanged?.();
  };

  const requestReferral = (op) => {
    db.addReferralRequest({
      id: `rr-${Date.now()}`,
      studentId: user.id,
      studentName: user.name,
      opportunityId: op.id,
      alumniId: op.postedBy,
      status: 'pending',
      message: `Hi ${op.postedByName}, I'm interested in the ${op.role} opening at ${op.company} and would appreciate a referral.`,
      requestedAt: new Date().toISOString().slice(0, 10),
    });
    onDataChanged?.();
    alert('Referral request sent!');
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold text-white">Referral & Opportunity Portal</h3>
        {user.role === 'alumni' && (
          <Button variant="outline" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Cancel' : '+ Post Opportunity'}
          </Button>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-4">
        {user.role === 'alumni'
          ? 'Post internships, full-time roles, or referral opportunities for students.'
          : 'Ranked by referring alumni seniority, contribution score, and referral success rate.'}
      </p>

      {showForm && (
        <form onSubmit={handlePost} className="grid grid-cols-2 gap-3 mb-6 p-4 bg-[#0d111c] border border-gray-800 rounded-lg">
          <Input placeholder="Company" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <Input placeholder="Role" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <select
            value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="bg-[#111625] border border-gray-800 rounded-md px-4 py-3 text-gray-200 text-sm"
          >
            <option>Internship</option>
            <option>Full-Time</option>
            <option>Referral</option>
          </select>
          <Input type="date" required value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          <Input className="col-span-2" placeholder="Eligibility (branch, grad year, CGPA)" required value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} />
          <Input className="col-span-2" placeholder="Required skills (comma separated)" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} />
          <Input className="col-span-2" placeholder="Referral / application link" required value={form.referralLink} onChange={(e) => setForm({ ...form, referralLink: e.target.value })} />
          <Button type="submit" className="col-span-2">Post Opportunity</Button>
        </form>
      )}

      <div className="space-y-3">
        {opportunities.map((op) => (
          <div key={op.id} className="p-4 bg-[#0d111c] border border-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-gray-100 font-medium">{op.role} — {op.company}</h4>
              <Badge tone={op.type === 'Internship' ? 'blue' : 'green'}>{op.type}</Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">Eligibility: {op.eligibility} · Deadline: {op.deadline}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(op.requiredSkills || []).map((s) => <Badge key={s}>{s}</Badge>)}
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-gray-600">Posted by {op.postedByName}</p>
              <div className="flex gap-2">
                <a href={op.referralLink} target="_blank" rel="noreferrer" className="text-sm text-[#6f8bfa] hover:underline self-center">
                  Application Link →
                </a>
                {user.role === 'student' && (
                  <Button variant="outline" onClick={() => requestReferral(op)}>Request Referral</Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
