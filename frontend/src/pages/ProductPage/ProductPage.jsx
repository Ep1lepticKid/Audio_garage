import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productsApi } from '../../admin/services/products';
import { useCart } from '../../context/CartContext';
import ImageGallery from './components/ImageGallery';
import ProductInfo from './components/ProductInfo';
import Specifications from './components/Specifications';
import styles from './ProductPage.module.css';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getById(id);
      setProduct(data);
    } catch (err) {
      setError(err.message || 'Ошибка при загрузке товара');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.find(img => img.is_main)?.url || product.images?.[0]?.url,
      quantity: quantity,
      maxStock: product.quantity
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Загрузка товара...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.errorContainer}>
        <h1 className={styles.errorTitle}>Товар не найден</h1>
        <p className={styles.errorMessage}>{error || 'Такого товара не существует'}</p>
        <Link to="/catalog" className={styles.backLink}>
          ← Вернуться в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.productPage}>
      <div className={styles.container}>
        {/* Хлебные крошки */}
        <div className={styles.breadcrumbs}>
          <Link to="/" className={styles.breadcrumbLink}>Главная</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link to="/catalog" className={styles.breadcrumbLink}>Каталог</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          {product.category_name && (
            <>
              <Link to={`/category/${product.category_slug}`} className={styles.breadcrumbLink}>
                {product.category_name}
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
            </>
          )}
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </div>

        {/* Основной контент */}
        <div className={styles.productContent}>
          {/* Галерея изображений */}
          <motion.div 
            className={styles.gallerySection}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ImageGallery images={product.images || []} productName={product.name} />
          </motion.div>

          {/* Информация о товаре */}
          <motion.div 
            className={styles.infoSection}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ProductInfo 
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              onAddToCart={handleAddToCart}
            />
          </motion.div>
        </div>

        {/* Характеристики и описание */}
        <motion.div 
          className={styles.detailsSection}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Specifications product={product} />
        </motion.div>
      </div>
    </div>
  );
};

export default ProductPage;