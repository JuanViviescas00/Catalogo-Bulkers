import ProveedorService from './proveedor.service.js';

const service = new ProveedorService();

export const crearProveedor = async (req, res, next) => {
  try {
    const nuevoProveedor = await service.crearProveedor(req.body);
    res.status(201).json(nuevoProveedor);
  } catch (error) {
    next(error);
  }
};

export const listarProveedores = async (req, res, next) => {
  try {
    const resultado = await service.listarProveedores(req.query);
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};

export const obtenerProveedorPorId = async (req, res, next) => {
  try {
    const proveedor = await service.obtenerPorId(req.params.id);
    res.status(200).json(proveedor);
  } catch (error) {
    next(error);
  }
};

export const actualizarProveedor = async (req, res, next) => {
  try {
    const actualizado = await service.actualizarProveedor(req.params.id, req.body);
    res.status(200).json(actualizado);
  } catch (error) {
    next(error);
  }
};

export const eliminarProveedor = async (req, res, next) => {
  try {
    await service.eliminarProveedor(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};