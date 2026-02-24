import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ImageGallery.module.css';

const ImageGallery = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  // Если нет изображений, показываем заглушку
  if (!images || images.length === 0) {
    return (
      <div className={styles.gallery}>
        <div className={styles.mainImage}>
          <div className={styles.noImage}>📷</div>
        </div>
        <p className={styles.noImageText}>Нет изображений</p>
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      {/* Главное изображение */}
      <div className={styles.mainImage}>
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedImage}
            src={`http://localhost:5000${images[selectedImage].url}`}
            alt={productName}
            className={styles.mainImg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="' + styles.noImage + '">📷</div>';
            }}
          />
        </AnimatePresence>
      </div>

      {/* Миниатюры */}
      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((img, index) => (
            <button
              key={img.id}
              className={`${styles.thumbnail} ${index === selectedImage ? styles.active : ''}`}
              onClick={() => setSelectedImage(index)}
            >
              <img 
                src={`http://localhost:5000${img.url}`}
                alt={`${productName} - вид ${index + 1}`}
                className={styles.thumbnailImg}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="' + styles.thumbnailPlaceholder + '">📷</span>';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;