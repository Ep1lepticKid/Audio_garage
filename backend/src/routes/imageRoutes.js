const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const upload = require('../middlewares/uploadMiddleware');
const { protect, isManager } = require('../middlewares/authMiddleware');

// Все маршруты требуют авторизации менеджера
router.use(protect, isManager);

// ✅ Обычная загрузка изображения
router.post('/product/:productId', upload.single('image'), imageController.uploadProductImage);

// ✅ Загрузка с сепией — ЭТОТ МАРШРУТ НАМ НУЖЕН
router.post('/product/:productId/sepia', upload.single('image'), imageController.uploadProductImageWithSepia);

// Получить все изображения товара
router.get('/product/:productId', imageController.getProductImages);

// Удалить изображение
router.delete('/:imageId', imageController.deleteImage);

// Установить главное изображение
router.put('/:imageId/set-main', imageController.setMainImage);

// Обновить порядок сортировки
router.put('/order/update', imageController.updateImagesOrder);

module.exports = router;