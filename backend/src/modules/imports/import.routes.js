import { Router } from 'express';
import {
  crearImportJob,
  obtenerImportJobPorId,
  listarImportJobs,
} from './import.controller.js';
import { autenticar, exigirRol } from '../../middlewares/auth.js';
import { uploadMiddleware } from '../../middlewares/upload.js';

const router = Router();

router.use(autenticar);

router.post(
  '/',
  exigirRol('admin'),
  uploadMiddleware.single('archivo'),
  crearImportJob
);

router.get('/:id', obtenerImportJobPorId);
router.get('/', exigirRol('admin'), listarImportJobs);

export default router;
