import React, { useState, useEffect } from 'react';
import styles from './ProductModal.module.css';
import ImageUploader from '../../components/Products/ImageUploader'; // NEW: импорт компонента для загрузки изображений

const ProductModal = ({ isOpen, onClose, onSave, product, categories }) => {
  const [formData, setFormData] = useState({
    // Основные поля
    article: '',
    name: '',
    slug: '',
    category_id: '',
    price: '',
    old_price: '',
    
    // Описания
    short_description: '',
    description: '',
    
    // Наличие
    stock_status: 'in_stock',
    quantity: 0,
    delivery_time: '',
    
    // Флаги
    is_new: false,
    is_bestseller: false,
    is_active: true,
    
    // Характеристики (JSON)
    specifications: {}
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [activeTab, setActiveTab] = useState('main'); // NEW: состояние для переключения вкладок

  // Функция для генерации случайного артикула в формате ***-***
  const generateArticle = () => {
    const firstPart = Math.floor(Math.random() * 900 + 100);
    const secondPart = Math.floor(Math.random() * 900 + 100);
    return `${firstPart}-${secondPart}`;
  };

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

  // Генерация slug из названия
  const generateSlug = () => {
    if (formData.name) {
      const slug = transliterate(formData.name)
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      setFormData(prev => ({ ...prev, slug }));
      
      if (errors.slug) {
        setErrors(prev => ({ ...prev, slug: null }));
      }
    }
  };

  // Автоматическая генерация артикула при открытии формы для нового товара
  useEffect(() => {
    if (!product && isOpen && !formData.article) {
      setFormData(prev => ({ 
        ...prev, 
        article: generateArticle() 
      }));
    }
  }, [isOpen, product]);

  // Заполняем форму при редактировании
  useEffect(() => {
    if (product) {
      setFormData({
        article: product.article || '',
        name: product.name || '',
        slug: product.slug || '',
        category_id: product.category_id || '',
        price: product.price || '',
        old_price: product.old_price || '',
        short_description: product.short_description || '',
        description: product.description || '',
        stock_status: product.stock_status || 'in_stock',
        quantity: product.quantity || 0,
        delivery_time: product.delivery_time || '',
        is_new: product.is_new || false,
        is_bestseller: product.is_bestseller || false,
        is_active: product.is_active !== undefined ? product.is_active : true,
        specifications: product.specifications || {}
      });
    } else {
      // Сбрасываем форму для нового товара
      setFormData({
        article: generateArticle(),
        name: '',
        slug: '',
        category_id: '',
        price: '',
        old_price: '',
        short_description: '',
        description: '',
        stock_status: 'in_stock',
        quantity: 0,
        delivery_time: '',
        is_new: false,
        is_bestseller: false,
        is_active: true,
        specifications: {}
      });
    }
    setErrors({});
    setServerError('');
    setActiveTab('main'); // NEW: сбрасываем на первую вкладку при открытии
  }, [product, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    // Валидация артикула
    if (!formData.article.trim()) {
      newErrors.article = 'Артикул обязателен';
    } else if (!/^\d{3}-\d{3}$/.test(formData.article)) {
      newErrors.article = 'Артикул должен быть в формате 123-456';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug обязателен';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug может содержать только латинские буквы, цифры и дефисы';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'Выберите категорию';
    }
    
    // Проверяем, что цена не пустая и корректная
    if (!formData.price || formData.price === '') {
      newErrors.price = 'Цена обязательна';
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Введите корректную цену';
    }
    
    // Проверяем старую цену, только если она заполнена
    if (formData.old_price && formData.old_price !== '') {
      if (isNaN(formData.old_price) || parseFloat(formData.old_price) < 0) {
        newErrors.old_price = 'Введите корректную цену';
      }
    }
    
    if (formData.quantity < 0) {
      newErrors.quantity = 'Количество не может быть отрицательным';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Для числовых полей оставляем как строку, но не даём вводить отрицательные числа
    if (type === 'number') {
      // Разрешаем только неотрицательные числа
      if (value === '' || parseFloat(value) >= 0) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Очищаем ошибку для этого поля
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Очищаем серверную ошибку
    if (serverError) {
      setServerError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация перед отправкой
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Подготавливаем данные для отправки
    const dataToSend = {
      ...formData,
      // Преобразуем пустые строки в null для числовых полей
      price: formData.price === '' ? null : parseFloat(formData.price),
      old_price: formData.old_price === '' ? null : parseFloat(formData.old_price),
      quantity: formData.quantity === '' ? 0 : parseInt(formData.quantity, 10),
      // Убедимся, что category_id число или null
      category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
    };
    
    try {
      await onSave(dataToSend);
    } catch (err) {
      setServerError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{product ? 'Редактировать товар' : 'Новый товар'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {serverError && (
          <div className={styles.serverError}>
            <strong>Ошибка:</strong> {serverError}
          </div>
        )}

        {/* NEW: Вкладки */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'main' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('main')}
          >
            Основная информация
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'images' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('images')}
          >
            Изображения
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {activeTab === 'main' ? (
            // NEW: Вкладка "Основная информация"
            <>
              {/* Основная информация */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Основная информация</h3>
                
                <div className={styles.row}>
                  <div className={styles.formGroup}>
                    <label htmlFor="article">Артикул *</label>
                    <div className={styles.articleInputGroup}>
                      <input
                        type="text"
                        id="article"
                        name="article"
                        value={formData.article}
                        onChange={handleChange}
                        className={errors.article ? styles.error : ''}
                        placeholder="123-456"
                      />
                      <button 
                        type="button" 
                        className={styles.generateButton}
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          article: generateArticle() 
                        }))}
                        title="Сгенерировать новый артикул"
                      >
                        🎲
                      </button>
                    </div>
                    {errors.article && <span className={styles.errorMessage}>{errors.article}</span>}
                    <small className={styles.helpText}>
                      Формат: три цифры, дефис, три цифры (например, 123-456)
                    </small>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="category_id">Категория *</label>
                    <select
                      id="category_id"
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      className={errors.category_id ? styles.error : ''}
                    >
                      <option value="">Выберите категорию</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    {errors.category_id && <span className={styles.errorMessage}>{errors.category_id}</span>}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="name">Название *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? styles.error : ''}
                    placeholder="Yamaha HS5"
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
                      placeholder="yamaha-hs5"
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
              </div>

              {/* Цены */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Цены</h3>
                
                <div className={styles.row}>
                  <div className={styles.formGroup}>
                    <label htmlFor="price">Цена *</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className={errors.price ? styles.error : ''}
                      placeholder="17990"
                      min="0"
                      step="0.01"
                    />
                    {errors.price && <span className={styles.errorMessage}>{errors.price}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="old_price">Старая цена (со скидкой)</label>
                    <input
                      type="number"
                      id="old_price"
                      name="old_price"
                      value={formData.old_price}
                      onChange={handleChange}
                      className={errors.old_price ? styles.error : ''}
                      placeholder="19990"
                      min="0"
                      step="0.01"
                    />
                    {errors.old_price && <span className={styles.errorMessage}>{errors.old_price}</span>}
                  </div>
                </div>
              </div>

              {/* Наличие */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Наличие на складе</h3>
                
                <div className={styles.row}>
                  <div className={styles.formGroup}>
                    <label htmlFor="stock_status">Статус наличия</label>
                    <select
                      id="stock_status"
                      name="stock_status"
                      value={formData.stock_status}
                      onChange={handleChange}
                    >
                      <option value="in_stock">В наличии</option>
                      <option value="out_of_stock">Нет в наличии</option>
                      <option value="pre_order">Под заказ</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="quantity">Количество</label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      className={errors.quantity ? styles.error : ''}
                      min="0"
                    />
                    {errors.quantity && <span className={styles.errorMessage}>{errors.quantity}</span>}
                  </div>
                </div>

                {formData.stock_status === 'out_of_stock' && (
                  <div className={styles.formGroup}>
                    <label htmlFor="delivery_time">Срок поставки</label>
                    <input
                      type="text"
                      id="delivery_time"
                      name="delivery_time"
                      value={formData.delivery_time}
                      onChange={handleChange}
                      placeholder="3-5 дней"
                    />
                    <small className={styles.helpText}>
                      Например: "3-5 дней" или "под заказ, 2 недели"
                    </small>
                  </div>
                )}
              </div>

              {/* Описания */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Описания</h3>
                
                <div className={styles.formGroup}>
                  <label htmlFor="short_description">Краткое описание</label>
                  <textarea
                    id="short_description"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Краткое описание для карточки товара"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description">Полное описание</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Подробное описание товара"
                  />
                </div>
              </div>

              {/* Флаги */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Дополнительно</h3>
                
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      name="is_new"
                      checked={formData.is_new}
                      onChange={handleChange}
                    />
                    Новинка
                  </label>

                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      name="is_bestseller"
                      checked={formData.is_bestseller}
                      onChange={handleChange}
                    />
                    Хит продаж
                  </label>

                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                    />
                    Активен (показывать на сайте)
                  </label>
                </div>
              </div>
            </>
          ) : (
            // NEW: Вкладка "Изображения"
            <div className={styles.tabContent}>
              <ImageUploader 
                productId={product?.id} 
                onImagesChange={() => {}} 
              />
            </div>
          )}

          {/* Кнопки внизу - всегда видны */}
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className={styles.saveButton}>
              {product ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;