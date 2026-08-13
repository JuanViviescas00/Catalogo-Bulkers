import mongoose from 'mongoose';
import env from './env.js';

/**
 * Conecta a la base de datos MongoDB con reintentos automáticos
 */
export const connectDB = async (retries = 5, delay = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(env.MONGO_URI);
      console.log(`[MongoDB] Conectado exitosamente: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`[MongoDB] Intento ${attempt}/${retries} fallido al conectar: ${error.message}`);
      if (attempt === retries) {
        console.error('[MongoDB] No se pudo conectar a la base de datos tras múltiples intentos.');
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export default connectDB;
