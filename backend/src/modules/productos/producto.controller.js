import ProductoService from './producto.service.js';

const service = new ProductoService();

export const crearProducto = async (req, res, next) => {
  try {
    const nuevoProducto = await service.crearProducto(req.body);
    res.status(201).json(nuevoProducto);
  } catch (error) {
    next(error);
  }
};

export const listarProductos = async (req, res, next) => {
  try {
    const resultado = await service.listarProductos(req.query);
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};

export const obtenerEstadisticas = async (req, res, next) => {
  try {
    const stats = await service.obtenerEstadisticas();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

export const obtenerProductoPorId = async (req, res, next) => {
  try {
    const producto = await service.obtenerPorId(req.params.id);
    res.status(200).json(producto);
  } catch (error) {
    next(error);
  }
};

export const actualizarProducto = async (req, res, next) => {
  try {
    const actualizado = await service.actualizarProducto(req.params.id, req.body);
    res.status(200).json(actualizado);
  } catch (error) {
    next(error);
  }
};

export const eliminarProducto = async (req, res, next) => {
  try {
    await service.eliminarProducto(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
