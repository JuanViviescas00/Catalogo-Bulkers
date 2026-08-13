export class AppError extends Error {
  constructor(message, statusCode = 500, codigo = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.codigo = codigo;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
