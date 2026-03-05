import React, { useState, useCallback, useEffect } from 'react';
import { imagesApi } from '../../services/images';
import styles from './ImageUploader.module.css';

const ImageUploader = ({ productId, onImagesChange }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [applySepia, setApplySepia] = useState(false);

  // Загрузка существующих изображений
  const loadImages = useCallback(async () => {
    if (!productId) {
      console.log('productId отсутствует, загрузка не выполняется');
     return;
    }
    console.log('Загружаем изображения для productId:', productId);
    try {
      const data = await imagesApi.getByProduct(productId);
      console.log('Загруженные изображения:', data); // <-- Добавь эту строку
      setImages(data);
    } catch (err) {
      console.error('Ошибка загрузки изображений:', err);
    }
  }, [productId]);

  React.useEffect(() => {
    if (productId) {
      loadImages();
    }
  }, [productId, loadImages]);

  // Обработка загрузки файла
  const handleFile = async (file) => {
    if (!productId) {
      setError('Сначала сохраните товар');
      return;
    }

    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Файл слишком большой. Максимальный размер 5MB');
      return;
    }

    // Проверка типа
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
      setError('Можно загружать только изображения (JPEG, PNG, GIF, WebP)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;
      if (applySepia) {
        // Загружаем с обработкой сепии
        result = await imagesApi.uploadWithSepia(productId, file);
      } else {
        // Обычная загрузка
        result = await imagesApi.upload(productId, file);
      }
      setImages(prev => [...prev, result.image]);
      if (onImagesChange) onImagesChange();
    } catch (err) {
      setError(err.message || 'Ошибка при загрузке');
    } finally {
      setLoading(false);
    }
  };

  // Обработка выбора файла через input
  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  // Обработка drag-and-drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  // Удаление изображения
  const handleDelete = async (e, imageId) => {
    e.stopPropagation();
    if (!window.confirm('Удалить изображение?')) return;

    try {
      await imagesApi.delete(imageId);
      // После удаления, перезагружаем список
      loadImages(); // Добавь вызов loadImages
      if (onImagesChange) onImagesChange();
    } catch (err) {
      setError(err.message || 'Ошибка при удалении');
    }
  };

  // Установка главного изображения
  const handleSetMain = async (e, imageId) => {
    e.stopPropagation();
    try {
      await imagesApi.setMain(imageId);
      // После установки главного, перезагружаем список
      loadImages(); // Добавь вызов loadImages
      if (onImagesChange) onImagesChange();
    } catch (err) {
      setError(err.message || 'Ошибка при установке главного фото');
    }
  };

  console.log('applySepia state:', applySepia);
  console.log('Styles exist:', styles.sepiaToggle ? 'Yes' : 'No');

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}

      {/* Переключатель сепии */}
      <div className={styles.sepiaToggle}>
        <label className={styles.sepiaCheckbox}>
          <input
            type="checkbox"
            checked={applySepia}
            onChange={(e) => setApplySepia(e.target.checked)}
          />
          <span className={styles.sepiaIcon}>🎨</span>
          <span>Применить эффект сепии при загрузке</span>
        </label>
        {applySepia && (
          <div className={styles.sepiaPreview}>
            <small>Изображение будет обработано и сохранено в стиле "ретро"</small>
          </div>
        )}
      </div>

      {/* Область загрузки */}
      <div
        className={`${styles.dropZone} ${dragActive ? styles.dragActive : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="fileInput"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileInput}
          className={styles.fileInput}
          disabled={loading}
        />
        <label htmlFor="fileInput" className={styles.dropZoneLabel}>
          {loading ? (
            <span>Загрузка...</span>
          ) : (
            <>
              <span className={styles.dropIcon}>📸</span>
              <span>Перетащите изображение сюда или кликните для выбора</span>
              <small className={styles.hint}>
                Максимальный размер: 5MB. Поддерживаются: JPEG, PNG, GIF, WebP
              </small>
            </>
          )}
        </label>
      </div>

      {/* Список изображений */}
      {images.length > 0 && (
        <div className={styles.imageGrid}>
          {images.map((image) => {
            // Универсально получаем URL изображения
            const imageUrl = image.url || image.image_url;

            console.log('Отображение изображения:', image, 'URL:', imageUrl);
           
            return (
              <div key={image.id} className={styles.imageCard}>
                <img 
                  src={`${process.env.REACT_APP_IMAGE_URL || 'http://localhost:5000'}${imageUrl}`}
                  alt="Товар"
                  className={styles.image}
                  onError={(e) => {
                    console.log('Ошибка загрузки изображения:', imageUrl);
                    e.target.onerror = null;
                    e.target.src = 'none'; 
                  }}
                />
                <div className={styles.imageOverlay}>
                  {image.is_main ? (
                    <span className={styles.mainBadge}>Главное</span>
                  ) : (
                    <button
                      className={styles.mainButton}
                      onClick={(e) => handleSetMain(e, image.id)}
                      title="Сделать главным"
                    >
                      ☆
                    </button>
                  )}
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => handleDelete(e, image.id)}
                    title="Удалить"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;