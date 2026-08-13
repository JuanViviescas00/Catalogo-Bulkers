import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import env from '../src/config/env.js';
import jwt from 'jsonwebtoken';

describe('Pruebas de Integración: Módulo Proveedores', () => {
  let adminToken;
  let userToken;
  let adminUserId = new mongoose.Types.ObjectId();
  let normalUserId = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGO_URI);
    }

    adminToken = jwt.sign({ sub: adminUserId, rol: 'admin' }, env.JWT_SECRET, { expiresIn: '1h' });
    userToken = jwt.sign({ sub: normalUserId, rol: 'user' }, env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  const nuevoProveedor = {
    nombre: `Proveedor Test ${Date.now()}`,
    slug: `proveedor-test-${Date.now()}`,
    contactoEmail: 'contacto@proveedor.com',
  };

  it('Debe denegar acceso 403 a rol "user" al intentar crear un proveedor', async () => {
    const res = await request(app)
      .post('/api/proveedores')
      .set('Authorization', `Bearer ${userToken}`)
      .send(nuevoProveedor);

    expect(res.statusCode).toEqual(403);
  });

  it('Debe permitir a rol "admin" crear un nuevo proveedor (201)', async () => {
    const res = await request(app)
      .post('/api/proveedores')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(nuevoProveedor);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.slug).toEqual(nuevoProveedor.slug);
    expect(res.body.activo).toEqual(true);
  });

  it('Debe rechazar la creación de un proveedor con slug duplicado (409)', async () => {
    const res = await request(app)
      .post('/api/proveedores')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(nuevoProveedor);

    expect(res.statusCode).toEqual(409);
  });
});
