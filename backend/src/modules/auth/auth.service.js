import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AuthRepository from './auth.repository.js';
import env from '../../config/env.js';
import AppError from '../../errors/AppError.js';

const repo = new AuthRepository();

export class AuthService {
  async registrar({ email, password, rol = 'user' }) {
    const emailSanitizado = (email || '').trim().toLowerCase();
    const passwordSanitizada = (password || '').trim();

    if (!emailSanitizado) {
      throw new AppError('El correo electrónico es obligatorio', 400, 'MISSING_EMAIL');
    }

    if (!passwordSanitizada) {
      throw new AppError('La contraseña es obligatoria', 400, 'MISSING_PASSWORD');
    }

    const usuarioExistente = await repo.buscarPorEmail(emailSanitizado);
    if (usuarioExistente) {
      throw new AppError('El correo electrónico ya se encuentra registrado', 409, 'EMAIL_EXISTS');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(passwordSanitizada, saltRounds);

    const nuevoUsuario = await repo.crearUsuario({
      email: emailSanitizado,
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
    const emailSanitizado = (email || '').trim().toLowerCase();
    const passwordSanitizada = (password || '').trim();

    if (!emailSanitizado || !passwordSanitizada) {
      throw new AppError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
    }

    const usuario = await repo.buscarPorEmail(emailSanitizado, true);
    if (!usuario) {
      throw new AppError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
    }

    const esPasswordValido = await bcrypt.compare(passwordSanitizada, usuario.password);
    if (!esPasswordValido) {
      throw new AppError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
    }

    const payload = {
      sub: usuario._id,
      email: usuario.email,
      rol: usuario.rol,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    return {
      token,
      usuario: {
        id: usuario._id,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }
}

export default AuthService;
