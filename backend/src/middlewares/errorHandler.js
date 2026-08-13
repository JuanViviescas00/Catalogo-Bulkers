import AppError from '../errors/AppError.js';

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.codigo = err.codigo || 'SERVER_ERROR';

  // Manejar duplicados de MongoDB (Código 11000)
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue || {})[0] || 'campo';
    const valor = err.keyValue ? err.keyValue[campo] : '';
    error = new AppError(`El ${campo} '${valor}' ya existe`, 409, 'DUPLICATE_KEY');
  }

  // Manejar errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    const mensajes = Object.values(err.errors).map((val) => val.message);
    error = new AppError(`Error de validación: ${mensajes.join('. ')}`, 400, 'VALIDATION_ERROR');
  }

  // Manejar errores de ID de MongoDB inválido (CastError)
  if (err.name === 'CastError') {
    error = new AppError(`ID inválido: ${err.value}`, 400, 'INVALID_ID');
  }

  // Manejar errores de JWT
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Token de autenticación inválido', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token de autenticación expirado', 401, 'EXPIRED_TOKEN');
  }

  res.status(error.statusCode).json({
    error: {
      codigo: error.codigo,
      mensaje: error.message || 'Error interno del servidor',
    },
  });
};

export default errorHandler;
