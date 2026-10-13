const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function apiFetch(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('wfu_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const auth = {
  register: (data) => apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  login: (data) => apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  me: () => apiFetch('/api/auth/me')
};

export const restaurants = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/api/restaurants${query ? `?${query}` : ''}`);
  },
  get: (id) => apiFetch(`/api/restaurants/${id}`),
  cuisines: () => apiFetch('/api/restaurants/meta/cuisines')
};

export const posts = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/api/posts${query ? `?${query}` : ''}`);
  },
  create: (data) => apiFetch('/api/posts', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  like: (id) => apiFetch(`/api/posts/${id}/like`, { method: 'POST' }),
  delete: (id) => apiFetch(`/api/posts/${id}`, { method: 'DELETE' })
};

export const students = {
  favorites: () => apiFetch('/api/students/favorites'),
  addFavorite: (restaurantId) => apiFetch(`/api/students/favorites/${restaurantId}`, { method: 'POST' }),
  removeFavorite: (restaurantId) => apiFetch(`/api/students/favorites/${restaurantId}`, { method: 'DELETE' })
};

export const google = {
  sync: () => apiFetch('/api/google/sync', { method: 'POST' })
};
