import { Router } from 'express';
const router = Router();


router.get('/', (req, res) => {
  res.json({ message: 'Lista paginada de proveedores' });
});


router.get('/:id', (req, res) => {
  res.json({ message: `Obtener proveedor ${req.params.id}` });
});


router.post('/', (req, res) => {
  res.status(201).json({ message: 'Proveedor creado' });
});


router.put('/:id', (req, res) => {
  res.json({ message: `Proveedor ${req.params.id} actualizado` });
});


router.delete('/:id', (req, res) => {
  res.status(204).send();
});

export default router;