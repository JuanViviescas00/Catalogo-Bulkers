import Usuario from './usuario.model.js';

export class AuthRepository {
  async crearUsuario(datos) {
    return await Usuario.create(datos);
  }

  async buscarPorEmail(email, incluirPassword = false) {
    const consulta = Usuario.findOne({ email });
    if (incluirPassword) {
      consulta.select('+password');
    }
    return await consulta.exec();
  }

  async buscarPorId(id) {
    return await Usuario.findById(id);
  }
}

export default AuthRepository;
