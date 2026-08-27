import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import env from '../config/env.js';
import Usuario from '../modules/auth/usuario.model.js';
import Proveedor from '../modules/proveedores/proveedor.model.js';
import Categoria from '../modules/categorias/categoria.model.js';
import Producto from '../modules/productos/producto.model.js';

export const sembrarAdmin = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGO_URI);
    }

    // 1. Usuario Admin
    const adminExistente = await Usuario.findOne({ email: 'admin@demo.com' });

    if (!adminExistente) {
      const hashedPassword = await bcrypt.hash('secreta123', 10);
      await Usuario.create({
        email: 'admin@demo.com',
        password: hashedPassword,
        rol: 'admin',
      });
      console.log(' [SEED] Usuario administrador creado: admin@demo.com / secreta123');
    }

    // 2. Proveedor Inicial
    let proveedor = await Proveedor.findOne({ slug: 'bulkers-distribuciones' });
    if (!proveedor) {
      proveedor = await Proveedor.create({
        nombre: 'Bulkers Distribuciones',
        slug: 'bulkers-distribuciones',
        contactoEmail: 'contacto@bulkers.com',
        logoUrl: 'https://placehold.co/200x200?text=Bulkers',
        activo: true,
      });
      console.log(' [SEED] Proveedor inicial creado: Bulkers Distribuciones');
    }

    // 3. Categorías Iniciales
    const categoriasDemo = [
      { nombre: 'Electrónica', slug: 'electronica', descripcion: 'Equipos y accesorios electrónicos', imagenUrl: 'https://placehold.co/400x300?text=Electronica' },
      { nombre: 'Herramientas', slug: 'herramientas', descripcion: 'Herramientas de trabajo pesado y taller', imagenUrl: 'https://placehold.co/400x300?text=Herramientas' },
      { nombre: 'Hogar', slug: 'hogar', descripcion: 'Artículos para el hogar y oficina', imagenUrl: 'https://placehold.co/400x300?text=Hogar' },
    ];

    for (const cat of categoriasDemo) {
      const existeCat = await Categoria.findOne({ slug: cat.slug });
      if (!existeCat) {
        await Categoria.create(cat);
      }
    }

    // 4. Productos Iniciales de Demostración
    const countProductos = await Producto.countDocuments();
    if (countProductos === 0) {
      const productosDemo = [
        {
          sku: 'BLK-001',
          nombre: 'Empaque Multiuso Bulk X50',
          precio: 25000,
          stock: 150,
          categoria: 'hogar',
          descripcion: 'Caja con 50 empaques reutilizables para almacenamiento masivo.',
          imagenUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop',
          proveedorId: proveedor._id,
          disponible: true,
          activo: true,
        },
        {
          sku: 'HERR-100',
          nombre: 'Set Herramientas Pro 100Pzs',
          precio: 180000,
          stock: 45,
          categoria: 'herramientas',
          descripcion: 'Juego de herramientas profesionales de cromo vanadio en maletín.',
          imagenUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&auto=format&fit=crop',
          proveedorId: proveedor._id,
          disponible: true,
          activo: true,
        },
        {
          sku: 'CHG-065',
          nombre: 'Cargador Rápido USB-C 65W',
          precio: 65000,
          stock: 80,
          categoria: 'electronica',
          descripcion: 'Cargador de pared de carga ultrarrápida GaN para laptops y smartphones.',
          imagenUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop',
          proveedorId: proveedor._id,
          disponible: true,
          activo: true,
        },
        {
          sku: 'LMP-010',
          nombre: 'Lámpara LED Recargable',
          precio: 42000,
          stock: 120,
          categoria: 'hogar',
          descripcion: 'Lámpara portatil de escritorio con batería de 2000mAh y control táctil.',
          imagenUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop',
          proveedorId: proveedor._id,
          disponible: true,
          activo: true,
        },
      ];

      await Producto.insertMany(productosDemo);
      console.log(' [SEED] Productos de demostración creados exitosamente (4 ítems).');
    }
  } catch (error) {
    console.error('❌ [SEED] Error durante el proceso de siembra:', error.message);
  }
};

if (process.argv[1] && process.argv[1].includes('seed.js')) {
  sembrarAdmin().then(() => mongoose.connection.close());
}

export default sembrarAdmin;
