import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = ({ categories, currentCategory }) => {
  return (
    <div className={styles.sidebar}>
      <h3 className={styles.sidebarTitle}>Категории</h3>
      <nav className={styles.categoryNav}>
        <Link 
          to="/catalog" 
          className={`${styles.categoryLink} ${!currentCategory ? styles.active : ''}`}
        >
          Все категории
        </Link>
        {categories.map(cat => (
          <Link
            key={cat.id}
            to={`/category/${cat.slug}`}
            className={`${styles.categoryLink} ${
              currentCategory?.id === cat.id ? styles.active : ''
            }`}
          >
            {cat.name}
            <span className={styles.categoryCount}>
              {cat.products_count || 0}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;