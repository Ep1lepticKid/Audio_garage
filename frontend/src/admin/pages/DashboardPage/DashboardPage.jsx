import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Добавим Link
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/admin/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      // Здесь будут реальные запросы
      setStats({
        products: 15,
        categories: 7,
        orders: 3
      });
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          АУДИО<span>ГАРАЖ</span>
        </h1>
        <div className={styles.userInfo}>
          <span>{user.first_name || 'Менеджер'} {user.last_name}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </div>

      {/* Добавляем навигационное меню */}
      <div className={styles.navMenu}>
        <Link to="/admin/dashboard" className={styles.navLink}>Главная</Link>
        <Link to="/admin/categories" className={styles.navLink}>Категории</Link>
        <Link to="/admin/products" className={styles.navLink}>Товары</Link>
        <Link to="/admin/orders" className={styles.navLink}>Заказы</Link>
      </div>

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
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;