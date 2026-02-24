const db = require('../config/database');

// Получить все товары (с пагинацией и фильтрацией)
const getProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category_id, 
      min_price, 
      max_price,
      search 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        (SELECT json_agg(json_build_object(
          'id', pi.id,
          'url', pi.image_url,
          'is_main', pi.is_main
        )) FROM product_images pi WHERE pi.product_id = p.id) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    // Добавляем фильтры
    if (category_id) {
      query += ` AND p.category_id = $${paramIndex}`;
      queryParams.push(category_id);
      paramIndex++;
    }
    
    if (min_price) {
      query += ` AND p.price >= $${paramIndex}`;
      queryParams.push(min_price);
      paramIndex++;
    }
    
    if (max_price) {
      query += ` AND p.price <= $${paramIndex}`;
      queryParams.push(max_price);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND p.name ILIKE $${paramIndex}`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    // Добавляем сортировку и пагинацию
    query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);
    
    const result = await db.query(query, queryParams);
    
    // Получаем общее количество для пагинации
    const countResult = await db.query('SELECT COUNT(*) FROM products WHERE is_active = true');
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить один товар по ID или slug
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Пробуем найти по ID или по slug (если передан не число)
    const isNumeric = /^\d+$/.test(id);
    
    let query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        (SELECT json_agg(json_build_object(
          'id', pi.id,
          'url', pi.image_url,
          'is_main', pi.is_main
        ) ORDER BY pi.sort_order) FROM product_images pi WHERE pi.product_id = p.id) as images,
        (SELECT json_agg(r.*) FROM reviews r WHERE r.product_id = p.id AND r.is_approved = true) as reviews
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true AND (${isNumeric ? 'p.id = $1' : 'p.slug = $1'})
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Товар не найден' });
    }
    
    // Увеличиваем счетчик просмотров
    await db.query('UPDATE products SET views_count = views_count + 1 WHERE id = $1', [result.rows[0].id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при получении товара:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Создать товар (для менеджеров)
const createProduct = async (req, res) => {
  try {
    const {
      category_id,
      article,
      name,
      slug,
      description,
      short_description,
      price,
      old_price,
      specifications,
      stock_status,
      quantity,
      delivery_time,
      is_new,
      is_bestseller
    } = req.body;
    
    // Проверка обязательных полей
    if (!name || !price || !slug) {
      return res.status(400).json({ message: 'Название, цена и slug обязательны' });
    }
    
    const result = await db.query(
      `INSERT INTO products (
        category_id, article, name, slug, description, short_description,
        price, old_price, specifications, stock_status, quantity, delivery_time,
        is_new, is_bestseller, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true)
      RETURNING *`,
      [
        category_id || null,
        article,
        name,
        slug,
        description,
        short_description,
        price,
        old_price || null,
        specifications || {},
        stock_status || 'in_stock',
        quantity || 0,
        delivery_time,
        is_new || false,
        is_bestseller || false
      ]
    );
    
    res.status(201).json({
      message: 'Товар успешно создан',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка при создании товара:', error);
    
    // Проверяем на уникальность slug
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Товар с таким slug уже существует' });
    }
    
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновить товар
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Динамически строим запрос обновления
    const setClause = [];
    const values = [];
    let paramIndex = 1;
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'created_at') {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(updates[key]);
        paramIndex++;
      }
    });
    
    if (setClause.length === 0) {
      return res.status(400).json({ message: 'Нет данных для обновления' });
    }
    
    values.push(id);
    
    const query = `
      UPDATE products 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Товар не найден' });
    }
    
    res.json({
      message: 'Товар обновлен',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка при обновлении товара:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удалить товар (мягкое удаление - деактивируем)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Товар не найден' });
    }
    
    res.json({ message: 'Товар удален' });
  } catch (error) {
    console.error('Ошибка при удалении товара:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};