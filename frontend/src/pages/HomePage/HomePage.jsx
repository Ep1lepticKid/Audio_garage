import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // Добавляем импорт
import { productsApi } from '../../admin/services/products';
import styles from './HomePage.module.css';
import garageImage from '../../assets/images/garage.jpg';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef();
  const limit = 8;

  // Анимации для товаров
  const containerVariants = {
    hidden: { opacity: 1 },  
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },  
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const loadProducts = async (pageNum) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNum,
        limit,
        sort: 'created_at',
        order: 'DESC'
      });
      
      const data = await productsApi.getAll(`?${params.toString()}`);
      
      if (data.products.length < limit) {
        setHasMore(false);
      }
      
      if (pageNum === 1) {
        setProducts(data.products);
      } else {
        setProducts(prev => [...prev, ...data.products]);
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(1);
  }, []);

  const lastProductRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => {
          const nextPage = prevPage + 1;
          loadProducts(nextPage);
          return nextPage;
        });
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  return (
    <div className={styles.homePage}>
      {/* Параллакс секция с анимацией */}
      <motion.section 
        className={styles.parallax}
        style={{ backgroundImage: `url(${garageImage})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className={styles.parallaxOverlay} />
        <motion.div 
          className={styles.parallaxContent}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h1 className={styles.mainTitle}>
            Добро пожаловать в <span>Аудио Гараж</span>
          </h1>
          <p className={styles.mainSubtitle}>
            Звуковое сценическое оборудование с душой
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/catalog" className={styles.ctaButton}>
              Перейти в каталог
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Секция с товарами */}
      <section className={styles.section}>
        <div className={styles.container}>
          <motion.h2 
            className={styles.sectionTitle}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span>Новинки</span> в гараже
          </motion.h2>
          
          <motion.div 
            className={styles.productsGrid}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {products.map((product, index) => {
              const ProductCard = (
                <motion.div 
                  key={product.id} 
                  className={styles.productCard}
                  style={{ opacity: 1, visibility: 'visible' }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 30px rgba(0, 255, 136, 0.3)"
                  }}
                >
                  <Link to={`/product/${product.id}`} className={styles.productLink}>
                    <div className={styles.productImage}>
                      {product.images && product.images.length > 0 ? (
                        <motion.img 
                          src={`http://localhost:5000${
                            product.images.find(img => img.is_main)?.url || 
                            product.images[0]?.url
                          }`}
                          alt={product.name}
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="' + styles.noImage + '">📷</div>';
                          }}
                        />
                      ) : (
                        <div className={styles.noImage}>📷</div>
                      )}
                    </div>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <p className={styles.productPrice}>
                      {Number(product.price).toLocaleString('ru-RU')} ₽
                    </p>
                    <motion.span 
                      className={styles.productLink}
                      whileHover={{ x: 5 }}
                    >
                      Подробнее →
                    </motion.span>
                  </Link>
                </motion.div>
              );

              if (products.length === index + 1) {
                return (
                  <div key={product.id} ref={lastProductRef}>
                    {ProductCard}
                  </div>
                );
              }
              return ProductCard;
            })}
          </motion.div>
          
          {loading && (
            <motion.div 
              className={styles.loadingMore}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 1 },  // ← НЕ 0, а 1!
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              Загрузка ещё товаров...
            </motion.div>
          )}
          
          {!hasMore && products.length > 0 && (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { type: "spring", stiffness: 100 }
                }
              }}
            >
              Больше товаров нет
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;