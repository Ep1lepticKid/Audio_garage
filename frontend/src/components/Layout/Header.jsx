import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import styles from './Header.module.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoAudio}>АУДИО</span>
          <span className={styles.logoCharG}>Г</span>
          <span className={styles.logoCharHangingA}>А</span>
          <span className={styles.logoNeonRJ}>РАЖ</span>
        </Link>

        <nav className={styles.nav}>
          <Link 
            to="/catalog" 
            className={`${styles.navLink} ${location.pathname === '/catalog' ? styles.active : ''}`}
          >
            Каталог
          </Link>
          <Link 
            to="/contacts" 
            className={`${styles.navLink} ${location.pathname === '/contacts' ? styles.active : ''}`}
          >
            Контакты
          </Link>
          <Link to="/articles" className={styles.navLink}>Статьи</Link>
          <Link to="/feedback" className={styles.navLink}>Обратная связь</Link>
        </nav>

        <div className={styles.actions}>
          <Link to="/cart" className={styles.cartLink}>
            <span className={styles.cartIcon}>🛒</span>
            {cartCount > 0 && (
              <span className={styles.cartCount}>{cartCount}</span>
            )}
          </Link>
          <Link to="/admin/login" className={styles.loginButton}>
            Вход
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;