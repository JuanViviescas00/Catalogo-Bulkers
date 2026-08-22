import app from './app.js';
import env from './config/env.js';
import connectDB from './config/db.js';
import sembrarAdmin from './scripts/seed.js';

const startServer = async () => {
  try {
    // Conectar a la base de datos MongoDB
    await connectDB();

    // Sembrar usuario administrador por defecto si no existe
    await sembrarAdmin();

    // Arrancar el servidor Express
    app.listen(env.PORT, () => {
      console.log(`[Servidor] Escuchando en http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('[Servidor] Error crítico al iniciar:', error.message);
    process.exit(1);
  }
};

startServer();
