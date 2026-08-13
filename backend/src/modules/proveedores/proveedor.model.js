import mongoose from 'mongoose';

const proveedorSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del proveedor es requerido'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'El slug es requerido'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    contactoEmail: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },
    logoUrl: {
      type: String,
      default: null,
      trim: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Proveedor', proveedorSchema, 'proveedores');
