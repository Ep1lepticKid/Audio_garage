import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');  // ← ИЗМЕНЕНО: теперь ведёт на главную
  };

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerRight}>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Выйти
            </button>
          </div>
        </header>
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;