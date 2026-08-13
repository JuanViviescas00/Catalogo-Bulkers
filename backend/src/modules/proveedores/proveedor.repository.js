import Proveedor from './proveedor.model.js';

export class ProveedorRepository {
  async crear(datos) {
    return await Proveedor.create(datos);
  }

  async obtenerTodos(filtro = {}, opciones = {}) {
    const { page = 1, limit = 20 } = opciones;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Proveedor.find(filtro).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      Proveedor.countDocuments(filtro),
    ]);

    return { data, page, limit, total };
  }

  async obtenerPorId(id) {
    return await Proveedor.findById(id);
  }

  async obtenerPorSlug(slug) {
    return await Proveedor.findOne({ slug });
  }

  async obtenerPorNombre(nombre) {
    return await Proveedor.findOne({ nombre });
  }

  async actualizar(id, datos) {
    return await Proveedor.findByIdAndUpdate(id, datos, { new: true, runValidators: true });
  }

  async desactivar(id) {
    return await Proveedor.findByIdAndUpdate(id, { activo: false }, { new: true });
  }
}

export default ProveedorRepository;
