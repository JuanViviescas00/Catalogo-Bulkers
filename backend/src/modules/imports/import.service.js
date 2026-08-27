import fs from 'fs/promises';
import { Readable } from 'stream';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import ImportRepository from './import.repository.js';
import Proveedor from '../proveedores/proveedor.model.js';
import Categoria from '../categorias/categoria.model.js';
import Producto from '../productos/producto.model.js';
import AppError from '../../errors/AppError.js';

const repo = new ImportRepository();

const limpiarTexto = (valor) => {
  if (valor === null || valor === undefined) return '';
  return String(valor).trim();
};

const crearSlug = (texto) =>
  limpiarTexto(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';

const normalizarBooleano = (valor, predeterminado = true) => {
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'string') {
    const texto = valor.trim().toLowerCase();
    if (['true', '1', 'si', 's', 'yes', 'y', 'activo', 'enabled'].includes(texto)) return true;
    if (['false', '0', 'no', 'n', 'off', 'disabled'].includes(texto)) return false;
  }
  return predeterminado;
};

const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizarFila = (fila = {}) => {
  const filaNormalizada = {};

  Object.entries(fila).forEach(([clave, valor]) => {
    const nombre = limpiarTexto(clave).toLowerCase().replace(/[^a-z0-9]/g, '');
    filaNormalizada[nombre] = typeof valor === 'string' ? valor.trim() : valor;
  });

  return filaNormalizada;
};

const inferirTipoRegistro = (registro = {}) => {
  const llaves = Object.keys(registro).map((key) => key.toLowerCase());

  if (llaves.some((k) => k.includes('precio') || k.includes('stock') || k.includes('sku') || k.includes('price'))) {
    return 'productos';
  }

  if (llaves.some((k) => k.includes('email') || k.includes('logo') || k.includes('contacto'))) {
    return 'proveedores';
  }

  if (llaves.some((k) => k.includes('descripcion') || k.includes('imagen') || k.includes('categoria'))) {
    return 'categorias';
  }

  return 'productos';
};

const leerArchivoComoRegistros = async (rutaArchivo, nombreArchivo) => {
  const extension = nombreArchivo.split('.').pop()?.toLowerCase();

  if (!['csv', 'json'].includes(extension)) {
    throw new AppError('Formato de archivo inválido. Solo se admiten .csv y .json', 400, 'INVALID_FILE_TYPE');
  }

  const contenido = await fs.readFile(rutaArchivo, 'utf-8');

  if (extension === 'json') {
    const parsed = JSON.parse(contenido);

    const items = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object'
        ? Object.values(parsed)
        : [parsed];

    return items
      .flatMap((item) => {
        if (Array.isArray(item)) return item;
        return [item];
      })
      .filter((item) => item && typeof item === 'object')
      .map(normalizarFila);
  }

  const registros = [];
  await new Promise((resolve, reject) => {
    Readable.from([contenido])
      .pipe(csv({ mapHeaders: ({ header }) => limpiarTexto(header).toLowerCase().replace(/[^a-z0-9]/g, '') }))
      .on('data', (fila) => registros.push(fila))
      .on('end', resolve)
      .on('error', reject);
  });

  return registros;
};

const resolverProveedorPorValor = async (valor, fallbackId = null) => {
  const referencia = limpiarTexto(valor || fallbackId || '');

  if (!referencia) {
    throw new AppError('No se especificó un proveedor válido para la importación', 400, 'MISSING_PROVEEDOR_ID');
  }

  if (mongoose.Types.ObjectId.isValid(referencia)) {
    const proveedor = await Proveedor.findById(referencia);
    if (proveedor) return proveedor;
  }

  const porSlug = await Proveedor.findOne({ slug: crearSlug(referencia) });
  if (porSlug) return porSlug;

  const porNombre = await Proveedor.findOne({ nombre: new RegExp(`^${escaparRegex(referencia)}$`, 'i') });
  if (porNombre) return porNombre;

  const proveedorCreado = await Proveedor.create({
    nombre: referencia,
    slug: crearSlug(referencia),
    contactoEmail: '',
    logoUrl: '',
    activo: true,
  });

  return proveedorCreado;
};

const crearCategoriaSiHaceFalta = async (nombreCategoria) => {
  const nombre = limpiarTexto(nombreCategoria) || 'General';
  const slug = crearSlug(nombre);

  const categoriaExistente = await Categoria.findOne({ $or: [{ slug }, { nombre: new RegExp(`^${escaparRegex(nombre)}$`, 'i') }] });

  if (categoriaExistente) {
    return categoriaExistente;
  }

  return await Categoria.create({
    nombre,
    slug,
    descripcion: '',
    imagenUrl: '',
  });
};

