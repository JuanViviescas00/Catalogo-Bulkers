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

router.get('/', listarProductos);
router.get('/stats', obtenerEstadisticas);
router.get('/:id', obtenerProductoPorId);

router.use(autenticar);

router.post('/', exigirRol('admin'), crearProducto);
router.put('/:id', exigirRol('admin'), actualizarProducto);
router.delete('/:id', exigirRol('admin'), eliminarProducto);

export default router;
