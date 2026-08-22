import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import env from '../config/env.js';
import Usuario from '../modules/auth/usuario.model.js';

export const sembrarAdmin = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGO_URI);
    }

    const adminExistente = await Usuario.findOne({ email: 'admin@demo.com' });

    if (!adminExistente) {
      const hashedPassword = await bcrypt.hash('secreta123', 10);
      await Usuario.create({
        email: 'admin@demo.com',
        password: hashedPassword,
        rol: 'admin',
      });
      console.log(' [SEED] Usuario administrador creado exitosamente:');
      console.log('   Email: admin@demo.com');
      console.log('   Password: secreta123');
      console.log('   Rol: admin');
    } else {
      console.log('ℹ️ [SEED] El usuario administrador admin@demo.com ya existe.');
    }
  } catch (error) {
    console.error('❌ [SEED] Error al crear usuario administrador:', error.message);
  }
};

if (process.argv[1] && process.argv[1].includes('seed.js')) {
  sembrarAdmin().then(() => mongoose.connection.close());
}

export default sembrarAdmin;
