import Categoria from './categoria.model.js';

export class CategoriaRepository {
  async crear(datos) {
    return await Categoria.create(datos);
  }

  async obtenerTodas() {
    return await Categoria.find().sort({ nombre: 1 }).exec();
  }

  async obtenerPorSlug(slug) {
    return await Categoria.findOne({ slug });
  }

  async obtenerPorNombre(nombre) {
    return await Categoria.findOne({ nombre: nombre.trim() });
  }

  async obtenerPorId(id) {
    return await Categoria.findById(id);
  }

  async actualizar(id, datos) {
    return await Categoria.findByIdAndUpdate(id, datos, { new: true, runValidators: true });
  }
}

export default CategoriaRepository;
