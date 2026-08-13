import ProductoRepository from './producto.repository.js';
import Proveedor from '../proveedores/proveedor.model.js';
import AppError from '../../errors/AppError.js';
import mongoose from 'mongoose';

const repo = new ProductoRepository();

export class ProductoService {
  async crearProducto(datos) {
    const skuFormateado = datos.sku.trim().toUpperCase();
    const skuExistente = await repo.obtenerPorSku(skuFormateado);
    if (skuExistente) {
      throw new AppError('El SKU del producto ya se encuentra registrado', 409, 'SKU_EXISTS');
    }

    const proveedor = await Proveedor.findById(datos.proveedorId);
    if (!proveedor) {
      throw new AppError('El proveedor especificado no existe', 404, 'PROVEEDOR_NOT_FOUND');
    }
    if (!proveedor.activo) {
      throw new AppError('El proveedor especificado se encuentra inactivo', 409, 'PROVEEDOR_INACTIVE');
    }

    return await repo.crear({
      ...datos,
      sku: skuFormateado,
      categoria: datos.categoria.trim().toLowerCase(),
    });
  }

  async listarProductos(query) {
    const page = parseInt(query.page, 10) || 1;
    let limit = parseInt(query.limit, 10) || 20;
    if (limit > 100) limit = 100;

    const filtro = { activo: true };

    if (query.categoria) {
      filtro.categoria = query.categoria.trim().toLowerCase();
    }

    if (query.disponible !== undefined) {
      filtro.disponible = query.disponible === 'true';
    }

    if (query.proveedor) {
      if (mongoose.Types.ObjectId.isValid(query.proveedor)) {
        filtro.proveedorId = query.proveedor;
      } else {
        const proveedor = await Proveedor.findOne({ slug: query.proveedor.trim().toLowerCase() });
        if (proveedor) {
          filtro.proveedorId = proveedor._id;
        } else {
          return { data: [], page, limit, total: 0 };
        }
      }
    }

    return await repo.obtenerTodos(filtro, { page, limit });
  }

  async obtenerEstadisticas() {
    return await repo.obtenerEstadisticas();
  }

  async obtenerPorId(id) {
    const producto = await repo.obtenerPorId(id);
    if (!producto || !producto.activo) {
      throw new AppError('Producto no encontrado', 404, 'PRODUCT_NOT_FOUND');
    }
    return producto;
  }

  async actualizarProducto(id, datos) {
    const productoExistente = await repo.obtenerPorId(id);
    if (!productoExistente || !productoExistente.activo) {
      throw new AppError('Producto no encontrado', 404, 'PRODUCT_NOT_FOUND');
    }

    if (datos.sku) {
      const skuFormateado = datos.sku.trim().toUpperCase();
      if (skuFormateado !== productoExistente.sku) {
        const skuOcupado = await repo.obtenerPorSku(skuFormateado);
        if (skuOcupado) {
          throw new AppError('El SKU especificado ya pertenece a otro producto', 409, 'SKU_EXISTS');
        }
        datos.sku = skuFormateado;
      }
    }

    if (datos.categoria) {
      datos.categoria = datos.categoria.trim().toLowerCase();
    }

    return await repo.actualizar(id, datos);
  }

  async eliminarProducto(id) {
    const producto = await repo.obtenerPorId(id);
    if (!producto || !producto.activo) {
      throw new AppError('Producto no encontrado', 404, 'PRODUCT_NOT_FOUND');
    }

    // Borrado lógico / Desactivación
    return await repo.desactivar(id);
  }
}

export default ProductoService;
