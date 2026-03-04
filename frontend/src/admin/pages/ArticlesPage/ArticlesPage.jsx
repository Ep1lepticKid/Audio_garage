import React, { useEffect, useState } from 'react';
import { articlesApi } from '../../services/articles';
import ArticleModal from './ArticleModal';
import styles from './ArticlesPage.module.css';

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await articlesApi.getAll();
      setArticles(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Ошибка при загрузке статей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleAddClick = () => {
    setEditingArticle(null);
    setModalOpen(true);
  };

  const handleEditClick = (article) => {
    setEditingArticle(article);
    setModalOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Вы уверены, что хотите удалить статью "${title}"?`)) {
      return;
    }

    try {
      await articlesApi.delete(id);
      await loadArticles();
    } catch (err) {
      setError(err.message || 'Ошибка при удалении');
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingArticle) {
        await articlesApi.update(editingArticle.id, formData);
      } else {
        await articlesApi.create(formData);
      }
      setModalOpen(false);
      await loadArticles();
    } catch (err) {
      throw err;
    }
  };

  if (loading && articles.length === 0) {
    return <div className={styles.loading}>Загрузка статей...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Управление <span>статьями</span>
        </h1>
        <button className={styles.addButton} onClick={handleAddClick}>
          + Новая статья
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Заголовок</th>
              <th>Slug</th>
              <th>Автор</th>
              <th>Статус</th>
              <th>Дата</th>
              <th>Просмотры</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 ? (
              <tr>
                <td colSpan="8" className={styles.emptyMessage}>
                  Нет статей. Создайте первую статью!
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id}>
                  <td>{article.id}</td>
                  <td>{article.title}</td>
                  <td>{article.slug}</td>
                  <td>{article.author || '—'}</td>
                  <td>
                    <span className={article.is_published ? styles.published : styles.draft}>
                      {article.is_published ? 'Опубликовано' : 'Черновик'}
                    </span>
                  </td>
                  <td>{article.published_at || '—'}</td>
                  <td>{article.views_count || 0}</td>
                  <td>
                    <div className={styles.actions}>
                      <button 
                        className={styles.editButton}
                        onClick={() => handleEditClick(article)}
                        title="Редактировать"
                      >
                        ✎
                      </button>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => handleDelete(article.id, article.title)}
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

      <ArticleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        article={editingArticle}
      />
    </div>
  );
};

export default ArticlesPage;