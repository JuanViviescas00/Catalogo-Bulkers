import { Worker } from 'bullmq';
import env from '../config/env.js';
import ImportService from '../modules/imports/import.service.js';

let importWorker = null;
const service = new ImportService();

try {
  importWorker = new Worker(
    'import-catalog-queue',
    async (job) => {
      console.log(`[BullMQ Worker] Procesando Job ${job.id} (ImportJob: ${job.data.importJobId})...`);
      const { registros, tipo, proveedorId, importJobId } = job.data;
      return await service.procesarRegistros(registros, tipo, proveedorId, importJobId);
    },
    {
      connection: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
      },
      concurrency: 2,
    }
  );

  importWorker.on('completed', (job) => {
    console.log(`[BullMQ Worker] Job ${job.id} completado con éxito.`);
  });

  importWorker.on('failed', (job, err) => {
    console.error(`[BullMQ Worker] Job ${job?.id} falló:`, err.message);
  });
} catch (error) {
  console.warn('[BullMQ Worker] Redis no disponible para Worker:', error.message);
}

export default importWorker;
