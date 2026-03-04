import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import styles from './CartPage.module.css';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    cartTotal 
  } = useCart();

  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <div className={styles.container}>
          <h1 className={styles.title}>Корзина пуста</h1>
          <p className={styles.emptyMessage}>
            Добавьте товары в корзину, чтобы оформить заказ
          </p>
          <Link to="/catalog" className={styles.continueShopping}>
            Перейти в каталог
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Корзина</h1>
        
        <div className={styles.cartContent}>
          {/* Список товаров */}
          <div className={styles.cartItems}>
            {cartItems.map(item => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemImage}>
                  {item.image ? (
                    <img 
                      src={`${process.env.REACT_APP_IMAGE_URL}${item.image}`}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="' + styles.noImage + '">📷</div>';
                      }}
                    />
                  ) : (
                    <div className={styles.noImage}>📷</div>
                  )}
                </div>
                
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <p className={styles.itemPrice}>
                    {Number(item.price).toLocaleString('ru-RU')} ₽
                  </p>
                </div>
                
                <div className={styles.itemQuantity}>
                  <button 
                    className={styles.quantityBtn}
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span className={styles.quantity}>{item.quantity}</span>
                  <button 
                    className={styles.quantityBtn}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.maxStock}
                  >
                    +
                  </button>
                  <span className={styles.stockInfo}>
                    Доступно: {item.maxStock} шт.
                  </span>
                </div>
                
                <div className={styles.itemTotal}>
                  {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                </div>
                
                <button 
                  className={styles.removeBtn}
                  onClick={() => removeFromCart(item.id)}
                  title="Удалить"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          {/* Итоговая информация */}
          <div className={styles.cartSummary}>
            <h2 className={styles.summaryTitle}>Итого</h2>
            
            <div className={styles.summaryRow}>
              <span>Товаров:</span>
              <span>{cartItems.length}</span>
            </div>
            
            <div className={styles.summaryRow}>
              <span>Количество:</span>
              <span>
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)} шт.
              </span>
            </div>
            
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Общая сумма:</span>
              <span>{cartTotal.toLocaleString('ru-RU')} ₽</span>
            </div>
            
            <div className={styles.cartActions}>
              <button 
                className={styles.checkoutBtn}
                onClick={() => navigate('/checkout')}
              >
                Оформить заказ
              </button>
              
              <button 
                className={styles.clearCartBtn}
                onClick={clearCart}
              >
                Очистить корзину
              </button>
            </div>
            
            <Link to="/catalog" className={styles.continueLink}>
              ← Продолжить покупки
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;