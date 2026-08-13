import { createClient } from 'redis';
import env from './env.js';

const redisClient = createClient({
  socket: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT
  }
});

redisClient.on('error', (error) => {
  console.error('[Redis] Error:', error.message);
});

redisClient.on('connect', () => {
  console.log('[Redis] Conectando...');
});

redisClient.on('ready', () => {
  console.log('[Redis] Conectado y listo');
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  return redisClient;
};

export default redisClient;