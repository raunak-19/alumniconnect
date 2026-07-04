export const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
export const API_URL = `${BASE_URL}/api`;

const getToken = () => localStorage.getItem('alumniconnect_token');

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${response.status}`);
  }
  return response.json();
};

export const api = {
  get: (url) => fetchWithAuth(url, { method: 'GET' }),
  post: (url, body) => fetchWithAuth(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => fetchWithAuth(url, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (url, body) => fetchWithAuth(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (url) => fetchWithAuth(url, { method: 'DELETE' }),
};
