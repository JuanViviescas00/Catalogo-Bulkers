import CategoriaService from './categoria.service.js';

const service = new CategoriaService();

export const listarCategorias = async (req, res, next) => {
  try {
    const categorias = await service.listarCategorias();
    res.status(200).json(categorias);
  } catch (error) {
    next(error);
  }
};

export const obtenerCategoriaPorSlug = async (req, res, next) => {
  try {
    const categoria = await service.obtenerPorSlug(req.params.slug);
    res.status(200).json(categoria);
  } catch (error) {
    next(error);
  }
};

export const actualizarCategoria = async (req, res, next) => {
  try {
    const actualizada = await service.actualizarCategoria(req.params.id, req.body);
    res.status(200).json(actualizada);
  } catch (error) {
    next(error);
  }
};
