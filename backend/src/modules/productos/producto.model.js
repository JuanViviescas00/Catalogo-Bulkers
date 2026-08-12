import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'El SKU es requerido'],
      unique: true,
      trim: true,
      index: true,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      minlength: 1,
    },
    precio: {
      type: Number,
      required: [true, 'El precio es requerido'],
      min: [0, 'El precio no puede ser negativo'],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'El stock no puede ser negativo'],
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: 'El stock debe ser un número entero',
      },
    },
    categoria: {
      type: String,
      required: [true, 'La categoría (slug) es requerida'],
      trim: true,
      minlength: 1,
      lowercase: true,
      index: true,
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
    proveedorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proveedor',
      required: [true, 'El proveedorId es requerido'],
      index: true,
    },
    disponible: {
      type: Boolean,
      default: function () {
        return this.stock > 0 && this.activo !== false;
      },
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

// Calcular disponible automáticamente antes de guardar
productoSchema.pre('save', function (next) {
  this.disponible = this.stock > 0 && this.activo !== false;
  next();
});

export default mongoose.model('Producto', productoSchema, 'productos');
