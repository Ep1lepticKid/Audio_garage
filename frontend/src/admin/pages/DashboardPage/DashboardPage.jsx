import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../../services/products';
import { categoriesApi } from '../../services/categories';
import { ordersApi } from '../../services/orders';
import { articlesApi } from '../../services/articles';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    articles: 0,
    newOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/admin/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Загружаем реальные данные из API
      const [productsData, categoriesData, ordersData, articlesData] = await Promise.all([
        productsApi.getAll('?limit=1').catch(() => ({ pagination: { total: 0 } })),
        categoriesApi.getAll().catch(() => []),
        ordersApi.getAll('?limit=1').catch(() => ({ pagination: { total: 0 } })),
        articlesApi.getAll().catch(() => [])
      ]);

      // Подсчитываем новые заказы (со статусом 'new')
      const newOrdersCount = Array.isArray(ordersData.orders) 
        ? ordersData.orders.filter(order => order.status_name === 'new').length 
        : 0;

      setStats({
        products: productsData.pagination?.total || 0,
        categories: categoriesData.length || 0,
        orders: ordersData.pagination?.total || 0,
        articles: articlesData.length || 0,
        newOrders: newOrdersCount
      });
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <h1 className={styles.welcome}>
        Добро пожаловать, {user.first_name || 'Менеджер'}!
      </h1>
      
      {loading ? (
        <div className={styles.loading}>Загрузка статистики...</div>
      ) : (
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.products}</div>
            <div className={styles.statLabel}>Товаров</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.categories}</div>
            <div className={styles.statLabel}>Категорий</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.orders}</div>
            <div className={styles.statLabel}>Заказов</div>
            {stats.newOrders > 0 && (
              <span className={styles.newOrders}>
                +{stats.newOrders} новых
              </span>
            )}
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.articles}</div>
            <div className={styles.statLabel}>Статей</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;