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

export const productsApi = {
  // Получить все товары (с пагинацией)
  getAll: (params = '') => fetchWithAuth(`/products${params}`),
  
  // Получить товар по ID
  getById: (id) => fetchWithAuth(`/products/${id}`),
  
  // Создать новый товар
  create: async (data) => {
    try {
      return await fetchWithAuth('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw error;
    }
  },
  
  // Обновить товар
  update: async (id, data) => {
    try {
      return await fetchWithAuth(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw error;
    }
  },
  
  // Удалить товар (мягкое удаление)
  delete: (id) => fetchWithAuth(`/products/${id}`, {
    method: 'DELETE',
  }),
};