import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productsApi } from '../../admin/services/products';
import styles from './HomePage.module.css';
import garageImage from '../../assets/images/garage.jpg';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsApi.getAll('?limit=4&sort=created_at&order=DESC');
      setProducts(data.products || []);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.homePage}>
      {/* Параллакс секция */}
      <section 
        className={styles.parallax}
        style={{ backgroundImage: `url(${garageImage})` }}
      >
        <div className={styles.parallaxOverlay} />
        <div className={styles.parallaxContent}>
          <h1 className={styles.mainTitle}>
            Добро пожаловать в <span>Аудио Гараж</span>
          </h1>
          <p className={styles.mainSubtitle}>
            Звуковое сценическое оборудование с душой
          </p>
          <Link to="/catalog" className="btn btn-primary" style={{ padding: '15px 40px', fontSize: '18px' }}>
            Перейти в каталог
          </Link>
        </div>
      </section>

      {/* Секция с новинками */}
      <section className={styles.section}>
        <div className="container">
          <h2 className="section-title">
            <span>Новинки</span> в гараже
          </h2>
          
          {loading ? (
            <div className={styles.loading}>Загрузка...</div>
          ) : (
            <div className={styles.productsGrid}>
              {products.map(product => (
                <div key={product.id} className={`card ${styles.productCard}`}>
                  <Link to={`/product/${product.id}`} className={styles.productLink}>
                    <div className={styles.productImage}>
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={`${process.env.REACT_APP_IMAGE_URL || 'http://localhost:5000'}${
                            product.images.find(img => img.is_main)?.url || product.images[0]?.url
                          }`}
                          alt={product.name}
                        />
                      ) : (
                        <div className={styles.noImage}>📷</div>
                      )}
                    </div>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <p className={styles.productPrice}>
                      {Number(product.price).toLocaleString('ru-RU')} ₽
                    </p>
                    <span className={styles.readMore}>
                      Подробнее →
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;