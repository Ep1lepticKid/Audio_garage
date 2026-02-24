import React, { useEffect, useState, useMemo } from 'react';
import { categoriesApi } from '../../services/categories';
import CategoryModal from './CategoryModal';
import styles from './CategoriesPage.module.css';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Состояние для сортировки
  const [sortConfig, setSortConfig] = useState({
    key: 'id', // поле для сортировки
    direction: 'asc' // 'asc' или 'desc'
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getAll();
      setCategories(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Ошибка при загрузке категорий');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Сортировка данных
  const sortedCategories = useMemo(() => {
    const sortableCategories = [...categories];
    
    sortableCategories.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Обработка null/undefined значений
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';
      
      // Сравнение
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return sortableCategories;
  }, [categories, sortConfig]);

  // Обработчик клика по заголовку
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Получить класс для стрелки
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return '↕️'; // неактивная сортировка
    }
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  const handleAddClick = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, formData);
      } else {
        await categoriesApi.create(formData);
      }
      
      setModalOpen(false);
      await loadCategories();
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Вы уверены, что хотите удалить категорию "${name}"?`)) {
      return;
    }

    try {
      await categoriesApi.delete(id);
      await loadCategories();
    } catch (err) {
      setError(err.message || 'Ошибка при удалении');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка категорий...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Управление <span>категориями</span>
        </h1>
        <button className={styles.addButton} onClick={handleAddClick}>
          + Новая категория
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => requestSort('id')} className={styles.sortable}>
                ID <span className={styles.sortIcon}>{getSortIcon('id')}</span>
              </th>
              <th onClick={() => requestSort('name')} className={styles.sortable}>
                Название <span className={styles.sortIcon}>{getSortIcon('name')}</span>
              </th>
              <th>Slug</th>
              <th>Описание</th>
              <th onClick={() => requestSort('products_count')} className={styles.sortable}>
                Товаров <span className={styles.sortIcon}>{getSortIcon('products_count')}</span>
              </th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedCategories.length === 0 ? (
              <tr>
                <td colSpan="7" className={styles.emptyMessage}>
                  Нет категорий. Создайте первую категорию!
                </td>
              </tr>
            ) : (
              sortedCategories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                  <td>{category.slug}</td>
                  <td>{category.description || '—'}</td>
                  <td>{category.products_count || 0}</td>
                  <td>
                    <span className={category.is_active ? styles.active : styles.inactive}>
                      {category.is_active ? 'Активна' : 'Неактивна'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button 
                        className={styles.editButton}
                        onClick={() => handleEditClick(category)}
                        title="Редактировать"
                      >
                        ✎
                      </button>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => handleDelete(category.id, category.name)}
                        title="Удалить"
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

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        category={editingCategory}
      />
    </div>
  );
};

export default CategoriesPage;