const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📝 Режим: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 http://localhost:${PORT}`);
});