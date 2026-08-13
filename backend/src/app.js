import express from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import proveedorRoutes from './modules/proveedores/proveedor.routes.js';
import categoriaRoutes from './modules/categorias/categoria.routes.js';
import productoRoutes from './modules/productos/producto.routes.js';
import importRoutes from './modules/imports/import.routes.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

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
app.use('/api/imports', importRoutes);

// Manejador centralizado de errores (Debe ser el último middleware)
app.use(errorHandler);

export default app;
