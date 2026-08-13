import ImportRepository from './import.repository.js';
import Proveedor from '../proveedores/proveedor.model.js';
import AppError from '../../errors/AppError.js';

const repo = new ImportRepository();

export class ImportService {
  async crearImportJob({ usuarioId, proveedorId, archivo }) {
    if (!archivo) {
      throw new AppError('No se adjuntó ningún archivo para la importación', 400, 'NO_FILE');
    }

    if (!proveedorId) {
      throw new AppError('El campo proveedorId es obligatorio', 400, 'MISSING_PROVEEDOR_ID');
    }

    const proveedor = await Proveedor.findById(proveedorId);
    if (!proveedor) {
      throw new AppError('El proveedor especificado no existe', 404, 'PROVEEDOR_NOT_FOUND');
    }

    if (!proveedor.activo) {
      throw new AppError('El proveedor se encuentra inactivo y no puede recibir importaciones', 409, 'PROVEEDOR_INACTIVE');
    }

    const extension = archivo.originalname.split('.').pop().toLowerCase();
    if (!['csv', 'json'].includes(extension)) {
      throw new AppError('Formato de archivo inválido. Solo se admiten archivos .csv y .json', 400, 'INVALID_FILE_TYPE');
    }

    const jobData = {
      usuarioId,
      proveedorId,
      archivoNombre: archivo.originalname,
      archivoRuta: archivo.path,
      estado: 'pending',
    };

    const nuevoJob = await repo.crearJob(jobData);

    return {
      importJobId: nuevoJob._id,
      estado: nuevoJob.estado,
    };
  }

  async obtenerJobPorId(id, usuario) {
    const job = await repo.obtenerPorId(id);
    if (!job) {
      throw new AppError('Job de importación no encontrado', 404, 'JOB_NOT_FOUND');
    }

    if (usuario.rol !== 'admin' && job.usuarioId.toString() !== usuario.id.toString()) {
      throw new AppError('No tienes permiso para consultar este job de importación', 403, 'FORBIDDEN');
    }

    const total = job.total;
    const procesados = job.procesados;
    const porcentaje = total && total > 0 ? Math.round((procesados / total) * 100) : 0;

    return {
      importJobId: job._id,
      proveedorId: job.proveedorId,
      estado: job.estado,
      total: job.total,
      procesados: job.procesados,
      exitosos: job.exitosos,
      fallidos: job.fallidos,
      porcentaje,
      errores: job.errores,
      startedAt: job.startedAt,
      finishedAt: job.finishedAt,
    };
  }

  async listarJobs(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    return await repo.listarJobs({}, { page, limit });
  }
}

export default ImportService;
