import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import proveedorRoutes from './modules/proveedores/proveedor.routes.js';
import categoriaRoutes from './modules/categorias/categoria.routes.js';
import productoRoutes from './modules/productos/producto.routes.js';
import usuarioRoutes from './modules/usuarios/usuario.routes.js';
import importRoutes from './modules/imports/import.routes.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    const permitido = !origin ||
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||
      /^https?:\/\/.*\.vercel\.app$/.test(origin) ||
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin);
    callback(null, permitido);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint de salud (Healthcheck)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', mongo: 'up' });
});

// Rutas de la API (Prefijo /api)
app.use('/api/auth', authRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/imports', importRoutes);

// Manejador centralizado de errores (Debe ser el último middleware)
app.use(errorHandler);

export default app;
