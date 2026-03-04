const API_URL = 'http://localhost:5000/api';

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Ошибка запроса');
  }

  return data;
};

export const articlesApi = {
  getAll: () => fetchWithAuth('/articles'),
  getById: (id) => fetchWithAuth(`/articles/${id}`),
  create: (data) => fetchWithAuth('/articles', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchWithAuth(`/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchWithAuth(`/articles/${id}`, {
    method: 'DELETE',
  }),
};