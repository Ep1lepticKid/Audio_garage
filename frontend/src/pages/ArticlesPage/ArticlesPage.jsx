import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './ArticlesPage.module.css';

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    loadArticles();
  }, [pagination.page]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/articles/published?page=${pagination.page}&limit=${pagination.limit}`);
      const data = await response.json();
      
      setArticles(data.articles || []);
      setPagination(data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      });
    } catch (error) {
      console.error('Ошибка загрузки статей:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && articles.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Загрузка статей...</p>
      </div>
    );
  }

  return (
    <div className={styles.articlesPage}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>
          Полезные <span>статьи</span>
        </h1>
        
        {articles.length === 0 ? (
          <p className={styles.noArticles}>Статьи пока не опубликованы</p>
        ) : (
          <>
            <div className={styles.articlesGrid}>
              {articles.map((article, index) => (
                <motion.article
                  key={article.id}
                  className={styles.articleCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/articles/${article.slug}`} className={styles.articleLink}>
                    {article.image_url && (
                      <div className={styles.articleImage}>
                        <img 
                          src={`${process.env.REACT_APP_IMAGE_URL || 'http://localhost:5000'}${article.image_url}`}
                          alt={article.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="' + styles.noImage + '">📰</div>';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className={styles.articleContent}>
                      <h2 className={styles.articleTitle}>{article.title}</h2>
                      
                      {article.excerpt && (
                        <p className={styles.articleExcerpt}>{article.excerpt}</p>
                      )}
                      
                      <div className={styles.articleMeta}>
                        {article.author && (
                          <span>✍️ {article.author}</span>
                        )}
                        <span>🗓️ {article.published_at}</span>
                        <span>👁️ {article.views_count}</span>
                      </div>
                      
                      <span className={styles.readMore}>
                        Читать далее →
                      </span>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>

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
      </div>
    </div>
  );
};

export default ArticlesPage;