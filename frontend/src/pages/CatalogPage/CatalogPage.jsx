import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoriesApi } from '../../admin/services/categories';
import { productsApi } from '../../admin/services/products';
import styles from './CatalogPage.module.css';

const CatalogPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryImages, setCategoryImages] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getAll();
      
      // Фильтруем только активные категории
      const activeCategories = data.filter(cat => cat.is_active);
      setCategories(activeCategories);
      
      // Загружаем случайное изображение для каждой категории
      await loadRandomImagesForCategories(activeCategories);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRandomImagesForCategories = async (categories) => {
    const images = {};
    
    for (const category of categories) {
      try {
        // Запрашиваем товары этой категории (до 5 штук)
        const params = new URLSearchParams({
          category_id: category.id,
          limit: 5,
          page: 1
        });
        
        const data = await productsApi.getAll(`?${params.toString()}`);
        
        if (data.products && data.products.length > 0) {
          // Выбираем случайный товар из категории
          const randomProduct = data.products[Math.floor(Math.random() * data.products.length)];
          
          // Берём его главное изображение или первое
          const productImage = randomProduct.images?.find(img => img.is_main)?.url || 
                              randomProduct.images?.[0]?.url;
          
          if (productImage) {
            images[category.id] = productImage;
          } else {
            // Если у товара нет фото, используем плейсхолдер
            images[category.id] = null;
          }
        } else {
          // Если в категории нет товаров, ставим плейсхолдер
          images[category.id] = null;
        }
      } catch (error) {
        console.error(`Ошибка загрузки изображения для категории ${category.id}:`, error);
        images[category.id] = null;
      }
    }
    
    setCategoryImages(images);
  };

  // Анимации
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  // Заглушки для категорий без фото
  const getPlaceholderImage = (categoryName) => {
    // Генерируем цвет на основе названия категории
    const colors = [
      '#7a914b', '#3f3d35', '#2b2a24', '#5a6b3a', '#4a4a3a'
    ];
    const colorIndex = categoryName.length % colors.length;
    
    return {
      background: colors[colorIndex],
      text: categoryName.charAt(0).toUpperCase()
    };
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Загрузка каталога...</p>
      </div>
    );
  }

  return (
    <div className={styles.catalogPage}>
      {/* Hero секция */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <motion.h1 
            className={styles.heroTitle}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Каталог <span>оборудования</span>
          </motion.h1>
          <motion.p 
            className={styles.heroSubtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Выберите категорию, чтобы найти идеальное звуковое оборудование
          </motion.p>
        </div>
      </section>

      {/* Сетка категорий */}
      <section className={styles.categoriesSection}>
        <div className={styles.container}>
          <motion.div 
            className={styles.categoriesGrid}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {categories.map((category) => {
              const placeholder = getPlaceholderImage(category.name);
              const hasImage = categoryImages[category.id];
              
              return (
                <motion.div
                  key={category.id}
                  className={styles.categoryCard}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 20px 40px rgba(0, 255, 136, 0.2)"
                  }}
                >
                  <Link to={`/category/${category.slug}`} className={styles.categoryLink}>
                    <div className={styles.categoryImageWrapper}>
                      {hasImage ? (
                        <img 
                          src={`http://localhost:5000${hasImage}`}
                          alt={category.name}
                          className={styles.categoryImage}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentElement.style.background = placeholder.background;
                            e.target.parentElement.innerHTML = `<span class="${styles.placeholderText}">${placeholder.text}</span>`;
                          }}
                        />
                      ) : (
                        <div 
                          className={styles.categoryPlaceholder}
                          style={{ background: placeholder.background }}
                        >
                          <span className={styles.placeholderText}>{placeholder.text}</span>
                        </div>
                      )}
                      
                      {/* Градиент для затемнения */}
                      <div className={styles.categoryOverlay} />
                      
                      {/* Количество товаров */}
                      <span className={styles.productCount}>
                        {category.products_count || 0} товаров
                      </span>
                    </div>
                    
                    <div className={styles.categoryInfo}>
                      <h2 className={styles.categoryName}>{category.name}</h2>
                      {category.description && (
                        <p className={styles.categoryDescription}>{category.description}</p>
                      )}
                      <span className={styles.categoryArrow}>→</span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Призыв к действию */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <motion.div 
            className={styles.ctaContent}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className={styles.ctaTitle}>Не нашли нужную категорию?</h2>
            <p className={styles.ctaText}>
              Свяжитесь с нами, и мы поможем подобрать оборудование под ваши задачи
            </p>
            <Link to="/contacts" className={styles.ctaButton}>
              Связаться с нами
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CatalogPage;