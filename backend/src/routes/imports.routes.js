import { Router } from 'express';
const router = Router();


router.post('/', (req, res) => {
  // Responde 202 en milisegundos tras validar y encolar en BullMQ
  res.status(202).json({
    importJobId: 'job_id_simulado',
    estado: 'pending'
  });
});


router.get('/', (req, res) => {
  res.json({ message: 'Lista paginada de trabajos de importación' });
});


router.get('/:id', (req, res) => {
  res.json({ message: `Estado del import job ${req.params.id}` });
});

export default router;