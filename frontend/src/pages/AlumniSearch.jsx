import React, { useMemo, useState } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { db } from '../data/mockData';

// Ranks alumni for a searching student using a weighted blend of company/skill
// relevance (implicit via filter match), responsiveness, and referral success —
// matching the PS's "Alumni Discovery" ranking rule.
function scoreAlumnus(a) {
  return (
    a.seniority * 0.25 +
    (a.referralSuccessRate || 0) * 100 * 0.4 +
    (a.responsiveness || 0) * 100 * 0.35
  );
}

export default function AlumniSearch({ student, onRequestReferral }) {
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('All');

  const alumni = db.getUsers().filter((u) => u.role === 'alumni');
  const industries = ['All', ...new Set(alumni.map((a) => a.industry).filter(Boolean))];

  const results = useMemo(() => {
    const q = query.toLowerCase();
    return alumni
      .filter((a) => industry === 'All' || a.industry === industry)
      .filter((a) =>
        !q ||
        a.company?.toLowerCase().includes(q) ||
        a.jobRole?.toLowerCase().includes(q) ||
        a.department?.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q)
      )
      .sort((a, b) => scoreAlumnus(b) - scoreAlumnus(a));
  }, [query, industry]);

  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-1">Alumni Discovery</h3>
      <p className="text-sm text-gray-500 mb-4">Search by company, role, industry, or department. Ranked by relevance, responsiveness & referral success.</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Input placeholder="Search company, role, department…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select
          value={industry} onChange={(e) => setIndustry(e.target.value)}
          className="bg-[#0d111c] border border-gray-800 rounded-md px-4 py-3 text-gray-200 text-sm focus:outline-none focus:border-[#4f6ef7]"
        >
          {industries.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {results.length === 0 && <p className="text-gray-500 text-sm">No alumni match your search.</p>}
        {results.map((a) => (
          <div key={a.id} className="p-4 bg-[#0d111c] border border-gray-800 rounded-lg flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-gray-100 font-medium">{a.name}</h4>
                <Badge tone="green">{a.badge || 'Alumni'}</Badge>
              </div>
              <p className="text-sm text-gray-400">{a.jobRole} at {a.company}</p>
              <p className="text-xs text-gray-500 mt-1">{a.department} · Class of {a.graduationYear} · {a.industry}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(a.skills || []).map((s) => <Badge key={s} tone="default">{s}</Badge>)}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Referral success {Math.round((a.referralSuccessRate || 0) * 100)}% · Responsiveness {Math.round((a.responsiveness || 0) * 100)}%
              </p>
            </div>
            {student && (
              <Button variant="outline" onClick={() => onRequestReferral?.(a)} className="whitespace-nowrap">
                Request Referral
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
