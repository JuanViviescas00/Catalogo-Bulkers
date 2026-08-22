import { Router } from 'express';
import {
  crearCategoria,
  listarCategorias,
  obtenerCategoriaPorSlug,
  actualizarCategoria,
} from './categoria.controller.js';
import { autenticar, exigirRol } from '../../middlewares/auth.js';

const router = Router();

router.get('/', listarCategorias);
router.get('/:slug', obtenerCategoriaPorSlug);

router.use(autenticar);

router.post('/', exigirRol('admin'), crearCategoria);
router.put('/:id', exigirRol('admin'), actualizarCategoria);

export default router;
