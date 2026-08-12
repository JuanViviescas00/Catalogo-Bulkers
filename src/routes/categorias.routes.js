import { Router } from 'express';
const router = Router();


router.get('/', (req, res) => {
  res.json({ message: 'Lista de categorías con metadata' });
});


router.get('/:slug', (req, res) => {
  res.json({ message: `Obtener categoría por slug: ${req.params.slug}` });
});


router.put('/:id', (req, res) => {
  res.json({ message: `Categoría ${req.params.id} enriquecida` });
});

// NOTA: No existe POST /api/categorias (se crean solas durante el import)

export default router;