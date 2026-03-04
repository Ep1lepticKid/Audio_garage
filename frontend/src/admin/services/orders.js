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

export const ordersApi = {
  // Получить все заказы (с фильтрацией и пагинацией)
  getAll: (params = '') => fetchWithAuth(`/orders${params}`),
  
  // Получить детали заказа по ID
  getById: (id) => fetchWithAuth(`/orders/${id}`),
  
  // Обновить статус заказа
  updateStatus: (id, data) => fetchWithAuth(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Получить заказ по номеру (для публичной части)
  getByNumber: (orderNumber) => fetchWithAuth(`/orders/number/${orderNumber}`),
};