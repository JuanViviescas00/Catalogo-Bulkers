import AuthService from './auth.service.js';

const service = new AuthService();

export const registrar = async (req, res, next) => {
  try {
    const usuario = await service.registrar(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const resultado = await service.login(req.body);
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};
