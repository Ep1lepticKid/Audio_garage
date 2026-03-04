const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
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

export const imagesApi = {
  // Загрузить изображение
  upload: (productId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return fetchWithAuth(`/images/product/${productId}`, {
      method: 'POST',
      body: formData,
      headers: {} // Не ставим Content-Type, FormData сама установит правильный
    });
  },
  
  // Получить все изображения товара
  getByProduct: (productId) => fetchWithAuth(`/images/product/${productId}`),
  
  // Удалить изображение
  delete: (imageId) => fetchWithAuth(`/images/${imageId}`, {
    method: 'DELETE'
  }),
  
  // Установить как главное
  setMain: (imageId) => fetchWithAuth(`/images/${imageId}/set-main`, {
    method: 'PUT'
  }),
  
  // Обновить порядок
  updateOrder: (images) => fetchWithAuth('/images/order/update', {
    method: 'PUT',
    body: JSON.stringify({ images })
  }),

  // Загрузить изображение с сепией
  uploadWithSepia: (productId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return fetchWithAuth(`/images/product/${productId}/sepia`, {
      method: 'POST',
      body: formData,
      headers: {}
    });
  }
};