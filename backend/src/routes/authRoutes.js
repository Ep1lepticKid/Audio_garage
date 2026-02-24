const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

// Валидация для регистрации
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('first_name').optional().trim(),
  body('last_name').optional().trim()
];

// Валидация для входа
const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Публичные маршруты
router.post('/login', loginValidation, authController.login);

// Защищенные маршруты
router.get('/me', protect, authController.getMe);

// Только для админов
router.post('/register', protect, isAdmin, registerValidation, authController.register);

module.exports = router;