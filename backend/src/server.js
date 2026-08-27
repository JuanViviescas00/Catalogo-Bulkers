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

    // Arrancar el servidor Express escuchando en todas las interfaces de red (0.0.0.0)
    app.listen(env.PORT, '0.0.0.0', () => {
      console.log(`[Servidor] Escuchando en http://0.0.0.0:${env.PORT} (Acceso local y en red)`);
    });
  } catch (error) {
    console.error('[Servidor] Error crítico al iniciar:', error.message);
    process.exit(1);
  }
};

startServer();
