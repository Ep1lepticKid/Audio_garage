import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productsApi } from '../../admin/services/products';
import { categoriesApi } from '../../admin/services/categories';
import Sidebar from './components/Sidebar';
import Filters from './components/Filters';
import ProductCard from './components/ProductCard';
import styles from './CategoryPage.module.css';

const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    inStock: false,
    sort: 'default'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Загрузка данных
  useEffect(() => {
    loadCategoryAndProducts();
    loadAllCategories();
  }, [slug]);

  // Загрузка при изменении фильтров
  useEffect(() => {
    if (category) {
      loadProducts();
    }
  }, [filters, pagination.page, category]);

  const loadCategoryAndProducts = async () => {
    try {
      setLoading(true);
      
      // Загружаем информацию о категории
      const categoryData = await categoriesApi.getById(slug);
      setCategory(categoryData);
      
      // Загружаем товары категории
      await loadProducts(categoryData.id);
    } catch (error) {
      console.error('Ошибка загрузки категории:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data.filter(c => c.is_active));
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  const loadProducts = async (categoryId = category?.id) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        category_id: categoryId,
        ...(filters.minPrice && { min_price: filters.minPrice }),
        ...(filters.maxPrice && { max_price: filters.maxPrice }),
        ...(filters.inStock && { in_stock: true }),
        ...(filters.sort !== 'default' && { sort: filters.sort })
      });
      
      const data = await productsApi.getAll(`?${params.toString()}`);
      setProducts(data.products || []);
      setPagination(data.pagination || {
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
      });
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && !category) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Загрузка категории...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className={styles.notFound}>
        <h1>Категория не найдена</h1>
        <Link to="/catalog" className={styles.backLink}>
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.categoryPage}>
      {/* Hero секция категории */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className={styles.categoryTitle}>
              {category.name}
            </h1>
            {category.description && (
              <p className={styles.categoryDescription}>{category.description}</p>
            )}
            <div className={styles.stats}>
              <span className={styles.stat}>
                📦 {pagination.total} товаров
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Основной контент */}
      <section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.contentWrapper}>
            {/* Боковая панель */}
            <aside className={`${styles.sidebar} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
              <button 
                className={styles.closeMobileMenu}
                onClick={() => setMobileMenuOpen(false)}
              >
                ×
              </button>
              
              {/* Навигация по категориям */}
              <Sidebar 
                categories={categories}
                currentCategory={category}
              />
              
              {/* Фильтры */}
              <Filters 
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </aside>

            {/* Кнопка открытия мобильного меню */}
            <button 
              className={styles.mobileMenuBtn}
              onClick={() => setMobileMenuOpen(true)}
            >
              <span>☰</span> Фильтры и категории
            </button>

            {/* Список товаров */}
            <main className={styles.main}>
              {/* Сортировка */}
              <div className={styles.sortBar}>
                <select 
                  className={styles.sortSelect}
                  value={filters.sort}
                  onChange={(e) => handleFilterChange({ sort: e.target.value })}
                >
                  <option value="default">По умолчанию</option>
                  <option value="price_asc">Цена: по возрастанию</option>
                  <option value="price_desc">Цена: по убыванию</option>
                  <option value="name_asc">Название: А-Я</option>
                  <option value="name_desc">Название: Я-А</option>
                  <option value="newest">Сначала новинки</option>
                </select>
              </div>

              {/* Товары */}
              {loading ? (
                <div className={styles.productsLoading}>
                  <div className={styles.loadingSpinner}></div>
                </div>
              ) : products.length === 0 ? (
                <div className={styles.noProducts}>
                  <p>В этой категории пока нет товаров</p>
                  <Link to="/catalog" className={styles.backToCatalog}>
                    ← Вернуться в каталог
                  </Link>
                </div>
              ) : (
                <>
                  <motion.div 
                    className={styles.productsGrid}
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.05
                        }
                      }
                    }}
                  >
                    {products.map((product, idx) => (
                      <ProductCard key={product.id} product={product} index={idx} />
                    ))}
                  </motion.div>

                  {/* Пагинация */}
                  {pagination.pages > 1 && (
                    <div className={styles.pagination}>
                      <button
                        className={styles.pageBtn}
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        ←
                      </button>
                      
                      {[...Array(pagination.pages).keys()].map(num => (
                        <button
                          key={num + 1}
                          className={`${styles.pageBtn} ${pagination.page === num + 1 ? styles.active : ''}`}
                          onClick={() => handlePageChange(num + 1)}
                        >
                          {num + 1}
                        </button>
                      ))}
                      
                      <button
                        className={styles.pageBtn}
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                      >
                        →
                      </button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoryPage;