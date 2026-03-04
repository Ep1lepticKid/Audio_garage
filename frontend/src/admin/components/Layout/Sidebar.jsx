import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Главная', icon: '📊' },
    { path: '/admin/categories', label: 'Категории', icon: '📁' },
    { path: '/admin/products', label: 'Товары', icon: '🎧' },
    { path: '/admin/orders', label: 'Заказы', icon: '📦' },
    { path: '/admin/articles', label: 'Статьи', icon: '📰' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <h2>АУДИО<span>ГАРАЖ</span></h2>
      </div>
      
      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.navLink} ${
              location.pathname === item.path ? styles.active : ''
            }`}
          >
            <span className={styles.icon}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;