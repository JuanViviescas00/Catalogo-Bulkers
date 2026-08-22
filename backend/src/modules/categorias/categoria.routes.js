import { Router } from 'express';
import {
  listarCategorias,
  obtenerCategoriaPorSlug,
  actualizarCategoria,
} from './categoria.controller.js';
import { autenticar, exigirRol } from '../../middlewares/auth.js';

const router = Router();

// Rutas de lectura públicas
router.get('/', listarCategorias);
router.get('/:slug', obtenerCategoriaPorSlug);

// Rutas administrativas protegidas
router.put('/:id', autenticar, exigirRol('admin'), actualizarCategoria);

export default router;
