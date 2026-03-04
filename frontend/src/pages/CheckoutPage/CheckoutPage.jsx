import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';
import styles from './CheckoutPage.module.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    delivery_address: '',
    delivery_city: '',
    delivery_postal_code: '',
    delivery_method: 'courier',
    payment_method: 'card',
    comment: ''
  });

  const [errors, setErrors] = useState({});

  // Если корзина пуста, перенаправляем в каталог
  React.useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/catalog');
    }
  }, [cartItems, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Укажите имя';
    }

    if (!formData.customer_email.trim()) {
      newErrors.customer_email = 'Укажите email';
    } else if (!/\S+@\S+\.\S+/.test(formData.customer_email)) {
      newErrors.customer_email = 'Некорректный email';
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'Укажите телефон';
    }

    if (!formData.delivery_address.trim()) {
      newErrors.delivery_address = 'Укажите адрес доставки';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    try {
      // Подготавливаем данные для отправки
      const orderData = {
        ...formData,
        items: cartItems.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_article: item.article,
          price: item.price,
          quantity: item.quantity
        })),
        subtotal: cartTotal,
        delivery_price: 0, // Пока бесплатная доставка
        total: cartTotal
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при оформлении заказа');
      }

      // Очищаем корзину
      clearCart();

      // Перенаправляем на страницу успеха
      navigate(`/order-success/${data.orderNumber}`);

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deliveryPrice = 0; // Можно добавить логику расчета доставки

  return (
    <div className={styles.checkoutPage}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Оформление заказа</h1>

        <div className={styles.checkoutContent}>
          {/* Форма */}
          <motion.div 
            className={styles.checkoutForm}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <form onSubmit={handleSubmit}>
              <h2 className={styles.sectionTitle}>Контактные данные</h2>
              
              <div className={styles.formGroup}>
                <label htmlFor="customer_name">Имя *</label>
                <input
                  type="text"
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  className={errors.customer_name ? styles.error : ''}
                  placeholder="Иван Иванов"
                />
                {errors.customer_name && (
                  <span className={styles.errorMessage}>{errors.customer_name}</span>
                )}
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label htmlFor="customer_email">Email *</label>
                  <input
                    type="email"
                    id="customer_email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    className={errors.customer_email ? styles.error : ''}
                    placeholder="ivan@example.com"
                  />
                  {errors.customer_email && (
                    <span className={styles.errorMessage}>{errors.customer_email}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="customer_phone">Телефон *</label>
                  <input
                    type="tel"
                    id="customer_phone"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    className={errors.customer_phone ? styles.error : ''}
                    placeholder="+7 (999) 123-45-67"
                  />
                  {errors.customer_phone && (
                    <span className={styles.errorMessage}>{errors.customer_phone}</span>
                  )}
                </div>
              </div>

              <h2 className={styles.sectionTitle}>Доставка</h2>

              <div className={styles.formGroup}>
                <label htmlFor="delivery_address">Адрес доставки *</label>
                <input
                  type="text"
                  id="delivery_address"
                  name="delivery_address"
                  value={formData.delivery_address}
                  onChange={handleChange}
                  className={errors.delivery_address ? styles.error : ''}
                  placeholder="г. Москва, ул. Ленина, д. 1, кв. 1"
                />
                {errors.delivery_address && (
                  <span className={styles.errorMessage}>{errors.delivery_address}</span>
                )}
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label htmlFor="delivery_city">Город</label>
                  <input
                    type="text"
                    id="delivery_city"
                    name="delivery_city"
                    value={formData.delivery_city}
                    onChange={handleChange}
                    placeholder="Москва"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="delivery_postal_code">Индекс</label>
                  <input
                    type="text"
                    id="delivery_postal_code"
                    name="delivery_postal_code"
                    value={formData.delivery_postal_code}
                    onChange={handleChange}
                    placeholder="123456"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="delivery_method">Способ доставки</label>
                <select
                  id="delivery_method"
                  name="delivery_method"
                  value={formData.delivery_method}
                  onChange={handleChange}
                >
                  <option value="courier">Курьером (бесплатно)</option>
                  <option value="pickup">Самовывоз (г. Москва)</option>
                  <option value="post">Почта России</option>
                </select>
              </div>

              <h2 className={styles.sectionTitle}>Оплата</h2>

              <div className={styles.formGroup}>
                <label htmlFor="payment_method">Способ оплаты</label>
                <select
                  id="payment_method"
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                >
                  <option value="card">Банковской картой онлайн</option>
                  <option value="cash">Наличными при получении</option>
                  <option value="invoice">По счету для юр.лиц</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="comment">Комментарий к заказу</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Дополнительная информация по заказу..."
                />
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Оформление...' : 'Подтвердить заказ'}
              </button>
            </form>
          </motion.div>

          {/* Сводка заказа */}
          <motion.div 
            className={styles.orderSummary}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className={styles.sectionTitle}>Ваш заказ</h2>
            
            <div className={styles.cartItems}>
              {cartItems.map(item => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.itemImage}>
                    {item.image ? (
                      <img src={`http://localhost:5000${item.image}`} alt={item.name} />
                    ) : (
                      <div className={styles.noImage}>📷</div>
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <p className={styles.itemPrice}>
                      {Number(item.price).toLocaleString('ru-RU')} ₽ × {item.quantity}
                    </p>
                  </div>
                  <div className={styles.itemTotal}>
                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.summaryTotals}>
              <div className={styles.summaryRow}>
                <span>Товары:</span>
                <span>{cartTotal.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Доставка:</span>
                <span>{deliveryPrice === 0 ? 'Бесплатно' : deliveryPrice.toLocaleString('ru-RU') + ' ₽'}</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Итого:</span>
                <span>{(cartTotal + deliveryPrice).toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;