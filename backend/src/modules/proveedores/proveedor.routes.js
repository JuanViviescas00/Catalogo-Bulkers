import { Router } from 'express';
import {
  crearProveedor,
  listarProveedores,
  obtenerProveedorPorId,
  actualizarProveedor,
  eliminarProveedor,
} from './proveedor.controller.js';
import { autenticar, exigirRol } from '../../middlewares/auth.js';

const router = Router();

// Rutas de lectura públicas
router.get('/', listarProveedores);
router.get('/:id', obtenerProveedorPorId);

// Rutas administrativas protegidas
router.post('/', autenticar, exigirRol('admin'), crearProveedor);
router.put('/:id', autenticar, exigirRol('admin'), actualizarProveedor);
router.delete('/:id', autenticar, exigirRol('admin'), eliminarProveedor);

export default router;
