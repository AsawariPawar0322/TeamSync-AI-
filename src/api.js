const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Helper to get headers with JWT token
const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Generic fetch wrapper
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }
  
  return response.json();
}

export const api = {
  // Auth
  register: async (name, email, password) => {
    const res = await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (res.token) {
      localStorage.setItem('token', res.token);
    }
    return res;
  },
  
  login: async (email, password) => {
    const res = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.token) {
      localStorage.setItem('token', res.token);
    }
    return res;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  // Profile
  getProfile: async () => {
    return request('/profile', {
      method: 'GET',
      headers: getHeaders()
    });
  },
  
  updateProfile: async (profileData) => {
    return request('/profile/update', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    });
  },
  
  // Teams
  getTeams: async () => {
    return request('/teams', {
      method: 'GET',
      headers: getHeaders()
    });
  },
  
  createTeam: async (name) => {
    return request('/teams', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name })
    });
  },
  
  inviteTeamMember: async (teamId, memberData) => {
    return request(`/teams/${teamId}/invite`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(memberData)
    });
  },
  
  removeTeamMember: async (teamId, userId) => {
    return request(`/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },
  
  // Dynamic AI Insights
  getTeamAnalysis: async (teamId) => {
    return request(`/teams/${teamId}/analysis`, {
      method: 'GET',
      headers: getHeaders()
    });
  },
  
  // Talent matching
  getTeamTalent: async (teamId) => {
    return request(`/teams/${teamId}/talent`, {
      method: 'GET',
      headers: getHeaders()
    });
  },
  
  // Discover Teams
  getDiscoverTeams: async () => {
    return request('/discover-teams', {
      method: 'GET',
      headers: getHeaders()
    });
  },
  
  // AI Role Assignment
  getAIRoleAssignment: async (teamId) => {
    return request(`/teams/${teamId}/roles`, {
      method: 'GET',
      headers: getHeaders()
    });
  },
  
  // Resume parser
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/upload-resume', {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
  }
};
