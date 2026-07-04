import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import StudentDashboard from './StudentDashboard';
import AlumniDashboard from './AlumniDashboard';
import AdminDashboard from './AdminDashboard';
import GuestDashboard from './GuestDashboard';

import { API_URL } from '../services/api';

export default function Dashboard() {
  const { user: authUser, token } = useContext(AuthContext);
  const [user, setUser] = useState(authUser);

  // Sync profile data directly from MongoDB at dashboard mount
  useEffect(() => {
    if (token && authUser && authUser.role !== 'guest' && authUser.role !== 'admin') {
      fetch(`${API_URL}/profile/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed');
      })
      .then(profile => {
        setUser({ ...authUser, ...profile });
      })
      .catch(() => {});
    }
  }, [authUser, token]);

  if (!authUser) return null;

  switch (authUser.role) {
    case 'student':
      return <StudentDashboard user={user || authUser} setUser={setUser} />;
    case 'alumni':
      return <AlumniDashboard user={user || authUser} setUser={setUser} />;
    case 'admin':
      return <AdminDashboard />;
    case 'guest':
    default:
      return <GuestDashboard />;
  }
}
