import { Router } from 'express';
import {
  crearUsuario,
  listarUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
} from './usuario.controller.js';
import { autenticar, exigirRol } from '../../middlewares/auth.js';

const router = Router();

router.use(autenticar);

router.get('/', exigirRol('admin'), listarUsuarios);
router.get('/:id', exigirRol('admin'), obtenerUsuarioPorId);
router.post('/', exigirRol('admin'), crearUsuario);
router.put('/:id', exigirRol('admin'), actualizarUsuario);
router.delete('/:id', exigirRol('admin'), eliminarUsuario);

export default router;
