import { Router } from 'express';
const router = Router();


router.get('/', (req, res) => {
  res.json({
    data: [],
    page: 1,
    limit: 20,
    total: 0
  });
});


router.get('/stats', (req, res) => {
  res.json({
    totalProductos: 0,
    precioPromedio: 0,
    porCategoria: []
  });
});


router.get('/:id', (req, res) => {
  res.json({ message: `Obtener producto ${req.params.id}` });
});


router.post('/', (req, res) => {
  res.status(201).json({ message: 'Producto creado' });
});


router.put('/:id', (req, res) => {
  res.json({ message: `Producto ${req.params.id} actualizado` });
});


router.delete('/:id', (req, res) => {
  res.status(204).send();
});

export default router;