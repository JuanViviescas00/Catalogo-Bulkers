import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AuthRepository from './auth.repository.js';
import env from '../../config/env.js';
import AppError from '../../errors/AppError.js';

const repo = new AuthRepository();

export class AuthService {
  async registrar({ email, password, rol = 'user' }) {
    const usuarioExistente = await repo.buscarPorEmail(email);
    if (usuarioExistente) {
      throw new AppError('El correo electrónico ya se encuentra registrado', 409, 'EMAIL_EXISTS');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const nuevoUsuario = await repo.crearUsuario({
      email,
      password: hashedPassword,
      rol,
    });

    return {
      id: nuevoUsuario._id,
      email: nuevoUsuario.email,
      rol: nuevoUsuario.rol,
    };
  }

  async login({ email, password }) {
    const usuario = await repo.buscarPorEmail(email, true);
    if (!usuario) {
      throw new AppError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
    }

    const esPasswordValido = await bcrypt.compare(password, usuario.password);
    if (!esPasswordValido) {
      throw new AppError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
    }

    const payload = {
      sub: usuario._id,
      rol: usuario.rol,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    return { token };
  }
}

export default AuthService;
