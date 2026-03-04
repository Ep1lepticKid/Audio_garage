import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './ArticlePage.module.css';

const ArticlePage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/articles/${slug}`);
      
      if (!response.ok) {
        throw new Error('Статья не найдена');
      }
      
      const data = await response.json();
      setArticle(data);
    } catch (error) {
      console.error('Ошибка загрузки статьи:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Загрузка статьи...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className={styles.notFound}>
        <h1 className={styles.notFoundTitle}>Статья не найдена</h1>
        <Link to="/articles" className={styles.backLink}>
          ← Вернуться к статьям
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.articlePage}>
      <div className={styles.container}>
        <Link to="/articles" className={styles.backToArticles}>
          ← К списку статей
        </Link>

        <motion.article 
          className={styles.article}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={styles.articleTitle}>{article.title}</h1>

          <div className={styles.articleMeta}>
            {article.author && (
              <span className={styles.articleAuthor}>✍️ {article.author}</span>
            )}
            <span className={styles.articleDate}>🗓️ {article.published_at}</span>
            <span className={styles.articleViews}>👁️ {article.views_count} просмотров</span>
          </div>

          {article.image_url && (
            <div className={styles.articleImage}>
              <img 
                src={`http://localhost:5000${article.image_url}`}
                alt={article.title}
              />
            </div>
          )}

          <div className={styles.articleContent}>
            {article.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </motion.article>
      </div>
    </div>
  );
};

export default ArticlePage;