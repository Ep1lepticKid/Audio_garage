const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, isManager } = require('../middlewares/authMiddleware');

// Публичные маршруты
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Защищенные маршруты (только для менеджеров)
router.post('/', protect, isManager, categoryController.createCategory);
router.put('/:id', protect, isManager, categoryController.updateCategory);
router.delete('/:id', protect, isManager, categoryController.deleteCategory);

module.exports = router;