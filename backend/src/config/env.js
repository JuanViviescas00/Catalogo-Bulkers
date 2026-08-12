import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
  'PORT',
  'MONGO_URI',
  'REDIS_HOST',
  'REDIS_PORT',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'MAX_FILE_SIZE_MB',
  'BATCH_SIZE',
  'CACHE_TTL_SECONDS',
  'IMPORT_ERRORS_CAP',
];

const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`[ERROR FATAL] Faltan las siguientes variables de entorno obligatorias:`);
  missingEnvVars.forEach((varName) => console.error(`  - ${varName}`));
  process.exit(1);
}

export const env = {
  PORT: parseInt(process.env.PORT, 10) || 3000,
  MONGO_URI: process.env.MONGO_URI,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: parseInt(process.env.REDIS_PORT, 10) || 6379,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 50,
  BATCH_SIZE: parseInt(process.env.BATCH_SIZE, 10) || 500,
  CACHE_TTL_SECONDS: parseInt(process.env.CACHE_TTL_SECONDS, 10) || 300,
  IMPORT_ERRORS_CAP: parseInt(process.env.IMPORT_ERRORS_CAP, 10) || 1000,
};

export default env;
