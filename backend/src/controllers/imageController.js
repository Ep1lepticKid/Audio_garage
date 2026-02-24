const db = require('../config/database');
const path = require('path');
const fs = require('fs');

// Загрузка изображения для товара
const uploadProductImage = async (req, res) => {
  try {
    const productId = req.params.productId;
    
    const productCheck = await db.query(
      'SELECT id FROM products WHERE id = $1',
      [productId]
    );
    
    if (productCheck.rows.length === 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Товар не найден' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }
    
    const imageUrl = `/uploads/products/${req.file.filename}`;
    
    const imagesCount = await db.query(
      'SELECT COUNT(*) FROM product_images WHERE product_id = $1',
      [productId]
    );
    
    const isMain = parseInt(imagesCount.rows[0].count) === 0;
    
    const result = await db.query(
      `INSERT INTO product_images (product_id, image_url, is_main, sort_order)
       VALUES ($1, $2, $3, $4)
       RETURNING id, image_url, is_main`,
      [productId, imageUrl, isMain, parseInt(imagesCount.rows[0].count)]
    );
    
    res.status(201).json({
      message: 'Изображение загружено',
      image: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка при загрузке изображения:', error);
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Ошибка при удалении файла:', unlinkError);
      }
    }
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Загрузка изображения с применением сепии
const uploadProductImageWithSepia = async (req, res) => {
  try {
    const productId = req.params.productId;
    const sharp = require('sharp');
    const path = require('path');
    const fs = require('fs');
    
    // Проверяем, существует ли товар
    const productCheck = await db.query(
      'SELECT id FROM products WHERE id = $1',
      [productId]
    );
    
    if (productCheck.rows.length === 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Товар не найден' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }
    
    // Генерируем имя для обработанного файла
    const parsedPath = path.parse(req.file.path);
    const sepiaFilename = `${parsedPath.name}-sepia${parsedPath.ext}`;
    const sepiaPath = path.join(parsedPath.dir, sepiaFilename);
    
    // Альтернативный способ создания сепии через цветовые фильтры
    await sharp(req.file.path)
      .modulate({
        brightness: 1.1,  // Немного увеличиваем яркость
        saturation: 0.7,   // Уменьшаем насыщенность
      })
      .tint({ r: 255, g: 200, b: 150 }) // Тонируем в тёплые тона
      .toFile(sepiaPath);
    
    // Удаляем оригинальный файл
    fs.unlinkSync(req.file.path);
    
    // Формируем URL для доступа к обработанному файлу
    const imageUrl = `/uploads/products/${sepiaFilename}`;
    
    // Определяем, будет ли это первым изображением
    const imagesCount = await db.query(
      'SELECT COUNT(*) FROM product_images WHERE product_id = $1',
      [productId]
    );
    
    const isMain = parseInt(imagesCount.rows[0].count) === 0;
    
    // Сохраняем информацию о изображении в БД
    const result = await db.query(
      `INSERT INTO product_images (product_id, image_url, is_main, sort_order)
       VALUES ($1, $2, $3, $4)
       RETURNING id, image_url, is_main`,
      [productId, imageUrl, isMain, parseInt(imagesCount.rows[0].count)]
    );
    
    res.status(201).json({
      message: 'Изображение загружено и обработано сепией',
      image: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка при обработке изображения:', error);
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Ошибка при удалении файла:', unlinkError);
      }
    }
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить все изображения товара
const getProductImages = async (req, res) => {
  try {
    const productId = req.params.productId;
    
    const result = await db.query(
      `SELECT id, image_url, is_main, sort_order, created_at
       FROM product_images
       WHERE product_id = $1
       ORDER BY sort_order`,
      [productId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении изображений:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удалить изображение
const deleteImage = async (req, res) => {
  try {
    const imageId = req.params.imageId;
    
    const imageResult = await db.query(
      'SELECT image_url, product_id, is_main FROM product_images WHERE id = $1',
      [imageId]
    );
    
    if (imageResult.rows.length === 0) {
      return res.status(404).json({ message: 'Изображение не найдено' });
    }
    
    const image = imageResult.rows[0];
    const wasMain = image.is_main;
    
    await db.query('DELETE FROM product_images WHERE id = $1', [imageId]);
    
    const filePath = path.join(__dirname, '../../', image.image_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    if (wasMain) {
      const remainingImages = await db.query(
        'SELECT id FROM product_images WHERE product_id = $1 ORDER BY sort_order LIMIT 1',
        [image.product_id]
      );
      
      if (remainingImages.rows.length > 0) {
        await db.query(
          'UPDATE product_images SET is_main = true WHERE id = $1',
          [remainingImages.rows[0].id]
        );
      }
    }
    
    res.json({ message: 'Изображение удалено' });
  } catch (error) {
    console.error('Ошибка при удалении изображения:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Установить изображение как главное
const setMainImage = async (req, res) => {
  try {
    const imageId = req.params.imageId;
    
    const imageResult = await db.query(
      'SELECT product_id FROM product_images WHERE id = $1',
      [imageId]
    );
    
    if (imageResult.rows.length === 0) {
      return res.status(404).json({ message: 'Изображение не найдено' });
    }
    
    const productId = imageResult.rows[0].product_id;
    
    await db.query(
      'UPDATE product_images SET is_main = false WHERE product_id = $1',
      [productId]
    );
    
    await db.query(
      'UPDATE product_images SET is_main = true WHERE id = $1',
      [imageId]
    );
    
    res.json({ message: 'Главное изображение обновлено' });
  } catch (error) {
    console.error('Ошибка при установке главного изображения:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновить порядок сортировки изображений
const updateImagesOrder = async (req, res) => {
  try {
    const { images } = req.body;
    
    for (const img of images) {
      await db.query(
        'UPDATE product_images SET sort_order = $1 WHERE id = $2',
        [img.sort_order, img.id]
      );
    }
    
    res.json({ message: 'Порядок изображений обновлён' });
  } catch (error) {
    console.error('Ошибка при обновлении порядка изображений:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  uploadProductImage,
  uploadProductImageWithSepia,
  getProductImages,
  deleteImage,
  setMainImage,
  updateImagesOrder
};