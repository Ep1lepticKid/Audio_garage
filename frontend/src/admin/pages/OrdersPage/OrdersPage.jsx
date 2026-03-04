import React, { useEffect, useState } from 'react';
import { ordersApi } from '../../services/orders';
import OrderDetailsModal from './OrderDetailsModal';
import styles from './OrdersPage.module.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [hideCancelled, setHideCancelled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        ...(filters.status && { status: filters.status })
      });
      
      const data = await ordersApi.getAll(`?${params.toString()}`);
      setOrders(data.orders || []);
      setPagination(data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      });
      setError('');
    } catch (err) {
      setError(err.message || 'Ошибка при загрузке заказов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [filters.page, filters.status]);

  const handleViewOrder = async (orderId) => {
    try {
      const data = await ordersApi.getById(orderId);
      setSelectedOrder(data);
      setModalOpen(true);
    } catch (err) {
      setError(err.message || 'Ошибка при загрузке деталей заказа');
    }
  };

  const handleStatusChange = async (orderId, newStatusId, comment) => {
    try {
      await ordersApi.updateStatus(orderId, { status_id: newStatusId, comment });
      await loadOrders(); // Перезагружаем список
      if (selectedOrder?.order.id === orderId) {
        // Обновляем данные в открытом модальном окне
        const updated = await ordersApi.getById(orderId);
        setSelectedOrder(updated);
      }
    } catch (err) {
      throw err;
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  if (loading && orders.length === 0) {
    return <div className={styles.loading}>Загрузка заказов...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Управление <span>заказами</span>
        </h1>
      </div>

      {/* Фильтры */}
      <div className={styles.filters}>
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className={styles.filterSelect}
        >
          <option value="">Все статусы</option>
          <option value="new">Новые</option>
          <option value="processing">В обработке</option>
          <option value="confirmed">Подтвержденные</option>
          <option value="paid">Оплаченные</option>
          <option value="shipped">Отправленные</option>
          <option value="delivered">Доставленные</option>
          <option value="cancelled">Отмененные</option>
        </select>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>№ заказа</th>
              <th>Дата</th>
              <th>Клиент</th>
              <th>Email</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className={styles.orderNumber}>{order.order_number}</td>
                <td>{order.created_at}</td>
                <td>{order.customer_name}</td>
                <td>{order.customer_email}</td>
                <td className={styles.total}>
                  {Number(order.total).toLocaleString('ru-RU')} ₽
                </td>
                <td>
                  <span 
                    className={styles.statusBadge}
                    style={{ 
                      background: getStatusColor(order.status_name),
                      color: order.status_name === 'cancelled' ? 'white' : '#2b2a24'
                    }}
                  >
                    {getStatusText(order.status_name)}
                  </span>
                </td>
                <td>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewOrder(order.id)}
                  >
                    Просмотр
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <label className={styles.hideCancelled}>
        <input
          type="checkbox"
          checked={hideCancelled}
          onChange={(e) => {
            setHideCancelled(e.target.checked);
            setFilters(prev => ({ ...prev, page: 1 }));
          }}
        />
        Скрыть отменённые
      </label>

      {/* Пагинация */}
      {pagination.pages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page === 1}
          >
            ←
          </button>
          
          {[...Array(pagination.pages).keys()].map(num => (
            <button
              key={num + 1}
              className={`${styles.pageBtn} ${filters.page === num + 1 ? styles.active : ''}`}
              onClick={() => handlePageChange(num + 1)}
            >
              {num + 1}
            </button>
          ))}
          
          <button
            className={styles.pageBtn}
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={filters.page === pagination.pages}
          >
            →
          </button>
        </div>
      )}

      {/* Модальное окно с деталями заказа */}
      <OrderDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        orderData={selectedOrder}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default OrdersPage;