import app from '../src/app.js';
import connectDB from '../src/config/db.js';
import sembrarAdmin from '../src/scripts/seed.js';

// Inicializar conexión a base de datos
connectDB()
  .then(() => sembrarAdmin())
  .catch((err) => console.error('[Vercel Serverless DB Error]:', err));

export default app;
