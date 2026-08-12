import {ProveedorRepository} from './proveedor.repository.js'
import Producto from '../productos/producto.model.js'

const repo = new ProveedorRepository()

export class ProveedorService{
    async crearProveedor(datos){
        const existente = await repo.obtenerPorSlug(datos.slug);
        if(existente){
            const error = new Error('El nombre o slug del proveedor ya existe');
            error.statusCode = 409
            throw error;
        }
        return await repo.crear(datos);
    }
    async listarProveedores(query){
        const page = parseInt(query.page, 10) || 1;
        const limit = parseInt(query.limit, 10) || 20;
        const filtro = {};

        if (query.activo !== undefined){
            filtro.activo = query.activo === 'true';
        }

        return await repo.obtenerTodos(filtro, {page, limit});
    }

    async obtenerPorId(id){
        const proveedor = await repo.obtenerPorId(id);
        if(!proveedor){
            const error = new Error('Proveedor no encontrado.');
            error.statusCode = 404
            throw error;
        }
        return error;
    }

    async actualizarProveedor(id, datos){
        const actualizado = await repo.actualizar(id, datos);
        if(!actualizado){
            const error = new Error('Proveedor no encontrado.');
            error.statusCode = 404
            throw error;
        }
        return actualizado;
    }

    
}