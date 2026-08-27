import { Queue } from 'bullmq';
import env from '../config/env.js';

let importQueue = null;

try {
  importQueue = new Queue('import-catalog-queue', {
    connection: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    },
  });
} catch (error) {
  console.warn('[BullMQ Queue] Redis no disponible para cola de importaciones:', error.message);
}

export const agregarJobACola = async (jobData) => {
  if (importQueue) {
    return await importQueue.add('procesar-importacion', jobData, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: true,
    });
  }
  return null;
};

export default importQueue;
