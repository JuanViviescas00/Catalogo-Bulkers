import ProveedorRepository from './proveedor.repository.js';
import AppError from '../../errors/AppError.js';
import Producto from '../productos/producto.model.js';

const repo = new ProveedorRepository();

export class ProveedorService {
  async crearProveedor(datos) {
    const slugExistente = await repo.obtenerPorSlug(datos.slug);
    if (slugExistente) {
      throw new AppError('El slug del proveedor ya existe', 409, 'SLUG_EXISTS');
    }

    const nombreExistente = await repo.obtenerPorNombre(datos.nombre);
    if (nombreExistente) {
      throw new AppError('El nombre del proveedor ya existe', 409, 'NAME_EXISTS');
    }

    return await repo.crear(datos);
  }

  async listarProveedores(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const filtro = {};

    if (query.activo !== undefined) {
      filtro.activo = query.activo === 'true';
    }

    return await repo.obtenerTodos(filtro, { page, limit });
  }

  async obtenerPorId(id) {
    const proveedor = await repo.obtenerPorId(id);
    if (!proveedor) {
      throw new AppError('Proveedor no encontrado', 404, 'PROVEEDOR_NOT_FOUND');
    }
    return proveedor;
  }

  async actualizarProveedor(id, datos) {
    const proveedorExistente = await repo.obtenerPorId(id);
    if (!proveedorExistente) {
      throw new AppError('Proveedor no encontrado', 404, 'PROVEEDOR_NOT_FOUND');
    }

    if (datos.slug && datos.slug !== proveedorExistente.slug) {
      const slugOcupado = await repo.obtenerPorSlug(datos.slug);
      if (slugOcupado) {
        throw new AppError('El slug especificado ya está en uso', 409, 'SLUG_EXISTS');
      }
    }

    return await repo.actualizar(id, datos);
  }

  async eliminarProveedor(id) {
    const proveedor = await repo.obtenerPorId(id);
    if (!proveedor) {
      throw new AppError('Proveedor no encontrado', 404, 'PROVEEDOR_NOT_FOUND');
    }

    // Borrado lógico / Desactivar conservando el registro
    return await repo.desactivar(id);
  }
}

export default ProveedorService;