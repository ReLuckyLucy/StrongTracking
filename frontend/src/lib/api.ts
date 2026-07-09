const API_BASE = '/api';

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Request failed');
  }
  return data;
}

export const api = {
  // Auth
  register: (body: { username: string; email: string; password: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),

  // Exercises
  listExercises: () => request('/exercises'),
  createExercise: (body: { name: string; category: string; description?: string }) =>
    request('/exercises', { method: 'POST', body: JSON.stringify(body) }),
  deleteExercise: (id: string) =>
    request(`/exercises/${id}`, { method: 'DELETE' }),

  // Workouts
  listWorkouts: (params?: { page?: number; date_from?: string; date_to?: string }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.date_from) search.set('date_from', params.date_from);
    if (params?.date_to) search.set('date_to', params.date_to);
    const qs = search.toString();
    return request(`/workouts${qs ? `?${qs}` : ''}`);
  },
  getWorkout: (id: string) => request(`/workouts/${id}`),
  createWorkout: (body: {
    date: string;
    notes?: string;
    duration_minutes?: number;
    sets: { exercise_id: string; set_number: number; weight_kg: number; reps: number }[];
  }) => request('/workouts', { method: 'POST', body: JSON.stringify(body) }),
  updateWorkout: (id: string, body: any) =>
    request(`/workouts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteWorkout: (id: string) =>
    request(`/workouts/${id}`, { method: 'DELETE' }),

  // Stats
  progress: (exerciseId: string) => request(`/stats/progress/${exerciseId}`),
  heatmap: () => request('/stats/heatmap'),
  overview: () => request('/stats/overview'),

  // Admin
  adminStats: () => request('/admin/stats'),
  listUsers: (params?: { page?: number; page_size?: number; search?: string }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.page_size) search.set('page_size', String(params.page_size));
    if (params?.search) search.set('search', params.search);
    const qs = search.toString();
    return request(`/admin/users${qs ? `?${qs}` : ''}`);
  },
  adminUserDetail: (id: string) => request(`/admin/users/${id}`),
  deleteUser: (id: string) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  resetUserPassword: (id: string, password: string) =>
    request(`/admin/users/${id}/password`, { method: 'PUT', body: JSON.stringify({ password }) }),
};
