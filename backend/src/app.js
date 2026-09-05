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

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.resolve(__dirname, '../public');

// Servir archivos estáticos del frontend si existe la carpeta public
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

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

// Servir la SPA de Vue para cualquier ruta no capturada por la API
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return next();
  }
  const indexPath = path.join(publicPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(200).json({
    mensaje: 'API Catalogo Bulkers activa en Vercel',
    status: 'ok',
    endpoints: {
      health: '/health',
      productos: '/api/productos',
      categorias: '/api/categorias',
      proveedores: '/api/proveedores',
      auth: '/api/auth/login',
    },
  });
});

// Manejador centralizado de errores (Debe ser el último middleware)
app.use(errorHandler);

export default app;
