import mongoose from 'mongoose';

const categoriaSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'El slug de la categoría es requerido'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre de la categoría es requerido'],
      trim: true,
    },
    descripcion: {
      type: String,
      default: null,
      trim: true,
    },
    imagenUrl: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Categoria', categoriaSchema, 'categorias');
