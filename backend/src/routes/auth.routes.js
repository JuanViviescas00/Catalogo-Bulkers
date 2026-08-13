import { Router } from 'express';
const router = Router();


router.post('/register', (req, res) => {
  res.status(201).json({ message: 'Registro listo' });
});


router.post('/login', (req, res) => {
  res.json({ token: 'jwt_token_aqui' });
});

export default router;