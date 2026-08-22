import UsuarioService from './usuario.service.js';

const service = new UsuarioService();

export const crearUsuario = async (req, res, next) => {
  try {
    const usuario = await service.crearUsuario(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    next(error);
  }
};

export const listarUsuarios = async (req, res, next) => {
  try {
    const usuarios = await service.listarUsuarios(req.query);
    res.status(200).json(usuarios);
  } catch (error) {
    next(error);
  }
};

export const obtenerUsuarioPorId = async (req, res, next) => {
  try {
    const usuario = await service.obtenerPorId(req.params.id);
    res.status(200).json(usuario);
  } catch (error) {
    next(error);
  }
};

export const actualizarUsuario = async (req, res, next) => {
  try {
    const usuarioActualizado = await service.actualizarUsuario(req.params.id, req.body);
    res.status(200).json(usuarioActualizado);
  } catch (error) {
    next(error);
  }
};

export const eliminarUsuario = async (req, res, next) => {
  try {
    const usuarioEliminado = await service.eliminarUsuario(req.params.id);
    res.status(200).json({
      message: 'Usuario eliminado',
      data: usuarioEliminado,
    });
  } catch (error) {
    next(error);
  }
};
