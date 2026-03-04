const db = require('../config/database');

// Генерация номера заказа
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}${day}-${random}`;
};

// Создание нового заказа (публичный)
const createOrder = async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      delivery_city,
      delivery_postal_code,
      delivery_method,
      payment_method,
      comment,
      items,
      subtotal,
      delivery_price,
      total
    } = req.body;

    // Валидация
    if (!customer_name || !customer_email || !customer_phone || !delivery_address) {
      return res.status(400).json({ message: 'Заполните обязательные поля' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Корзина пуста' });
    }

    // Начинаем транзакцию
    await db.query('BEGIN');

    try {
      // Генерируем номер заказа
      const orderNumber = generateOrderNumber();

      // Создаем заказ
      const orderResult = await db.query(
        `INSERT INTO orders (
          order_number, customer_name, customer_email, customer_phone,
          delivery_address, delivery_city, delivery_postal_code,
          delivery_method, payment_method, comment,
          subtotal, delivery_price, total, status_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 1)
        RETURNING id, order_number`,
        [
          orderNumber, customer_name, customer_email, customer_phone,
          delivery_address, delivery_city, delivery_postal_code,
          delivery_method, payment_method, comment,
          subtotal, delivery_price, total
        ]
      );

      const orderId = orderResult.rows[0].id;

      // Добавляем товары в заказ
      for (const item of items) {
        await db.query(
          `INSERT INTO order_items (
            order_id, product_id, product_name, product_article, price, quantity
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            orderId, item.product_id, item.product_name, item.product_article,
            item.price, item.quantity
          ]
        );

        // Обновляем остаток товара на складе
        await db.query(
          'UPDATE products SET quantity = quantity - $1 WHERE id = $2 AND quantity >= $1',
          [item.quantity, item.product_id]
        );
      }

      // Добавляем запись в историю
      await db.query(
        `INSERT INTO order_history (order_id, status_to, comment)
         VALUES ($1, 1, 'Заказ создан')`,
        [orderId]
      );

      // Завершаем транзакцию
      await db.query('COMMIT');

      res.status(201).json({
        message: 'Заказ успешно создан',
        orderNumber: orderResult.rows[0].order_number
      });

    } catch (err) {
      // Откатываем транзакцию в случае ошибки
      await db.query('ROLLBACK');
      throw err;
    }

  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить заказ по номеру (для страницы "Спасибо")
const getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const result = await db.query(
      `SELECT o.*, os.name as status_name,
              to_char(o.created_at, 'DD.MM.YYYY HH24:MI') as created_at_formatted
       FROM orders o
       LEFT JOIN order_statuses os ON o.status_id = os.id
       WHERE o.order_number = $1`,
      [orderNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    // Получаем товары заказа
    const itemsResult = await db.query(
      `SELECT * FROM order_items WHERE order_id = $1`,
      [result.rows[0].id]
    );

    const order = result.rows[0];
    order.items = itemsResult.rows;

    res.json(order);
  } catch (error) {
    console.error('Ошибка при получении заказа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// ========== АДМИНКА ==========

// Получить все заказы (для админки) - ИСПРАВЛЕНО
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Убрали payment_status из запроса
    let query = `
      SELECT 
        o.id, 
        o.order_number, 
        o.customer_name, 
        o.customer_email,
        o.total, 
        os.name as status_name,
        TO_CHAR(o.created_at, 'DD.MM.YYYY HH24:MI') as created_at
      FROM orders o
      LEFT JOIN order_statuses os ON o.status_id = os.id
    `;

    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` WHERE os.name = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Получаем общее количество
    let countQuery = 'SELECT COUNT(*) FROM orders';
    let countParams = [];
    
    if (status) {
      countQuery = `
        SELECT COUNT(*) 
        FROM orders o
        LEFT JOIN order_statuses os ON o.status_id = os.id
        WHERE os.name = $1
      `;
      countParams = [status];
    }
    
    const countResult = countParams.length > 0 
      ? await db.query(countQuery, countParams)
      : await db.query(countQuery);
      
    const total = parseInt(countResult.rows[0].count);

    res.json({
      orders: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('ОШИБКА при получении заказов:', error);
    res.status(500).json({ 
      message: 'Ошибка сервера',
      error: error.message 
    });
  }
};

// Получить детали заказа (для админки) 
const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await db.query(
      `SELECT 
        o.id, o.order_number, o.customer_name, o.customer_email, o.customer_phone,
        o.delivery_address, o.delivery_city, o.delivery_postal_code, o.delivery_method,
        o.payment_method, o.subtotal, o.delivery_price, o.total, o.comment,
        o.created_at, o.updated_at,
        os.name as status_name,
        os.id as status_id
       FROM orders o
       LEFT JOIN order_statuses os ON o.status_id = os.id
       WHERE o.id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    const itemsResult = await db.query(
      `SELECT * FROM order_items WHERE order_id = $1`,
      [id]
    );

    const historyResult = await db.query(
      `SELECT 
        oh.*, 
        os_from.name as status_from_name,
        os_to.name as status_to_name,
        u.email as user_email  -- Добавляем email пользователя
       FROM order_history oh
       LEFT JOIN order_statuses os_from ON oh.status_from = os_from.id
       LEFT JOIN order_statuses os_to ON oh.status_to = os_to.id
       LEFT JOIN users u ON oh.user_id = u.id  -- Используем user_id вместо created_by
       WHERE oh.order_id = $1
       ORDER BY oh.created_at DESC`,
      [id]
    );

    res.json({
      order: orderResult.rows[0],
      items: itemsResult.rows,
      history: historyResult.rows
    });
  } catch (error) {
    console.error('Ошибка при получении деталей заказа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновить статус заказа
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_id, comment } = req.body;
    const userId = req.user.id;

    // Получаем текущий статус
    const currentStatus = await db.query(
      'SELECT status_id FROM orders WHERE id = $1',
      [id]
    );

    if (currentStatus.rows.length === 0) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    const oldStatus = currentStatus.rows[0].status_id;

    // Начинаем транзакцию
    await db.query('BEGIN');

    try {
      // Обновляем статус в заказе
      await db.query(
        'UPDATE orders SET status_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [status_id, id]
      );

      // Добавляем запись в историю
      await db.query(
        `INSERT INTO order_history (order_id, status_from, status_to, comment, user_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, oldStatus, status_id, comment || null, userId]
      );

      await db.query('COMMIT');

      res.json({ message: 'Статус заказа обновлен' });
    } catch (err) {
      await db.query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error('Ошибка при обновлении статуса:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  createOrder,
  getOrderByNumber,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus
};