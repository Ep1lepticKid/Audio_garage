import React, { useState, useEffect } from 'react';
import styles from './ArticleModal.module.css';

const ArticleModal = ({ isOpen, onClose, onSave, article }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: '',
    author: '',
    is_published: false
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // Функция для транслитерации
  const transliterate = (text) => {
    const map = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
      'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E',
      'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
      'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
      'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
      'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
      ' ': '-', ',': '', '.': '', '!': '', '?': '', ':': '', ';': '',
      '"': '', "'": '', '`': '', '(': '', ')': '', '[': '', ']': ''
    };
    
    return text.split('').map(char => map[char] || char).join('').toLowerCase();
  };

  const generateSlug = () => {
    if (formData.title) {
      const slug = transliterate(formData.title)
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      setFormData(prev => ({ ...prev, slug }));
      
      if (errors.slug) {
        setErrors(prev => ({ ...prev, slug: null }));
      }
    }
  };

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || '',
        slug: article.slug || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        image_url: article.image_url || '',
        author: article.author || '',
        is_published: article.is_published || false
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        image_url: '',
        author: '',
        is_published: false
      });
    }
    setErrors({});
    setServerError('');
  }, [article, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Заголовок обязателен';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug обязателен';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug может содержать только латинские буквы, цифры и дефисы';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Содержание статьи обязательно';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    if (serverError) {
      setServerError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      await onSave(formData);
    } catch (err) {
      setServerError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{article ? 'Редактировать статью' : 'Новая статья'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {serverError && (
          <div className={styles.serverError}>
            <strong>Ошибка:</strong> {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Заголовок *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? styles.error : ''}
              placeholder="Название статьи"
              autoFocus
            />
            {errors.title && <span className={styles.errorMessage}>{errors.title}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="slug">Slug *</label>
            <div className={styles.slugInputGroup}>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className={`${styles.slugInput} ${errors.slug ? styles.error : ''}`}
                placeholder="nazvanie-stati"
              />
              <button 
                type="button" 
                className={styles.generateButton}
                onClick={generateSlug}
                title="Сгенерировать из заголовка"
              >
                ⚡
              </button>
            </div>
            {errors.slug && <span className={styles.errorMessage}>{errors.slug}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="excerpt">Краткое описание</label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows="3"
              placeholder="Краткое описание для превью"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="content">Содержание *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="10"
              placeholder="Полный текст статьи..."
              className={errors.content ? styles.error : ''}
            />
            {errors.content && <span className={styles.errorMessage}>{errors.content}</span>}
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="author">Автор</label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Имя автора"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="image_url">URL изображения</label>
              <input
                type="text"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
              />
              Опубликовать сразу
            </label>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className={styles.saveButton}>
              {article ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArticleModal;