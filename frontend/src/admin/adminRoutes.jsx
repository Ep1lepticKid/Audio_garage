import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import ProductsPage from './pages/ProductsPage/ProductsPage';
import CategoriesPage from './pages/CategoriesPage/CategoriesPage';
import ArticlesPage from './pages/ArticlesPage/ArticlesPage';
import OrdersPage from './pages/OrdersPage/OrdersPage';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/new" element={<ProductsPage isNew />} />
      <Route path="/products/:id" element={<ProductsPage isEdit />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/articles" element={<ArticlesPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;