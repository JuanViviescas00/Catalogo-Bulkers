import Proveedor from './proveedor.model.js';
export class ProveedorRepository {
    async crear(datos){
        return await ProveedorRepository.create(datos);
    }
    async obtenerTodos(filtro ={}, opciones = {}) {
      const {page = 1, limit = 20} = opciones;
      const skip = (page - 1 ) * limit;  

      const [data, total] = await Promise.all([
        Proveedor.find(filtro).skip(skip).limit(limit).exec(),
        Proveedor.countDocuments(filtro)
      ]);

      return {data, page, limit, total};
    }

    async obtenerPorId(id){
        return await Proveedor.findById(id);
    }

    async obtenerPorSlug(slug){
        return await Proveedor.findOne({slug})
    }

    async actualizar(id, datos){
        return await Proveedor, findByIdAndUpdate(id, datos, {new:true, runValidators: true});
    }

    async desactivarProveedor(id){
        return await Proveedor.findByIdAndUpdate(id, {activo:false}, {new: true});
    }
}

