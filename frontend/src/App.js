import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';

// Компонент фона
import BackgroundImage from './components/UI/BackgroundImage';

// Публичные компоненты
import Header from './components/Layout/Header';
import HomePage from './pages/HomePage/HomePage';
import CatalogPage from './pages/CatalogPage/CatalogPage';
import CategoryPage from './pages/CategoryPage/CategoryPage';  
import ProductPage from './pages/ProductPage/ProductPage';
import CartPage from './pages/CartPage/CartPage';
import ContactsPage from './pages/ContactsPage/ContactsPage';
import ArticlesPage from './pages/ArticlesPage/ArticlesPage';
import ArticlePage from './pages/ArticlePage/ArticlePage';
import CheckoutPage from './pages/CheckoutPage/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage/OrderSuccessPage';
import FeedbackPage from './pages/FeedbackPage/FeedbackPage'; // НОВЫЙ импорт

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
          {/* Публичные маршруты с фоновым изображением */}
          <Route path="/" element={
            <BackgroundImage>
              <Header />
              <HomePage />
            </BackgroundImage>
          } />
          
          <Route path="/catalog" element={
            <BackgroundImage>
              <Header />
              <CatalogPage />
            </BackgroundImage>
          } />

          <Route path="/contacts" element={
            <BackgroundImage>
              <Header />
              <ContactsPage />
            </BackgroundImage>
          } />
          
          <Route path="/category/:slug" element={
            <BackgroundImage>
              <Header />
              <CategoryPage />
            </BackgroundImage>
          } />
          
          <Route path="/product/:id" element={
            <BackgroundImage>
              <Header />
              <ProductPage />
            </BackgroundImage>
          } />
          
          <Route path="/cart" element={
            <BackgroundImage>
              <Header />
              <CartPage />
            </BackgroundImage>
          } />

          <Route path="/articles" element={
            <BackgroundImage>
              <Header />
              <ArticlesPage />
            </BackgroundImage>
          } />

          <Route path="/articles/:slug" element={
            <BackgroundImage>
              <Header />
              <ArticlePage />
            </BackgroundImage>
          } />

          <Route path="/checkout" element={
            <BackgroundImage>
              <Header />
              <CheckoutPage />
            </BackgroundImage>
          } />

          <Route path="/order-success/:orderNumber" element={
            <BackgroundImage>
              <Header />
              <OrderSuccessPage />
            </BackgroundImage>
          } />

          {/* НОВЫЙ маршрут для обратной связи */}
          <Route path="/feedback" element={
            <BackgroundImage>
              <Header />
              <FeedbackPage />
            </BackgroundImage>
          } />
          
          {/* Админка (без фона, со своим стилем) */}
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