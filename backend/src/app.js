const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Импортируем маршруты
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');
const imageRoutes = require('./routes/imageRoutes');
const articleRoutes = require('./routes/articleRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// === НАСТРОЙКА CORS (ДЛЯ ВСЕХ ИСТОЧНИКОВ) ===
// ВАЖНО: для разработки разрешаем все источники
app.use(cors({
  origin: true, // разрешает запросы с любого источника
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Для более тонкой настройки можно использовать:
// const allowedOrigins = [
//   'http://localhost:3000',
//   'http://localhost:5000',
//   'https://твой-домен.ru',
//   'http://твой-домен.ru'
// ];
// 
// app.use(cors({
//   origin: function(origin, callback) {
//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true
// }));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  next();
});

// Статические файлы
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Тестовый маршрут
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Сервер работает!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Подключаем маршруты API
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/orders', orderRoutes);

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Маршрут не найден',
    path: req.url
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('❌ Ошибка сервера:', err.stack);
  res.status(500).json({ 
    message: 'Внутренняя ошибка сервера',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

module.exports = app;