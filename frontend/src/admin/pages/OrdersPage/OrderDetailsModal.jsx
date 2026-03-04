import React, { useState } from 'react';
import styles from './OrderDetailsModal.module.css';

const OrderDetailsModal = ({ isOpen, onClose, orderData, onStatusChange }) => {
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !orderData) return null;

  const { order, items, history } = orderData;

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!newStatus) return;

    // Если выбран статус "Отменен" (ID: 6)
    if (newStatus === "6") {
      const confirmCancel = window.confirm(
        '⚠️ ВНИМАНИЕ!\n\nВы действительно хотите отменить заказ?\n\n' +
        'Заказ будет помечен как "Отменен".\n' +
        'Это действие нельзя отменить.'
      );
      if (!confirmCancel) return;
    }

    setLoading(true);
    try {
      await onStatusChange(order.id, parseInt(newStatus), comment);
      setNewStatus('');
      setComment('');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'new': '#00ff88',
      'processing': '#ffa500',
      'confirmed': '#7a914b',
      'paid': '#00ff88',
      'shipped': '#00ccff',
      'delivered': '#00ff88',
      'cancelled': '#ff4444'
    };
    return colors[status] || '#b8ae8e';
  };

  const getStatusText = (status) => {
    const texts = {
      'new': 'Новый',
      'processing': 'В обработке',
      'confirmed': 'Подтвержден',
      'paid': 'Оплачен',
      'shipped': 'Отправлен',
      'delivered': 'Доставлен',
      'cancelled': 'Отменен'
    };
    return texts[status] || status;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            Заказ №{order.order_number}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalContent}>
          {/* Статус заказа */}
          <div className={styles.currentStatus}>
            <span className={styles.statusLabel}>Текущий статус:</span>
            <span 
              className={styles.statusBadge}
              style={{ 
                background: getStatusColor(order.status_name),
                color: order.status_name === 'cancelled' ? 'white' : '#2b2a24'
              }}
            >
              {getStatusText(order.status_name)}
            </span>
          </div>

          {/* Форма изменения статуса */}
          <form onSubmit={handleStatusSubmit} className={styles.statusForm}>
            <h3 className={styles.sectionTitle}>Изменить статус</h3>
            
            <div className={styles.formGroup}>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className={styles.select}
                required
              >
                <option value="">Выберите статус</option>
                <option value="2">В обработке</option>      
                <option value="9">Подтвержден</option>      
                <option value="3">Оплачен</option>          
                <option value="4">Отправлен</option>        
                <option value="5">Доставлен</option>        
                <option value="6">Отменен</option>          
              </select>
            </div>

            <div className={styles.formGroup}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Комментарий к изменению статуса"
                rows="3"
                className={styles.textarea}
              />
            </div>
            
            {/* Предупреждение для статуса отмены */}
            {newStatus === "6" && (
              <div className={styles.cancelWarning}>
                ⚠️ Внимание! Отмена заказа — необратимое действие.
              </div>
            )}
            
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading || !newStatus}
            >
              {loading ? 'Сохранение...' : 'Обновить статус'}
            </button>
          </form>

          {/* Информация о клиенте */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Информация о клиенте</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Имя:</span>
                <span className={styles.infoValue}>{order.customer_name}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Email:</span>
                <span className={styles.infoValue}>{order.customer_email}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Телефон:</span>
                <span className={styles.infoValue}>{order.customer_phone}</span>
              </div>
            </div>
          </div>

          {/* Доставка */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Доставка</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Адрес:</span>
                <span className={styles.infoValue}>{order.delivery_address}</span>
              </div>
              {order.delivery_city && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Город:</span>
                  <span className={styles.infoValue}>{order.delivery_city}</span>
                </div>
              )}
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Способ:</span>
                <span className={styles.infoValue}>
                  {order.delivery_method === 'courier' && 'Курьером'}
                  {order.delivery_method === 'pickup' && 'Самовывоз'}
                  {order.delivery_method === 'post' && 'Почта России'}
                </span>
              </div>
            </div>
          </div>

          {/* Оплата */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Оплата</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Способ:</span>
                  <span className={styles.infoValue}>
                    {order.payment_method === 'card' && 'Банковской картой'}
                    {order.payment_method === 'cash' && 'Наличными'}
                    {order.payment_method === 'invoice' && 'По счету'}
                  </span>
                </div>
                {/* Оставляем до лучших времен блок со статусом оплаты
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Статус:</span>
                  <span className={styles.infoValue}>
                    {order.payment_status === 'paid' ? 'Оплачен' : 'Ожидает оплаты'}
                  </span>
                </div>
                */}
              </div>
            </div>

          {/* Товары в заказе */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Товары</h3>
            <div className={styles.itemsList}>
              {items.map((item, index) => (
                <div key={index} className={styles.itemRow}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.product_name}</div>
                    {item.product_article && (
                      <div className={styles.itemArticle}>Арт: {item.product_article}</div>
                    )}
                  </div>
                  <div className={styles.itemQuantity}>{item.quantity} шт.</div>
                  <div className={styles.itemPrice}>
                    {Number(item.price).toLocaleString('ru-RU')} ₽
                  </div>
                  <div className={styles.itemTotal}>
                    {Number(item.total).toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              ))}
            </div>
            
            <div className={styles.totalSection}>
              <div className={styles.totalRow}>
                <span>Сумма:</span>
                <span>{Number(order.subtotal).toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className={styles.totalRow}>
                <span>Доставка:</span>
                <span>{Number(order.delivery_price).toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>Итого:</span>
                <span>{Number(order.total).toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </div>

          {/* Комментарий */}
          {order.comment && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Комментарий к заказу</h3>
              <p className={styles.comment}>{order.comment}</p>
            </div>
          )}

          {/* История изменений */}
          {history && history.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>История изменений</h3>
              <div className={styles.historyList}>
                {history.map((item, index) => (
                  <div key={index} className={styles.historyItem}>
                    <div className={styles.historyHeader}>
                      <span className={styles.historyDate}>
                        {new Date(item.created_at).toLocaleString('ru-RU')}
                      </span>
                      <span className={styles.historyStatus}>
                        {item.status_from && (
                          <>
                            <span style={{ color: getStatusColor(item.status_from_name) }}>
                              {getStatusText(item.status_from_name)}
                            </span>
                            {' → '}
                          </>
                        )}
                        <span style={{ color: getStatusColor(item.status_to_name) }}>
                          {getStatusText(item.status_to_name)}
                        </span>
                      </span>
                    </div>
                    {item.comment && (
                      <p className={styles.historyComment}>{item.comment}</p>
                    )}
                    {item.created_by_email && (
                      <p className={styles.historyAuthor}>
                        Изменил: {item.created_by_email}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.closeBtn} onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;