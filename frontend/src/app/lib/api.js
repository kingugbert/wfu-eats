const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('wfu_token');
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status}`);
  }
  return res.json();
}

// Auth
export const auth = {
  register: (data) => apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => apiFetch('/api/auth/me'),
};

// Restaurants
export const restaurants = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/api/restaurants${qs ? '?' + qs : ''}`);
  },
  get: (id) => apiFetch(`/api/restaurants/${id}`),
  cuisines: () => apiFetch('/api/restaurants/meta/cuisines'),
};

// Students / Favorites
export const students = {
  getFavorites: () => apiFetch('/api/students/me/favorites'),
  addFavorite: (data) => apiFetch('/api/students/favorites', { method: 'POST', body: JSON.stringify(data) }),
  removeFavorite: (restaurantId) => apiFetch(`/api/students/favorites/${restaurantId}`, { method: 'DELETE' }),
};

// Posts
export const posts = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/api/posts${qs ? '?' + qs : ''}`);
  },
  create: (data) => apiFetch('/api/posts', { method: 'POST', body: JSON.stringify(data) }),
  like: (id) => apiFetch(`/api/posts/${id}/like`, { method: 'POST' }),
  delete: (id) => apiFetch(`/api/posts/${id}`, { method: 'DELETE' }),
};
