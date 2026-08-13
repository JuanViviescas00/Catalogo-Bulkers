import CategoriaRepository from './categoria.repository.js';
import AppError from '../../errors/AppError.js';

const repo = new CategoriaRepository();

export class CategoriaService {
  async listarCategorias() {
    return await repo.obtenerTodas();
  }

  async obtenerPorSlug(slug) {
    const categoria = await repo.obtenerPorSlug(slug);
    if (!categoria) {
      throw new AppError('Categoría no encontrada', 404, 'CATEGORY_NOT_FOUND');
    }
    return categoria;
  }

  async actualizarCategoria(id, { nombre, descripcion, imagenUrl }) {
    const categoria = await repo.obtenerPorId(id);
    if (!categoria) {
      throw new AppError('Categoría no encontrada', 404, 'CATEGORY_NOT_FOUND');
    }

    const datosActualizacion = {};
    if (nombre !== undefined) datosActualizacion.nombre = nombre;
    if (descripcion !== undefined) datosActualizacion.descripcion = descripcion;
    if (imagenUrl !== undefined) datosActualizacion.imagenUrl = imagenUrl;

    return await repo.actualizar(id, datosActualizacion);
  }
}

export default CategoriaService;
