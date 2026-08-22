import Usuario from './usuario.model.js';

export class UsuarioRepository {
  async crear(datos) {
    return await Usuario.create(datos);
  }

  async obtenerTodos(filtro = {}, opciones = {}) {
    const { page = 1, limit = 10 } = opciones;
    const skip = (page - 1) * limit;

    const [usuarios, total] = await Promise.all([
      Usuario.find(filtro).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      Usuario.countDocuments(filtro),
    ]);

    return {
      data: usuarios,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    };
  }

  async obtenerPorId(id) {
    return await Usuario.findById(id);
  }

  async obtenerPorEmail(email) {
    return await Usuario.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
  }

  async actualizar(id, datos) {
    return await Usuario.findByIdAndUpdate(id, datos, { new: true, runValidators: true });
  }

  async eliminar(id) {
    return await Usuario.findByIdAndDelete(id);
  }
}

export default UsuarioRepository;