export class ImportService {
  async crearImportJob({ usuarioId, proveedorId, tipo = 'todos', archivo }) {
    if (!archivo) {
      throw new AppError('No se adjuntó ningún archivo para la importación', 400, 'NO_FILE');
    }

    const permisoTipo = ['todos', 'proveedores', 'categorias', 'productos'];
    const tipoNormalizado = permisoTipo.includes(tipo) ? tipo : 'todos';

    const extension = archivo.originalname.split('.').pop().toLowerCase();
    if (!['csv', 'json'].includes(extension)) {
      throw new AppError('Formato de archivo inválido. Solo se admiten archivos .csv y .json', 400, 'INVALID_FILE_TYPE');
    }

    const jobData = {
      usuarioId,
      proveedorId: proveedorId || null,
      archivoNombre: archivo.originalname,
      archivoRuta: archivo.path,
      estado: 'processing',
      total: 0,
      procesados: 0,
      exitosos: 0,
      fallidos: 0,
      errores: [],
      startedAt: new Date(),
    };

    const job = await repo.crearJob(jobData);

    try {
      const registros = await leerArchivoComoRegistros(archivo.path, archivo.originalname);
      job.total = registros.length;
      await job.save();

      // Procesamiento síncrono/asíncrono de registros
      const resumen = await this.procesarRegistros(registros, tipoNormalizado, proveedorId, job._id);

      await repo.actualizarEstado(job._id, {
        estado: 'completed',
        total: resumen.total,
        procesados: resumen.total,
        exitosos: resumen.exitosos,
        fallidos: resumen.fallidos,
        errores: resumen.errores,
        finishedAt: new Date(),
      });

      return {
        importJobId: job._id,
        estado: 'completed',
        total: resumen.total,
        exitosos: resumen.exitosos,
        fallidos: resumen.fallidos,
        errores: resumen.errores,
      };
    } catch (error) {
      await repo.actualizarEstado(job._id, {
        estado: 'failed',
        motivoFallo: error.message,
        fallidos: 1,
        finishedAt: new Date(),
      });

      throw error;
    }
  }

  async procesarRegistros(registros, tipo = 'todos', proveedorId = null, importJobId = null) {
    const grupos = {
      proveedores: [],
      categorias: [],
      productos: [],
    };

    registros.forEach((registro) => {
      const tipoRegistro = inferirTipoRegistro(registro);
      if (grupos[tipoRegistro]) {
        grupos[tipoRegistro].push(registro);
      }
    });

    const tiposAProcesar = tipo === 'todos' ? ['proveedores', 'categorias', 'productos'] : [tipo];
    const resumen = { total: registros.length, exitosos: 0, fallidos: 0, errores: [] };
    let procesadosCount = 0;

    for (const tipoActual of tiposAProcesar) {
      const items = grupos[tipoActual] || [];
      for (const [index, item] of items.entries()) {
        const fila = index + 1;
        procesadosCount += 1;

        try {
          if (tipoActual === 'proveedores') {
            await this.crearProveedorDesdeFila(item);
          } else if (tipoActual === 'categorias') {
            await this.crearCategoriaDesdeFila(item);
          } else if (tipoActual === 'productos') {
            await this.crearProductoDesdeFila(item, proveedorId);
          }

          resumen.exitosos += 1;
        } catch (error) {
          resumen.fallidos += 1;
          resumen.errores.push({
            fila,
            tipo: tipoActual,
            sku: item.sku || item.codigo || 'N/A',
            motivo: error.message,
          });
        }

        // Actualizar progreso incremental en BD cada 5 ítems
        if (importJobId && (procesadosCount % 5 === 0 || procesadosCount === resumen.total)) {
          await repo.actualizarEstado(importJobId, {
            total: resumen.total,
            procesados: procesadosCount,
            exitosos: resumen.exitosos,
            fallidos: resumen.fallidos,
            errores: resumen.errores,
          });
        }
      }
    }

    return resumen;
  }

  async crearProveedorDesdeFila(fila) {
    const nombre = limpiarTexto(fila.nombre || fila.proveedor || fila.titulo || fila.name);
    const email = limpiarTexto(fila.contactoemail || fila.email || fila.contactoEmail || '');
    const logoUrl = limpiarTexto(fila.logourl || fila.logo || fila.logoUrl || '');

    if (!nombre) {
      throw new AppError('El nombre del proveedor es obligatorio', 400, 'PROVEEDOR_NAME_REQUIRED');
    }

    const slugNormalizado = crearSlug(fila.slug || nombre);

    const yaExiste = await Proveedor.findOne({ $or: [{ slug: slugNormalizado }, { nombre: new RegExp(`^${escaparRegex(nombre)}$`, 'i') }] });
    if (yaExiste) {
      yaExiste.contactoEmail = email || yaExiste.contactoEmail;
      yaExiste.logoUrl = logoUrl || yaExiste.logoUrl;
      yaExiste.activo = true;
      return await yaExiste.save();
    }

    return await Proveedor.create({
      nombre,
      slug: slugNormalizado,
      contactoEmail: email,
      logoUrl,
      activo: normalizarBooleano(fila.activo, true),
    });
  }

