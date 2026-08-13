import ImportJob from './importJob.model.js';

export class ImportRepository {
  async crearJob(datos) {
    return await ImportJob.create(datos);
  }

  async obtenerPorId(id) {
    return await ImportJob.findById(id);
  }

  async listarJobs(filtro = {}, opciones = {}) {
    const { page = 1, limit = 20 } = opciones;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      ImportJob.find(filtro).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      ImportJob.countDocuments(filtro),
    ]);

    return { data, page, limit, total };
  }

  async actualizarEstado(id, datos) {
    return await ImportJob.findByIdAndUpdate(id, datos, { new: true });
  }
}

export default ImportRepository;
