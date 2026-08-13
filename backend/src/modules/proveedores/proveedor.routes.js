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

// Todas las rutas requieren autenticación
router.use(autenticar);

router.get('/', listarProveedores);
router.get('/:id', obtenerProveedorPorId);

// Solo administradores pueden crear, editar o desactivar proveedores
router.post('/', exigirRol('admin'), crearProveedor);
router.put('/:id', exigirRol('admin'), actualizarProveedor);
router.delete('/:id', exigirRol('admin'), eliminarProveedor);

export default router;
