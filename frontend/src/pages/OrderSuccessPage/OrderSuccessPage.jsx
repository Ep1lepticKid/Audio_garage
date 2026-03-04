import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './OrderSuccessPage.module.css';

const OrderSuccessPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderNumber]);

  const loadOrder = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/number/${orderNumber}`);
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Ошибка загрузки заказа:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.successPage}>
      <div className={styles.container}>
        <motion.div 
          className={styles.successCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.successIcon}>✓</div>
          
          <h1 className={styles.successTitle}>Спасибо за заказ!</h1>
          
          <p className={styles.successMessage}>
            Номер вашего заказа: <strong>{orderNumber}</strong>
          </p>
          
          <p className={styles.infoText}>
            Мы отправили подтверждение на вашу почту {order?.customer_email}.<br />
            Наш менеджер свяжется с вами в ближайшее время.
          </p>

          <div className={styles.orderDetails}>
            <h2 className={styles.detailsTitle}>Детали заказа</h2>
            
            <div className={styles.detailsRow}>
              <span>Статус:</span>
              <span className={styles.status}>{order?.status_name}</span>
            </div>
            
            <div className={styles.detailsRow}>
              <span>Сумма:</span>
              <span className={styles.total}>
                {Number(order?.total).toLocaleString('ru-RU')} ₽
              </span>
            </div>
            
            <div className={styles.detailsRow}>
              <span>Способ оплаты:</span>
              <span>
                {order?.payment_method === 'card' && 'Банковской картой'}
                {order?.payment_method === 'cash' && 'Наличными'}
                {order?.payment_method === 'invoice' && 'По счету'}
              </span>
            </div>
            
            <div className={styles.detailsRow}>
              <span>Способ доставки:</span>
              <span>
                {order?.delivery_method === 'courier' && 'Курьером'}
                {order?.delivery_method === 'pickup' && 'Самовывоз'}
                {order?.delivery_method === 'post' && 'Почтой'}
              </span>
            </div>
            
            <div className={styles.detailsRow}>
              <span>Адрес доставки:</span>
              <span>{order?.delivery_address}</span>
            </div>
          </div>

          <div className={styles.actions}>
            <Link to="/catalog" className={styles.primaryButton}>
              Продолжить покупки
            </Link>
            <Link to="/" className={styles.secondaryButton}>
              На главную
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;