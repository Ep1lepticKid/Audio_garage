import React from 'react';
import { motion } from 'framer-motion';
import styles from './ProductInfo.module.css';

const ProductInfo = ({ product, quantity, setQuantity, onAddToCart }) => {
  const inStock = product.stock_status === 'in_stock' && product.quantity > 0;

  return (
    <div className={styles.productInfo}>
      {/* Артикул и бейджи */}
      <div className={styles.meta}>
        {product.article && (
          <span className={styles.article}>Артикул: {product.article}</span>
        )}
        <div className={styles.badges}>
          {product.is_new && <span className={styles.badgeNew}>Новинка</span>}
          {product.is_bestseller && <span className={styles.badgeBestseller}>Хит продаж</span>}
        </div>
      </div>

      {/* Название */}
      <h1 className={styles.title}>{product.name}</h1>

      {/* Краткое описание */}
      {product.short_description && (
        <p className={styles.shortDescription}>{product.short_description}</p>
      )}

      {/* Цена */}
      <div className={styles.priceBlock}>
        <div className={styles.prices}>
          <span className={styles.currentPrice}>
            {Number(product.price).toLocaleString('ru-RU')} ₽
          </span>
          {product.old_price && (
            <span className={styles.oldPrice}>
              {Number(product.old_price).toLocaleString('ru-RU')} ₽
            </span>
          )}
        </div>
        
        {/* Статус наличия */}
        <div className={`${styles.stock} ${styles[product.stock_status]}`}>
          {product.stock_status === 'in_stock' && product.quantity > 0 && (
            <>В наличии ({product.quantity} шт.)</>
          )}
          {product.stock_status === 'in_stock' && product.quantity === 0 && (
            <>Скоро поступление</>
          )}
          {product.stock_status === 'out_of_stock' && (
            <>Нет в наличии {product.delivery_time && `(поставка: ${product.delivery_time})`}</>
          )}
          {product.stock_status === 'pre_order' && (
            <>Под заказ {product.delivery_time && `(${product.delivery_time})`}</>
          )}
        </div>
      </div>

      {/* Выбор количества и кнопка */}
      {inStock && (
        <div className={styles.actions}>
          <div className={styles.quantitySelector}>
            <button 
              className={styles.quantityBtn}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className={styles.quantity}>{quantity}</span>
            <button 
              className={styles.quantityBtn}
              onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
              disabled={quantity >= product.quantity}
            >
              +
            </button>
          </div>

          <motion.button 
            className={styles.addToCartBtn}
            onClick={onAddToCart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Добавить в корзину
          </motion.button>
        </div>
      )}

      {/* Если товара нет в наличии */}
      {!inStock && (
        <button className={styles.notifyBtn} disabled>
          Сообщить о поступлении
        </button>
      )}
    </div>
  );
};

export default ProductInfo;