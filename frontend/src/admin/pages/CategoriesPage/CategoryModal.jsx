import React, { useState, useEffect } from 'react';
import styles from './CategoryModal.module.css';

const CategoryModal = ({ isOpen, onClose, onSave, category }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sort_order: 0,
    parent_id: null,
    image_url: '',
    is_active: true
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(''); // Для серверных ошибок

  // Функция для транслитерации кириллицы в латиницу
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

  // Генерация slug из названия
  const generateSlug = () => {
    if (formData.name) {
      const slug = transliterate(formData.name)
        .replace(/[^a-z0-9-]/g, '') // Удаляем всё кроме букв, цифр и дефисов
        .replace(/-+/g, '-') // Заменяем несколько дефисов подряд на один
        .replace(/^-|-$/g, ''); // Удаляем дефисы в начале и конце
      
      setFormData(prev => ({ ...prev, slug }));
      
      // Очищаем ошибку для slug если была
      if (errors.slug) {
        setErrors(prev => ({ ...prev, slug: null }));
      }
    }
  };

  // Заполняем форму при редактировании
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        sort_order: category.sort_order || 0,
        parent_id: category.parent_id || null,
        image_url: category.image_url || '',
        is_active: category.is_active !== undefined ? category.is_active : true
      });
    } else {
      // Сбрасываем форму для новой категории
      setFormData({
        name: '',
        slug: '',
        description: '',
        sort_order: 0,
        parent_id: null,
        image_url: '',
        is_active: true
      });
    }
    setErrors({});
    setServerError(''); // Сбрасываем серверную ошибку при открытии
  }, [category, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug обязателен';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug может содержать только латинские буквы, цифры и дефисы';
    }
    
    if (formData.sort_order < 0) {
      newErrors.sort_order = 'Порядок сортировки не может быть отрицательным';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Очищаем ошибку для этого поля
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Очищаем серверную ошибку при любом изменении
    if (serverError) {
      setServerError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация формы
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      await onSave(formData);
    } catch (err) {
      // Обрабатываем серверные ошибки
      setServerError(err.message);
      
      // Если сервер вернул ошибки для конкретных полей (можно расширить)
      if (err.fieldErrors) {
        setErrors(err.fieldErrors);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{category ? 'Редактировать категорию' : 'Новая категория'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {/* Серверная ошибка */}
        {serverError && (
          <div className={styles.serverError}>
            <strong>Ошибка:</strong> {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Название *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? styles.error : ''}
              placeholder="Например: Студийные мониторы"
              autoFocus
            />
            {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
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
                placeholder="Например: studio-monitors"
              />
              <button 
                type="button" 
                className={styles.generateButton}
                onClick={generateSlug}
                title="Сгенерировать из названия"
              >
                ⚡
              </button>
            </div>
            {errors.slug && <span className={styles.errorMessage}>{errors.slug}</span>}
            <small className={styles.helpText}>
              Используется в URL. Только латинские буквы, цифры и дефисы
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Краткое описание категории"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="sort_order">Порядок сортировки</label>
              <input
                type="number"
                id="sort_order"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleChange}
                className={errors.sort_order ? styles.error : ''}
                min="0"
              />
              {errors.sort_order && <span className={styles.errorMessage}>{errors.sort_order}</span>}
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
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              Активна (показывать на сайте)
            </label>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className={styles.saveButton}>
              {category ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;