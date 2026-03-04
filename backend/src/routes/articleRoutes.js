const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { protect, isManager } = require('../middlewares/authMiddleware');

// Публичные маршруты
router.get('/published', articleController.getPublishedArticles);
router.get('/:slug', articleController.getArticleBySlug);

// Маршруты для админки (только для менеджеров)
router.get('/', protect, isManager, articleController.getAllArticles);
router.post('/', protect, isManager, articleController.createArticle);
router.put('/:id', protect, isManager, articleController.updateArticle);
router.delete('/:id', protect, isManager, articleController.deleteArticle);

module.exports = router;