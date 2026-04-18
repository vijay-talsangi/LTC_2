import 'dotenv/config';
import app from './src/app.js';
import { logger } from './src/utils/logger.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`🚀 LTCC Server running on http://localhost:${PORT}`);
  logger.info(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🗄️  Database: Neon PostgreSQL`);
});
