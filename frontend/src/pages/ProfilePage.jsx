import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { api } from '../services/api';

export default function ProfilePage({ user, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(user.skills || []);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      const updated = [...skills, s];
      setSkills(updated);
      setSkillInput('');
    }
  };

  const removeSkill = (s) => setSkills(skills.filter((x) => x !== s));

  const save = async () => {
    try {
      const updated = await api.put('/profile/me', { skills });
      onUpdate?.(updated);
      setEditing(false);
    } catch (err) {
      alert(err.message || 'Failed to update profile skills');
    }
  };

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <Badge tone={user.role === 'alumni' ? 'green' : 'blue'}>
          {user.role === 'alumni' ? 'Alumni' : 'Student'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <p className="text-gray-500">Department</p>
          <p className="text-gray-200">{user.department || '—'}</p>
        </div>
        <div>
          <p className="text-gray-500">Graduation Year</p>
          <p className="text-gray-200">{user.graduationYear || '—'}</p>
        </div>
        {user.role === 'alumni' && (
          <>
            <div>
              <p className="text-gray-500">Company</p>
              <p className="text-gray-200">{user.company || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Job Role</p>
              <p className="text-gray-200">{user.jobRole || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Industry</p>
              <p className="text-gray-200">{user.industry || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Experience</p>
              <p className="text-gray-200">{user.experience ? `${user.experience} yrs` : '—'}</p>
            </div>
          </>
        )}
        {user.role === 'student' && (
          <div>
            <p className="text-gray-500">Resume</p>
            <p className="text-gray-200">{user.resumeUploaded ? 'Uploaded' : 'Not uploaded'}</p>
          </div>
        )}
      </div>

      <div>
        <p className="text-gray-500 text-sm mb-2">Skills</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {skills.length === 0 && <span className="text-gray-600 text-sm">No skills added yet.</span>}
          {skills.map((s) => (
            <Badge key={s} tone="default" className="gap-1">
              {s}
              {editing && (
                <button onClick={() => removeSkill(s)} className="ml-1 text-gray-500 hover:text-red-400">×</button>
              )}
            </Badge>
          ))}
        </div>
        {editing && (
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill and press Enter"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button variant="outline" onClick={addSkill}>Add</Button>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {editing ? (
          <>
            <Button onClick={save}>Save Changes</Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          </>
        ) : (
          <Button variant="outline" onClick={() => setEditing(true)}>Edit Skills</Button>
        )}
      </div>
    </Card>
  );
}
