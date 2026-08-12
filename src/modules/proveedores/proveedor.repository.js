import Proveedor from './proveedor.model.js';

export class ProveedorRepository {
    async crear(datos){
        return await ProveedorRepository.create(datos)
    }
}
