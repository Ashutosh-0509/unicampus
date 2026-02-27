/**
 * API service for connecting frontend to the Express backend.
 * All API calls go through here.
 */

// ✅ Production URL - Render backend
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'; // Fallback to local if env not set

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('unicampus_token_2026');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

// ─── Auth ───
export const authApi = {
  login: (identifier: string, role: string) =>
    apiRequest<{ user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, role }),
    }),

  register: (data: { name: string; email: string; role: string; studentId?: string; facultyId?: string; branch?: string }) =>
    apiRequest<{ user: any; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => apiRequest<{ user: any }>('/api/auth/me'),
};

// ─── Users ───
export const usersApi = {
  getAll: (role?: string) =>
    apiRequest<any[]>(`/api/users${role ? `?role=${role}` : ''}`),

  getById: (id: string) =>
    apiRequest<any>(`/api/users/${id}`),

  update: (id: string, data: any) =>
    apiRequest<any>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ─── Attendance ───
export const attendanceApi = {
  getAll: (studentId?: string) =>
    apiRequest<any[]>(`/api/attendance${studentId ? `?studentId=${studentId}` : ''}`),

  mark: (data: { studentId: string; subject: string; attended: number; total: number; faculty?: string; credits?: number }) =>
    apiRequest<any>('/api/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/api/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ─── Assignments ───
export const assignmentsApi = {
  getAll: (filters?: { branch?: string; status?: string; subject?: string }) => {
    const params = new URLSearchParams(filters as any).toString();
    return apiRequest<any[]>(`/api/assignments${params ? `?${params}` : ''}`);
  },

  create: (data: any) =>
    apiRequest<any>('/api/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/api/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  submit: async (id: string, file: File, studentId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('studentId', studentId);

    const response = await fetch(`${API_BASE}/api/assignments/${id}/submit`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  delete: (id: string) =>
    apiRequest<any>(`/api/assignments/${id}`, { method: 'DELETE' }),
};

// ─── Library ───
export const libraryApi = {
  getAll: (filters?: { category?: string; search?: string }) => {
    const params = new URLSearchParams(filters as any).toString();
    return apiRequest<any[]>(`/api/library${params ? `?${params}` : ''}`);
  },

  addBook: (data: any) =>
    apiRequest<any>('/api/library', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  borrow: (bookId: string, studentId: string) =>
    apiRequest<any>(`/api/library/${bookId}/borrow`, {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    }),

  returnBook: (bookId: string, studentId: string) =>
    apiRequest<any>(`/api/library/${bookId}/return`, {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    }),
};

// ─── Placements ───
export const placementsApi = {
  getAll: (status?: string) =>
    apiRequest<any[]>(`/api/placements${status ? `?status=${status}` : ''}`),

  create: (data: any) =>
    apiRequest<any>('/api/placements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  apply: (driveId: string, studentId: string) =>
    apiRequest<any>(`/api/placements/${driveId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/api/placements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ─── Feedback ───
export const feedbackApi = {
  getAll: (filters?: { type?: string; studentId?: string }) => {
    const params = new URLSearchParams(filters as any).toString();
    return apiRequest<any[]>(`/api/feedback${params ? `?${params}` : ''}`);
  },

  submit: (data: any) =>
    apiRequest<any>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  respond: (id: string, data: any) =>
    apiRequest<any>(`/api/feedback/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getAnalytics: () => apiRequest<any>('/api/feedback/analytics'),
};

// ─── Hostel ───
export const hostelApi = {
  getAll: (filters?: { block?: string; status?: string }) => {
    const params = new URLSearchParams(filters as any).toString();
    return apiRequest<any[]>(`/api/hostel${params ? `?${params}` : ''}`);
  },

  submitComplaint: (data: any) =>
    apiRequest<any>('/api/hostel/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getComplaints: () => apiRequest<any[]>('/api/hostel/complaints'),
};

// ─── Finance ───
export const financeApi = {
  getAll: (filters?: { studentId?: string; type?: string; status?: string }) => {
    const params = new URLSearchParams(filters as any).toString();
    return apiRequest<any[]>(`/api/finance${params ? `?${params}` : ''}`);
  },

  create: (data: any) =>
    apiRequest<any>('/api/finance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/api/finance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getSummary: () => apiRequest<any>('/api/finance/summary'),
};

// ─── Upload ───
export const uploadApi = {
  uploadFile: async (file: File, folder?: string, userId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    if (userId) formData.append('userId', userId);

    const response = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  uploadMultiple: async (files: File[], folder?: string, userId?: string) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    if (folder) formData.append('folder', folder);
    if (userId) formData.append('userId', userId);

    const response = await fetch(`${API_BASE}/api/upload/multiple`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  getUploads: (userId?: string) =>
    apiRequest<any[]>(`/api/upload${userId ? `?userId=${userId}` : ''}`),
};

// ─── Chat ───
export const chatApi = {
  send: (message: string, userId: string, role: string, context?: any) =>
    apiRequest<any>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, userId, role, context }),
    }),

  getHistory: (userId: string, limit?: number) =>
    apiRequest<any[]>(`/api/chat/history?userId=${userId}${limit ? `&limit=${limit}` : ''}`),

  clearHistory: (userId: string) =>
    apiRequest<any>(`/api/chat/history?userId=${userId}`, { method: 'DELETE' }),
};

// ─── Health Check ───
export const healthCheck = () =>
  apiRequest<{ status: string; timestamp: string; storage: string }>('/api/health');

export default {
  auth: authApi,
  users: usersApi,
  attendance: attendanceApi,
  assignments: assignmentsApi,
  library: libraryApi,
  placements: placementsApi,
  feedback: feedbackApi,
  hostel: hostelApi,
  finance: financeApi,
  upload: uploadApi,
  chat: chatApi,
  healthCheck,
};
