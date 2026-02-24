const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function createAdmin() {
  try {
    const email = 'admin@audiogarage.ru';
    const password = 'admin123'; // <--- Смените на свой пароль
    const firstName = 'Главный';
    const lastName = 'Администратор';
    
    // Генерируем хеш пароля
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Проверяем, существует ли пользователь
    const checkResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (checkResult.rows.length > 0) {
      // Обновляем существующего
      await pool.query(
        'UPDATE users SET password_hash = $1, first_name = $2, last_name = $3, is_active = true WHERE email = $4',
        [passwordHash, firstName, lastName, email]
      );
      console.log('✅ Пароль администратора обновлён');
    } else {
      // Создаём нового
      await pool.query(
        'INSERT INTO users (role_id, email, password_hash, first_name, last_name, is_active) VALUES (1, $1, $2, $3, $4, true)',
        [email, passwordHash, firstName, lastName]
      );
      console.log('✅ Администратор создан');
    }
    
    console.log(`   Email: ${email}`);
    console.log(`   Пароль: ${password}`);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await pool.end();
  }
}

createAdmin();