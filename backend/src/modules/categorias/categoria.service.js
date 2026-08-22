import CategoriaRepository from './categoria.repository.js';
import AppError from '../../errors/AppError.js';

const repo = new CategoriaRepository();

const crearSlug = (texto) =>
  texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'categoria';

export class CategoriaService {
  async crearCategoria({ nombre, descripcion, imagenUrl }) {
    const nombreLimpio = nombre?.trim();
    if (!nombreLimpio) {
      throw new AppError('El nombre de la categoría es requerido', 400, 'CATEGORY_NAME_REQUIRED');
    }

    const slug = crearSlug(nombreLimpio);
    const slugExistente = await repo.obtenerPorSlug(slug);
    if (slugExistente) {
      throw new AppError('El slug de la categoría ya existe', 409, 'SLUG_EXISTS');
    }

    const nombreExistente = await repo.obtenerPorNombre(nombreLimpio);
    if (nombreExistente) {
      throw new AppError('El nombre de la categoría ya existe', 409, 'NAME_EXISTS');
    }

    return await repo.crear({
      nombre: nombreLimpio,
      slug,
      descripcion: descripcion?.trim() || '',
      imagenUrl: imagenUrl?.trim() || '',
    });
  }

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
    if (nombre !== undefined) {
      const nombreLimpio = nombre.trim();
      if (!nombreLimpio) {
        throw new AppError('El nombre de la categoría es requerido', 400, 'CATEGORY_NAME_REQUIRED');
      }
      datosActualizacion.nombre = nombreLimpio;
      datosActualizacion.slug = crearSlug(nombreLimpio);
    }
    if (descripcion !== undefined) datosActualizacion.descripcion = descripcion;
    if (imagenUrl !== undefined) datosActualizacion.imagenUrl = imagenUrl;

    return await repo.actualizar(id, datosActualizacion);
  }
}

export default CategoriaService;
