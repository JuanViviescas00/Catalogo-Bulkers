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
          descripcion: 'Lámpara portátil de escritorio con batería de 2000mAh y control táctil.',
          imagenUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop',
          proveedorId: proveedor._id,
          disponible: true,
          activo: true,
        },
        {
          sku: 'AUD-020',
          nombre: 'Audífonos Bluetooth con Cancelación de Ruido',
          precio: 149000,
          stock: 35,
          categoria: 'electronica',
          descripcion: 'Audífonos inalámbricos con micrófono integrado y hasta 30 horas de batería.',
          imagenUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop',
          proveedorId: proveedor._id,
          disponible: true,
          activo: true,
        },
        {
          sku: 'TEC-030',
          nombre: 'Teclado Mecánico Retroiluminado USB',
          precio: 128000,
          stock: 28,
          categoria: 'electronica',
          descripcion: 'Teclado compacto con switches mecánicos, conexión USB y retroiluminación ajustable.',
          imagenUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop',
          proveedorId: proveedor._id,
          disponible: true,
          activo: true,
        },
        {
          sku: 'MOU-031',
          nombre: 'Mouse Inalámbrico Ergonómico',
          precio: 59000,
          stock: 70,
          categoria: 'electronica',
          descripcion: 'Mouse silencioso de precisión con conexión inalámbrica y diseño cómodo para uso diario.',
          imagenUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&auto=format&fit=crop',
          proveedorId: proveedor._id,
          disponible: true,
          activo: true,
        },
        {
          sku: 'ORG-040',
          nombre: 'Organizador Modular de Escritorio',
          precio: 36000,
          stock: 55,
          categoria: 'hogar',
          descripcion: 'Organizador con compartimentos para mantener en orden útiles, accesorios y documentos.',
          imagenUrl: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=500&auto=format&fit=crop',
          proveedorId: proveedor._id,
          disponible: true,
          activo: true,
        },
        {
          sku: 'CAF-050',
          nombre: 'Cafetera de Goteo 12 Tazas',
          precio: 119000,
          stock: 18,
          categoria: 'hogar',
          descripcion: 'Cafetera programable con jarra de vidrio, filtro reutilizable y función antigoteo.',
          imagenUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop',
          proveedorId: proveedor._id,
          disponible: true,
          activo: true,
        },
        {
          sku: 'ESC-110',
          nombre: 'Escalera Plegable de Aluminio 4 Peldaños',
          precio: 215000,
          stock: 12,
          categoria: 'herramientas',
          descripcion: 'Escalera liviana y resistente con peldaños antideslizantes para el hogar y el taller.',
          imagenUrl: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500&auto=format&fit=crop',
          proveedorId: proveedor._id,
          disponible: true,
          activo: true,
        },
        {
          sku: 'CIN-120',
          nombre: 'Cinta Métrica Profesional de 8 Metros',
          precio: 27000,
          stock: 90,
          categoria: 'herramientas',
          descripcion: 'Cinta métrica reforzada con gancho magnético, freno y carcasa resistente a impactos.',
          imagenUrl: 'https://images.unsplash.com/photo-1581147036324-c17ac41d8ba9?w=500&auto=format&fit=crop',
          proveedorId: proveedor._id,
          disponible: true,
          activo: true,
        },
        {
          sku: 'ASP-060',
          nombre: 'Aspiradora Portátil Multiuso',
          precio: 175000,
          stock: 20,
          categoria: 'hogar',
          descripcion: 'Aspiradora compacta para limpieza seca de muebles, vehículos y espacios pequeños.',
          imagenUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&auto=format&fit=crop',
          proveedorId: proveedor._id,
          disponible: true,
          activo: true,
        },
      ];

    for (const producto of productosDemo) {
      await Producto.updateOne(
        { sku: producto.sku },
        { $setOnInsert: producto },
        { upsert: true }
      );
    }

    console.log(` [SEED] Catálogo verificado: ${productosDemo.length} productos de demostración disponibles.`);
  } catch (error) {
    console.error('❌ [SEED] Error durante el proceso de siembra:', error.message);
  }
};

if (process.argv[1] && process.argv[1].includes('seed.js')) {
  sembrarAdmin().then(() => mongoose.connection.close());
}

export default sembrarAdmin;
