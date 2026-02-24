import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Проверяем, что пользователь имеет права менеджера или админа
  if (user.role_name !== 'admin' && user.role_name !== 'manager') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;