const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, isManager } = require('../middlewares/authMiddleware'); // создадим позже

// Публичные маршруты
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Защищенные маршруты (только для менеджеров)
router.post('/', protect, isManager, productController.createProduct);
router.put('/:id', protect, isManager, productController.updateProduct);
router.delete('/:id', protect, isManager, productController.deleteProduct);

module.exports = router;