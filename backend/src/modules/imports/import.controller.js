import ImportService from './import.service.js';

const service = new ImportService();

export const crearImportJob = async (req, res, next) => {
  try {
    const resultado = await service.crearImportJob({
      usuarioId: req.usuario.id,
      proveedorId: req.body?.proveedorId || null,
      tipo: req.body?.tipo || 'todos',
      archivo: req.file,
    });
    res.status(202).json(resultado);
  } catch (error) {
    next(error);
  }
};

export const obtenerImportJobPorId = async (req, res, next) => {
  try {
    const job = await service.obtenerJobPorId(req.params.id, req.usuario);
    res.status(200).json(job);
  } catch (error) {
    next(error);
  }
};

export const listarImportJobs = async (req, res, next) => {
  try {
    const resultado = await service.listarJobs(req.query);
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};
