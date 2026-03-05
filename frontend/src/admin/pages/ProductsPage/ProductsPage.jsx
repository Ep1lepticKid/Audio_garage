import React, { useEffect, useState, useMemo, useRef } from 'react';
import { productsApi } from '../../services/products';
import { categoriesApi } from '../../services/categories';
import ProductModal from './ProductModal'; // Добавляем импорт
import styles from './ProductsPage.module.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // ... остальные состояния (searchTerm, selectedCategory, pagination, sortConfig) остаются без изменений ...
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'asc'
  });

  const searchTimeout = useRef(null);

  // Загрузка категорий
  useEffect(() => {
    loadCategories();
  }, []);

  // Debounce для поиска
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm]);

  // Загрузка товаров
  useEffect(() => {
    loadProducts();
  }, [pagination.page, selectedCategory, debouncedSearchTerm]);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(selectedCategory && { category_id: selectedCategory }),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      });
      
      const data = await productsApi.getAll(`?${params.toString()}`);
      
      setProducts(data.products || []);
      setPagination(data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      });
      setError('');
    } catch (err) {
      setError(err.message || 'Ошибка при загрузке товаров');
    } finally {
      setLoading(false);
    }
  };

  // Сортировка
  const sortedProducts = useMemo(() => {
    const sortableProducts = [...products];
    
    sortableProducts.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';
      
      if (sortConfig.key === 'price') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return sortableProducts;
  }, [products, sortConfig]);

  // Обработчики для модального окна
  const handleAddClick = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, formData);
      } else {
        await productsApi.create(formData);
      }
      
      setModalOpen(false);
      await loadProducts(); // Перезагружаем список
    } catch (err) {
      throw err; // Пробрасываем ошибку в модальное окно
    }
  };

  // Остальные обработчики (requestSort, getSortIcon, handlePageChange, handleSearch, handleCategoryFilter, handleDelete) остаются без изменений
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return '↕️';
    }
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCategoryFilter = (e) => {
    setSelectedCategory(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Вы уверены, что хотите удалить товар "${name}"?`)) {
      return;
    }

    try {
      await productsApi.delete(id);
      await loadProducts();
    } catch (err) {
      setError(err.message || 'Ошибка при удалении');
    }
  };

  const getStockStatusDisplay = (product) => {
    const statusMap = {
      'in_stock': { text: 'В наличии', className: styles.inStock },
      'out_of_stock': { text: 'Нет в наличии', className: styles.outOfStock },
      'pre_order': { text: 'Под заказ', className: styles.preOrder }
    };
    
    const status = statusMap[product.stock_status] || statusMap.out_of_stock;
    
    return (
      <span className={`${styles.stockBadge} ${status.className}`}>
        {status.text}
        {product.stock_status === 'in_stock' && product.quantity > 0 && 
          ` (${product.quantity} шт.)`
        }
        {product.stock_status === 'out_of_stock' && product.delivery_time && 
          `, поставка: ${product.delivery_time}`
        }
      </span>
    );
  };

  if (loading && products.length === 0) {
    return <div className={styles.loading}>Загрузка товаров...</div>;
  }

  console.log('Товары с изображениями:', products.map(p => ({
                              id: p.id,
                              name: p.name,
                              images: p.images
                                                })));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Управление <span>товарами</span>
        </h1>
        <button className={styles.addButton} onClick={handleAddClick}>
          + Новый товар
        </button>
      </div>

      {/* Фильтры (без изменений) */}
      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button 
              className={styles.clearSearch}
              onClick={handleClearSearch}
              title="Очистить поиск"
            >
              ×
            </button>
          )}
        </div>
        
        <select
          value={selectedCategory}
          onChange={handleCategoryFilter}
          className={styles.categoryFilter}
        >
          <option value="">Все категории</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Таблица (без изменений, кроме добавления handleEditClick) */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => requestSort('id')} className={styles.sortable}>
                ID <span className={styles.sortIcon}>{getSortIcon('id')}</span>
              </th>
              <th>Изображение</th>
              <th>Артикул</th>
              <th onClick={() => requestSort('name')} className={styles.sortable}>
                Название <span className={styles.sortIcon}>{getSortIcon('name')}</span>
              </th>
              <th>Категория</th>
              <th onClick={() => requestSort('price')} className={styles.sortable}>
                Цена <span className={styles.sortIcon}>{getSortIcon('price')}</span>
              </th>
              <th>Наличие</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.length === 0 ? (
              <tr>
                <td colSpan="9" className={styles.emptyMessage}>
                  {searchTerm || selectedCategory 
                    ? 'Ничего не найдено' 
                    : 'Нет товаров. Создайте первый товар!'}
                </td>
              </tr>
            ) : (
              sortedProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>
                    {(() => {
                      if (!product.images || product.images.length === 0) {
                        return <div className={styles.noImage}>📷</div>;
                      }
                      
                      // Находим главное изображение или берём первое
                      const mainImage = product.images.find(img => img.is_main) || product.images[0];
                      
                      // Получаем URL (может быть в поле url или image_url)
                      const imageUrl = mainImage.url || mainImage.image_url;
                      
                      if (!imageUrl) {
                        return <div className={styles.noImage}>📷</div>;
                      }
                      
                      return (
                        <img 
                          src={`${process.env.REACT_APP_IMAGE_URL || 'http://localhost:5000'}${imageUrl}`} 
                          alt={product.name}
                          className={styles.productImage}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="' + styles.noImage + '">📷</div>';
                          }}
                        />
                      );
                    })()}
                  </td>
                  <td>{product.article || '—'}</td>
                  <td>{product.name}</td>
                  <td>
                    {product.category_name && (
                      <span className={styles.categoryBadge}>
                        {product.category_name}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={styles.price}>
                      {Number(product.price).toLocaleString('ru-RU')} ₽
                    </span>
                    {product.old_price && (
                      <span className={styles.oldPrice}>
                        {Number(product.old_price).toLocaleString('ru-RU')} ₽
                      </span>
                    )}
                  </td>
                  <td>{getStockStatusDisplay(product)}</td>
                  <td>
                    <span className={product.is_active ? styles.active : styles.inactive}>
                      {product.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button 
                        className={styles.editButton}
                        onClick={() => handleEditClick(product)}
                      >
                        ✎
                      </button>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => handleDelete(product.id, product.name)}
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Пагинация (без изменений) */}
      {pagination.pages > 1 && (
        <div className={styles.pagination}>
          {/* ... пагинация ... */}
        </div>
      )}

      {/* Модальное окно */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        product={editingProduct}
        categories={categories}
      />
    </div>
  );
};

export default ProductsPage;