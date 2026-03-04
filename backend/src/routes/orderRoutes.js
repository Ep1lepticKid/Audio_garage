const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, isManager } = require('../middlewares/authMiddleware');

// Публичные маршруты
router.post('/', orderController.createOrder);
router.get('/number/:orderNumber', orderController.getOrderByNumber);

// Маршруты для админки (только для менеджеров)
router.get('/', protect, isManager, orderController.getAllOrders);
router.get('/:id', protect, isManager, orderController.getOrderDetails);
router.put('/:id/status', protect, isManager, orderController.updateOrderStatus);

module.exports = router;