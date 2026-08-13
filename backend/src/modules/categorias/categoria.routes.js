import { Router } from 'express';
import {
  listarCategorias,
  obtenerCategoriaPorSlug,
  actualizarCategoria,
} from './categoria.controller.js';
import { autenticar, exigirRol } from '../../middlewares/auth.js';

const router = Router();

router.use(autenticar);

router.get('/', listarCategorias);
router.get('/:slug', obtenerCategoriaPorSlug);
router.put('/:id', exigirRol('admin'), actualizarCategoria);

export default router;