  async crearCategoriaDesdeFila(fila) {
    const nombre = limpiarTexto(fila.nombre || fila.categoria || fila.titulo || fila.name);
    if (!nombre) {
      throw new AppError('El nombre de la categoría es obligatorio', 400, 'CATEGORY_NAME_REQUIRED');
    }

    const slug = crearSlug(limpiarTexto(fila.slug) || nombre);
    const existe = await Categoria.findOne({ $or: [{ slug }, { nombre: new RegExp(`^${escaparRegex(nombre)}$`, 'i') }] });
    
    if (existe) {
      existe.descripcion = limpiarTexto(fila.descripcion || fila.detalle) || existe.descripcion;
      existe.imagenUrl = limpiarTexto(fila.imagenurl || fila.imagenUrl) || existe.imagenUrl;
      return await existe.save();
    }

    return await Categoria.create({
      nombre,
      slug,
      descripcion: limpiarTexto(fila.descripcion || fila.detalle || ''),
      imagenUrl: limpiarTexto(fila.imagenurl || fila.imagenUrl || ''),
    });
  }

  async crearProductoDesdeFila(fila, proveedorId = null) {
    const sku = limpiarTexto(fila.sku || fila.codigo || fila.idproducto || fila.id || '').toUpperCase();
    const nombre = limpiarTexto(fila.nombre || fila.producto || fila.titulo || fila.name || `Producto ${sku}`);
    const precio = Number(fila.precio || fila.price || 0);
    const stock = Number(fila.stock || fila.inventory || 0);
    const categoriaNombre = limpiarTexto(fila.categoria || fila.categoriaslug || fila.categoriaNombre || 'General');

    if (!sku) {
      throw new AppError('El SKU es obligatorio para cada producto', 400, 'SKU_REQUIRED');
    }

    if (!nombre) {
      throw new AppError('El nombre del producto es obligatorio', 400, 'PRODUCT_NAME_REQUIRED');
    }

    if (Number.isNaN(precio) || precio < 0) {
      throw new AppError('El precio del producto es inválido', 400, 'INVALID_PRICE');
    }

    if (!Number.isFinite(stock) || stock < 0) {
      throw new AppError('El stock del producto es inválido', 400, 'INVALID_STOCK');
    }

    const proveedor = await resolverProveedorPorValor(fila.proveedorid || fila.proveedor || fila.proveedornombre || proveedorId, proveedorId);
    const categoria = await crearCategoriaSiHaceFalta(categoriaNombre);
    const disponible = normalizarBooleano(fila.disponible, stock > 0);

    // UPSERT: Si el SKU ya existe, actualizar; si no, crear nuevo
    const productoExistente = await Producto.findOne({ sku });

    if (productoExistente) {
      productoExistente.nombre = nombre;
      productoExistente.precio = precio;
      productoExistente.stock = stock;
      productoExistente.categoria = categoria.slug;
      productoExistente.descripcion = limpiarTexto(fila.descripcion || fila.detalle) || productoExistente.descripcion;
      productoExistente.imagenUrl = limpiarTexto(fila.imagenurl || fila.imagenUrl) || productoExistente.imagenUrl;
      productoExistente.proveedorId = proveedor._id;
      productoExistente.disponible = disponible;
      productoExistente.activo = true;
      return await productoExistente.save();
    }

    return await Producto.create({
      sku,
      nombre,
      precio,
      stock,
      categoria: categoria.slug,
      descripcion: limpiarTexto(fila.descripcion || fila.detalle || ''),
      imagenUrl: limpiarTexto(fila.imagenurl || fila.imagenUrl || ''),
      proveedorId: proveedor._id,
      disponible,
      activo: true,
    });
  }

  async obtenerJobPorId(id, usuario) {
    const job = await repo.obtenerPorId(id);
    if (!job) {
      throw new AppError('Job de importación no encontrado', 404, 'JOB_NOT_FOUND');
    }

    if (usuario.rol !== 'admin' && job.usuarioId.toString() !== usuario.id.toString()) {
      throw new AppError('No tienes permiso para consultar este job de importación', 403, 'FORBIDDEN');
    }

    const total = job.total || 0;
    const procesados = job.procesados || 0;
    const porcentaje = total > 0 ? Math.round((procesados / total) * 100) : 0;

    return {
      importJobId: job._id,
      proveedorId: job.proveedorId,
      estado: job.estado,
      total,
      procesados,
      exitosos: job.exitosos || 0,
      fallidos: job.fallidos || 0,
      porcentaje,
      errores: job.errores || [],
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
