const db = require('../config/database');

// Получить все категории
const getCategories = async (req, res) => {
  try {
    const { parent_id, is_active } = req.query;
    
    // Правильное преобразование is_active
    let isActiveValue = true; // по умолчанию
    if (is_active !== undefined) {
      isActiveValue = is_active === 'true' || is_active === true;
    }
    
    console.log('Filtering categories with is_active =', isActiveValue); // для отладки
    
    let query = `
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = true) as products_count,
        (SELECT json_agg(json_build_object(
          'id', sub.id,
          'name', sub.name,
          'slug', sub.slug
        )) FROM categories sub WHERE sub.parent_id = c.id AND sub.is_active = true) as children
      FROM categories c
      WHERE c.is_active = $1
    `;
    
    const queryParams = [isActiveValue];
    let paramIndex = 2;
    
    if (parent_id !== undefined) {
      if (parent_id === 'null') {
        query += ` AND c.parent_id IS NULL`;
      } else {
        query += ` AND c.parent_id = $${paramIndex}`;
        queryParams.push(parent_id);
        paramIndex++;
      }
    }
    
    query += ` ORDER BY c.sort_order, c.name`;
    
    const result = await db.query(query, queryParams);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить категорию по ID или slug
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const isNumeric = /^\d+$/.test(id);
    
    const query = `
      SELECT 
        c.*,
        (SELECT json_agg(json_build_object(
          'id', p.id,
          'name', p.name,
          'slug', p.slug,
          'price', p.price,
          'main_image', (SELECT image_url FROM product_images WHERE product_id = p.id AND is_main = true LIMIT 1)
        )) FROM products p WHERE p.category_id = c.id AND p.is_active = true) as products
      FROM categories c
      WHERE c.is_active = true AND (${isNumeric ? 'c.id = $1' : 'c.slug = $1'})
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при получении категории:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Создать категорию (для менеджеров)
const createCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      parent_id,
      sort_order,
      image_url,
      is_active
    } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ message: 'Название и slug обязательны' });
    }
    
    const result = await db.query(
      `INSERT INTO categories (name, slug, description, parent_id, sort_order, image_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, true))
       RETURNING *`,
      [
        name,
        slug,
        description || null,
        parent_id || null,
        sort_order || 0,
        image_url || null,
        is_active
      ]
    );
    
    res.status(201).json({
      message: 'Категория успешно создана',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка при создании категории:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Категория с таким slug уже существует' });
    }
    
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновить категорию
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
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
      UPDATE categories 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }
    
    res.json({
      message: 'Категория обновлена',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка при обновлении категории:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удалить категорию (мягкое удаление)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем, есть ли товары в этой категории
    const productsCheck = await db.query(
      'SELECT COUNT(*) FROM products WHERE category_id = $1 AND is_active = true',
      [id]
    );
    
    if (parseInt(productsCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Нельзя удалить категорию, в которой есть товары. Сначала переместите товары в другую категорию.' 
      });
    }
    
    const result = await db.query(
      'UPDATE categories SET is_active = false WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }
    
    res.json({ message: 'Категория удалена' });
  } catch (error) {
    console.error('Ошибка при удалении категории:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};