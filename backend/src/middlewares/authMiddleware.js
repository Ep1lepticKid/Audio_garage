const db = require('../config/database');
const jwt = require('jsonwebtoken');

// Защита маршрутов (проверка JWT токена)
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Проверяем заголовок Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Для разработки: если нет токена, но мы в режиме разработки,
    // создаем тестового пользователя (временное решение!)
    if (!token && process.env.NODE_ENV === 'development') {
      console.log('⚠️ Режим разработки: создаем тестового пользователя');
      
      // Находим первого менеджера в базе
      const userResult = await db.query(
        `SELECT u.*, r.name as role_name 
         FROM users u 
         LEFT JOIN roles r ON u.role_id = r.id 
         WHERE u.is_active = true AND r.name IN ('admin', 'manager')
         LIMIT 1`
      );
      
      if (userResult.rows.length > 0) {
        req.user = userResult.rows[0];
        return next();
      }
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Не авторизован. Токен отсутствует.' });
    }
    
    // Верифицируем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Проверяем, существует ли пользователь
    const userResult = await db.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.id = $1 AND u.is_active = true`,
      [decoded.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    
    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Недействительный токен' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Токен истек' });
    }
    
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Проверка прав менеджера
const isManager = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Не авторизован' });
  }
  
  if (req.user.role_name !== 'admin' && req.user.role_name !== 'manager') {
    return res.status(403).json({ message: 'Доступ запрещен. Требуются права менеджера.' });
  }
  
  next();
};

// Проверка прав администратора
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Не авторизован' });
  }
  
  if (req.user.role_name !== 'admin') {
    return res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора.' });
  }
  
  next();
};

module.exports = { protect, isManager, isAdmin };