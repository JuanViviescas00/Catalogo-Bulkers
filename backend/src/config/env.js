import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Buscar .env en la carpeta del backend y como fallback en el directorio actual
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT, 10) || 3000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/catalogobulk',
  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_PORT: parseInt(process.env.REDIS_PORT, 10) || 6379,
  JWT_SECRET: process.env.JWT_SECRET || 'cambiar_en_produccion',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 50,
  BATCH_SIZE: parseInt(process.env.BATCH_SIZE, 10) || 500,
  CACHE_TTL_SECONDS: parseInt(process.env.CACHE_TTL_SECONDS, 10) || 300,
  IMPORT_ERRORS_CAP: parseInt(process.env.IMPORT_ERRORS_CAP, 10) || 1000,
};

if (!env.MONGO_URI || !env.MONGO_URI.startsWith('mongodb')) {
  console.error('[ERROR FATAL] MONGO_URI no es una cadena de conexión válida de MongoDB:', env.MONGO_URI);
  env.MONGO_URI = 'mongodb://127.0.0.1:27017/catalogobulk';
}

export default env;
