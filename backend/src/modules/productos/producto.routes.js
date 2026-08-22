import { Router } from 'express';
import {
  crearProducto,
  listarProductos,
  obtenerEstadisticas,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto,
} from './producto.controller.js';
import { autenticar, exigirRol } from '../../middlewares/auth.js';

const router = Router();

// Rutas de lectura públicas (para el catálogo e-commerce)
router.get('/', listarProductos);
router.get('/stats', obtenerEstadisticas);
router.get('/:id', obtenerProductoPorId);

// Rutas de administración protegidas
router.post('/', autenticar, exigirRol('admin'), crearProducto);
router.put('/:id', autenticar, exigirRol('admin'), actualizarProducto);
router.delete('/:id', autenticar, exigirRol('admin'), eliminarProducto);

export default router;
