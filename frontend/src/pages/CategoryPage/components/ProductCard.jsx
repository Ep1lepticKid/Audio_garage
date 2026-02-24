import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../../../context/CartContext';
import styles from './ProductCard.module.css';

const ProductCard = ({ product, index }) => {
  const { addToCart } = useCart();

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        delay: index * 0.05,
        type: "spring",
        stiffness: 100
      }
    }
  };

  const getMainImage = () => {
    if (!product.images || product.images.length === 0) {
      return null;
    }
    const mainImage = product.images.find(img => img.is_main);
    return mainImage?.url || product.images[0]?.url;
  };

  const mainImage = getMainImage();

  return (
    <motion.div 
      className={styles.productCard}
      variants={itemVariants}
      whileHover={{ y: -5 }}
    >
      <Link to={`/product/${product.id}`} className={styles.productLink}>
        <div className={styles.productImage}>
          {mainImage ? (
            <img 
              src={`http://localhost:5000${mainImage}`}
              alt={product.name}
              className={styles.image}
              loading="lazy"
            />
          ) : (
            <div className={styles.noImage}>📷</div>
          )}
          
          {/* Бейджи */}
          <div className={styles.badges}>
            {product.is_new && <span className={styles.badgeNew}>Новинка</span>}
            {product.is_bestseller && <span className={styles.badgeBestseller}>Хит</span>}
          </div>

          {/* Статус наличия */}
          <div className={`${styles.stockBadge} ${styles[product.stock_status]}`}>
            {product.stock_status === 'in_stock' && 'В наличии'}
            {product.stock_status === 'out_of_stock' && 'Нет в наличии'}
            {product.stock_status === 'pre_order' && 'Под заказ'}
          </div>
        </div>

        <div className={styles.productInfo}>
          <h3 className={styles.productName}>{product.name}</h3>
          
          <div className={styles.productPrice}>
            <span className={styles.currentPrice}>
              {Number(product.price).toLocaleString('ru-RU')} ₽
            </span>
            {product.old_price && (
              <span className={styles.oldPrice}>
                {Number(product.old_price).toLocaleString('ru-RU')} ₽
              </span>
            )}
          </div>
        </div>
      </Link>

      <button 
        className={styles.addToCartBtn}
        onClick={() => {
          const mainImage = getMainImage();
          console.log('Добавляем товар с изображением:', mainImage); 
          addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: mainImage,  
            quantity: product.quantity,
            maxStock: product.quantity
          });
        }}
        disabled={product.stock_status !== 'in_stock' || product.quantity === 0}
      >
        {product.stock_status === 'in_stock' && product.quantity > 0 
          ? 'В корзину' 
          : 'Нет в наличии'}
      </button>
    </motion.div>
  );
};

export default ProductCard;