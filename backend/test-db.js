const { Pool } = require('pg');
const { execSync } = require('child_process');

// Функция для получения IP Windows
function getWindowsIP() {
  try {
    // Первый способ: через ip route
    const ipRoute = execSync('ip route | grep default | awk \'{print $3}\'', { encoding: 'utf8' }).trim();
    if (ipRoute) return ipRoute;
    
    // Второй способ: через resolv.conf
    const resolv = execSync('cat /etc/resolv.conf | grep nameserver | awk \'{print $2}\'', { encoding: 'utf8' }).trim();
    if (resolv) return resolv;
    
    // Третий способ: через ip addr
    const ipAddr = execSync('ip addr show eth0 | grep inet | awk \'{print $2}\' | cut -d/ -f1', { encoding: 'utf8' }).trim();
    if (ipAddr) return ipAddr;
    
    return null;
  } catch (error) {
    console.error('Ошибка при определении IP:', error.message);
    return null;
  }
}

// Получаем реальный IP Windows
const windowsIP = getWindowsIP();
console.log('🌐 IP Windows (по данным WSL):', windowsIP || 'не удалось определить');

// Формируем список для тестирования с реальным IP
const configs = [
  { name: 'localhost (WSL)', host: 'localhost' },
  { name: '127.0.0.1 (WSL)', host: '127.0.0.1' },
  { name: 'IPv6 localhost', host: '::1' },
  ...(windowsIP ? [
    { name: `Windows IP (${windowsIP}) - основной!`, host: windowsIP }
  ] : []),
  { name: 'Шлюз по умолчанию', host: '192.168.1.1' },
  { name: 'Другой частый адрес', host: '172.17.0.1' },
];

// Параметры подключения - ВСТАВЬТЕ СВОИ ДАННЫЕ!
const DB_CONFIG = {
  user: 'postgres',
  password: '123456789',  // <--- ВСТАВЬТЕ ПАРОЛЬ
  database: 'audiogarage_db',
  port: 5432,
  connectionTimeoutMillis: 3000, // Таймаут 3 секунды
};

async function testConnection(config) {
  console.log(`\n🔍 Тестируем: ${config.name} (${config.host})`);
  
  const pool = new Pool({
    ...DB_CONFIG,
    host: config.host,
  });

  const startTime = Date.now();
  
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT version() as ver, now() as time');
    const timeTaken = Date.now() - startTime;
    
    console.log(`✅ УСПЕХ! (${timeTaken}ms)`);
    console.log(`   Версия PostgreSQL: ${res.rows[0].ver.substring(0, 50)}...`);
    console.log(`   Время сервера: ${res.rows[0].time}`);
    
    client.release();
    await pool.end();
    return true;
  } catch (err) {
    const timeTaken = Date.now() - startTime;
    console.log(`❌ ОШИБКА (${timeTaken}ms): ${err.message}`);
    
    // Дополнительная диагностика
    if (err.code === 'ECONNREFUSED') {
      console.log(`   👉 Подключение доходит, но порт 5432 не отвечает`);
      console.log(`   👉 Проверьте в Windows: запущен ли PostgreSQL и слушает ли он сеть`);
    } else if (err.code === 'ETIMEDOUT') {
      console.log(`   👉 Таймаут - возможно, брандмауэр блокирует`);
    } else if (err.code === '28P01') {
      console.log(`   👉 Неверный пароль!`);
    } else if (err.code === '3D000') {
      console.log(`   👉 База данных не существует`);
    }
    
    return false;
  }
}

async function runTests() {
  console.log('🔄 Проверка подключения из WSL к PostgreSQL на Windows...\n');
  console.log('📋 Параметры подключения:');
  console.log(`   Пользователь: ${DB_CONFIG.user}`);
  console.log(`   База данных: ${DB_CONFIG.database}`);
  console.log(`   Порт: ${DB_CONFIG.port}`);
  console.log('='.repeat(60));
  
  let success = false;
  
  for (const config of configs) {
    const result = await testConnection(config);
    if (result) success = true;
  }
  
  console.log('\n' + '='.repeat(60));
  if (success) {
    console.log('✅ Найдено рабочее подключение! Используйте этот host в .env');
  } else {
    console.log('❌ Ни одно подключение не сработало. Проверьте:');
    console.log('   1. Пароль в DB_CONFIG (сейчас: ' + DB_CONFIG.password + ')');
    console.log('   2. Включите все разрешения в PostgreSQL (listen_addresses = "*")');
    console.log('   3. Добавьте правило в pg_hba.conf для подсети WSL');
    console.log('   4. Проверьте брандмауэр Windows');
    console.log('   5. Перезапустите PostgreSQL после изменений');
  }
}

// Запускаем тесты
runTests().catch(console.error);