import bcrypt from 'bcrypt';
import AppError from '../../errors/AppError.js';
import UsuarioRepository from './usuario.repository.js';

const repo = new UsuarioRepository();

export class UsuarioService {
  async crearUsuario(datos) {
    const email = String(datos.email || '').trim().toLowerCase();
    const nombre = String(datos.nombre || '').trim();

    if (!nombre) {
      throw new AppError('El nombre es requerido', 400, 'NAME_REQUIRED');
    }

    if (!email) {
      throw new AppError('El email es requerido', 400, 'EMAIL_REQUIRED');
    }

    if (!datos.password) {
      throw new AppError('La contraseña es requerida', 400, 'PASSWORD_REQUIRED');
    }

    const existe = await repo.obtenerPorEmail(email);
    if (existe) {
      throw new AppError('Ya existe un usuario con ese email', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(datos.password, 10);

    return await repo.crear({
      nombre,
      email,
      password: passwordHash,
      rol: datos.rol || 'admin',
      activo: datos.activo ?? true,
    });
  }

  async listarUsuarios(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const filtro = {};

    if (query.rol) filtro.rol = query.rol;
    if (query.activo !== undefined) filtro.activo = query.activo === 'true';

    return await repo.obtenerTodos(filtro, { page, limit });
  }

  async obtenerPorId(id) {
    const usuario = await repo.obtenerPorId(id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
    }
    return usuario;
  }

  async actualizarUsuario(id, datos) {
    const usuario = await repo.obtenerPorId(id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
    }

    if (datos.email) {
      const email = String(datos.email).trim().toLowerCase();
      const duplicado = await repo.obtenerPorEmail(email);
      if (duplicado && duplicado._id.toString() !== id) {
        throw new AppError('Ya existe otro usuario con ese email', 409, 'EMAIL_EXISTS');
      }
      datos.email = email;
    }

    if (datos.password) {
      datos.password = await bcrypt.hash(datos.password, 10);
    }

    return await repo.actualizar(id, datos);
  }

  async eliminarUsuario(id) {
    const usuario = await repo.obtenerPorId(id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
    }

    return await repo.eliminar(id);
  }
}

export default UsuarioService;
