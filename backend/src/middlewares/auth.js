import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import AppError from '../errors/AppError.js';

export const autenticar = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No se proporcionó un token de autenticación', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    req.usuario = {
      id: decoded.sub,
      rol: decoded.rol,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const exigirRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return next(
        new AppError('No tienes permisos suficientes para realizar esta acción', 403, 'FORBIDDEN')
      );
    }
    next();
  };
};
