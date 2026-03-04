const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Вспомогательная функция для запросов с авторизацией
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

// API для товаров
export const productsApi = {
  getAll: (params = '') => fetchWithAuth(`/products${params}`),
  getById: (id) => fetchWithAuth(`/products/${id}`),
  create: (data) => fetchWithAuth('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchWithAuth(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchWithAuth(`/products/${id}`, {
    method: 'DELETE',
  }),
};

// API для категорий
export const categoriesApi = {
  getAll: () => fetchWithAuth('/categories'),
  getById: (id) => fetchWithAuth(`/categories/${id}`),
  create: (data) => fetchWithAuth('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchWithAuth(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchWithAuth(`/categories/${id}`, {
    method: 'DELETE',
  }),
};

// API для заказов (добавим позже)
export const ordersApi = {
  getAll: () => fetchWithAuth('/orders'),
  getById: (id) => fetchWithAuth(`/orders/${id}`),
  updateStatus: (id, status) => fetchWithAuth(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
};