import Producto from './producto.model.js';

export class ProductoRepository {
  async crear(datos) {
    return await Producto.create(datos);
  }

  async obtenerTodos(filtro = {}, opciones = {}) {
    const { page = 1, limit = 20 } = opciones;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Producto.find(filtro).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      Producto.countDocuments(filtro),
    ]);

    return { data, page, limit, total };
  }

  async obtenerPorId(id) {
    return await Producto.findById(id);
  }

  async obtenerPorSku(sku) {
    return await Producto.findOne({ sku: sku.toUpperCase() });
  }

  async actualizar(id, datos) {
    return await Producto.findByIdAndUpdate(id, datos, { new: true, runValidators: true });
  }

  async desactivar(id) {
    return await Producto.findByIdAndUpdate(
      id,
      { activo: false, disponible: false },
      { new: true }
    );
  }

  async obtenerEstadisticas() {
    const [totalProductosResult, precioPromedioResult, porCategoriaResult] = await Promise.all([
      Producto.countDocuments({ activo: true }),
      Producto.aggregate([
        { $match: { activo: true } },
        { $group: { _id: null, promedio: { $avg: '$precio' } } },
      ]),
      Producto.aggregate([
        { $match: { activo: true } },
        { $group: { _id: '$categoria', count: { $sum: 1 } } },
        { $project: { _id: 0, categoria: '$_id', count: 1 } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const totalProductos = totalProductosResult;
    const precioPromedio =
      precioPromedioResult.length > 0
        ? parseFloat(precioPromedioResult[0].promedio.toFixed(2))
        : 0;

    return {
      totalProductos,
      precioPromedio,
      porCategoria: porCategoriaResult,
    };
  }
}

export default ProductoRepository;
