const API_URL = 'http://localhost:5000/api';

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

export const categoriesApi = {
  // Получить все категории
  getAll: () => fetchWithAuth('/categories'),
  
  // Получить категорию по ID
  getById: (id) => fetchWithAuth(`/categories/${id}`),
  
  // Создать новую категорию
  create: async (data) => {
    try {
      return await fetchWithAuth('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      // Пробрасываем ошибку дальше для обработки в компоненте
      throw error;
    }
  },
  
  // Обновить категорию
  update: async (id, data) => {
    try {
      return await fetchWithAuth(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw error;
    }
  },
  
  // Удалить категорию
  delete: (id) => fetchWithAuth(`/categories/${id}`, {
    method: 'DELETE',
  }),
};