const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Генерация JWT токена
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Регистрация (обычно закрыта, только админ создает менеджеров)
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password, first_name, last_name, phone, role_id } = req.body;
    
    // Проверяем, существует ли пользователь
    const userExists = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }
    
    // Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Создаем пользователя
    const result = await db.query(
      `INSERT INTO users (role_id, email, password_hash, first_name, last_name, phone, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, email, first_name, last_name, phone`,
      [role_id || 3, email, hashedPassword, first_name, last_name, phone]
    );
    
    const user = result.rows[0];
    
    res.status(201).json({
      message: 'Пользователь создан',
      user,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Вход в систему
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password } = req.body;
    
    // Ищем пользователя
    const result = await db.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.email = $1 AND u.is_active = true`,
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }
    
    const user = result.rows[0];
    
    // Проверяем пароль
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }
    
    // Обновляем время последнего входа
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );
    
    // Убираем пароль из ответа
    delete user.password_hash;
    
    res.json({
      message: 'Успешный вход',
      user,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить данные текущего пользователя
const getMe = async (req, res) => {
  try {
    // req.user должен быть установлен в middleware protect
    const user = req.user;
    
    // Убираем пароль из ответа
    delete user.password_hash;
    
    res.json(user);
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  register,
  login,
  getMe
};