import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';

// Публичные компоненты
import Header from './components/Layout/Header';
import HomePage from './pages/HomePage/HomePage';
import CatalogPage from './pages/CatalogPage/CatalogPage';
import CategoryPage from './pages/CategoryPage/CategoryPage';  
import ProductPage from './pages/ProductPage/ProductPage';
import CartPage from './pages/CartPage/CartPage';
import ContactsPage from './pages/ContactsPage/ContactsPage';

// Админка
import LoginPage from './admin/pages/LoginPage/LoginPage';
import AdminRoutes from './admin/adminRoutes';
import Layout from './admin/components/Layout/Layout';
import ProtectedRoute from './admin/components/Common/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/" element={
            <>
              <Header />
              <HomePage />
            </>
          } />
          
          <Route path="/catalog" element={
            <>
              <Header />
              <CatalogPage />
            </>
          } />

          <Route path="/contacts" element={
            <>
              <Header />
              <ContactsPage />
            </>
          } />
          
          <Route path="/category/:slug" element={
            <>
              <Header />
              <CategoryPage />
            </>
          } />
          
          <Route path="/product/:id" element={
            <>
              <Header />
              <ProductPage />
            </>
          } />
          
          <Route path="/cart" element={
            <>
              <Header />
              <CartPage />
            </>
          } />
          
          {/* Админка */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <Layout>
                <AdminRoutes />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;