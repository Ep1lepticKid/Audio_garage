const db = require('../config/database');

console.log('✅ articleController.js загружен');
console.log('Проверка подключения к БД...');

// Получить все опубликованные статьи (для публичной части)
const getPublishedArticles = async (req, res) => {
  try {
    console.log('📥 Запрос статей с параметрами:', req.query);
    
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    console.log(`📊 Пагинация: page=${page}, limit=${limit}, offset=${offset}`);
    
    const result = await db.query(
      `SELECT id, title, slug, excerpt, image_url, author, views_count, 
              TO_CHAR(published_at, 'DD.MM.YYYY') as published_at
       FROM articles 
       WHERE is_published = true 
       ORDER BY published_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    console.log(`✅ Найдено статей: ${result.rows.length}`);
    
    const countResult = await db.query(
      'SELECT COUNT(*) FROM articles WHERE is_published = true'
    );
    
    const total = parseInt(countResult.rows[0].count);
    console.log(`📊 Всего статей: ${total}`);
    
    res.json({
      articles: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ ОШИБКА в getPublishedArticles:', error);
    console.error('📝 Детали ошибки:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Ошибка сервера',
      error: error.message 
    });
  }
};

// Получить одну статью по slug
const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Получаем статью
    const result = await db.query(
      `SELECT id, title, slug, content, excerpt, image_url, author, views_count,
              to_char(published_at, 'DD.MM.YYYY') as published_at,
              to_char(created_at, 'DD.MM.YYYY') as created_at
       FROM articles 
       WHERE slug = $1 AND is_published = true`,
      [slug]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Статья не найдена' });
    }
    
    const article = result.rows[0];
    
    // Увеличиваем счётчик просмотров (один раз)
    await db.query(
      'UPDATE articles SET views_count = views_count + 1 WHERE id = $1',
      [article.id]
    );
    
    // Возвращаем статью с обновлённым счётчиком
    article.views_count += 1;
    
    res.json(article);
  } catch (error) {
    console.error('Ошибка при получении статьи:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// ========== АДМИНКА ==========

// Получить все статьи (для админки)
const getAllArticles = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, title, slug, excerpt, author, is_published, 
              to_char(published_at, 'DD.MM.YYYY') as published_at,
              views_count
       FROM articles 
       ORDER BY created_at DESC`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении статей:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Создать статью
const createArticle = async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      image_url,
      author,
      is_published
    } = req.body;
    
    if (!title || !slug || !content) {
      return res.status(400).json({ message: 'Заголовок, slug и контент обязательны' });
    }
    
    const publishedAt = is_published ? new Date() : null;
    
    const result = await db.query(
      `INSERT INTO articles (title, slug, excerpt, content, image_url, author, is_published, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, title, slug`,
      [title, slug, excerpt || null, content, image_url || null, author || null, is_published || false, publishedAt]
    );
    
    res.status(201).json({
      message: 'Статья создана',
      article: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка при создании статьи:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Статья с таким slug уже существует' });
    }
    
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновить статью
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Если статья публикуется впервые, устанавливаем дату публикации
    if (updates.is_published && !updates.published_at) {
      updates.published_at = new Date();
    }
    
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
      UPDATE articles 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING id, title, slug
    `;
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Статья не найдена' });
    }
    
    res.json({
      message: 'Статья обновлена',
      article: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка при обновлении статьи:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удалить статью
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'DELETE FROM articles WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Статья не найдена' });
    }
    
    res.json({ message: 'Статья удалена' });
  } catch (error) {
    console.error('Ошибка при удалении статьи:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  getPublishedArticles,
  getArticleBySlug,
  getAllArticles,
  createArticle,
  updateArticle,
  deleteArticle
};